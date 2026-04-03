import { createHash } from 'node:crypto'
import { LRUCache } from 'lru-cache'
import { getGraphql } from './client.js'
import { fetchNotificationThreads, fetchSubjectNodeIds } from './restNotifications.js'
import { buildEnrichmentQueries, extractEnrichmentResults } from './queries/enrichSubjects.js'
import { extractLatestEvents } from './extractLatestEvents.js'

/** @typedef {import('./queries/fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode */

const MAX_NOTIFICATIONS = 1000
const FULL_REFRESH_INTERVAL_MS = 10 * 60 * 1000

/**
 * Fetches GitHub notification threads via REST and enriches them via GraphQL.
 *
 * REST gives us the notification list efficiently (with 304 support and
 * poll-interval headers). GraphQL gives us the rich subject data (PR state,
 * reviews, timeline events, etc.) needed for classification.
 *
 * We only enrich threads whose `updated_at` has changed since last poll,
 * keeping GraphQL costs minimal. On REST 304 (nothing changed), we skip
 * GraphQL entirely.
 */
class GitHubNotifications {
  #cache = new Map()
  #updatedAtCache = new Map()
  #previousEvents = new LRUCache({ max: MAX_NOTIFICATIONS })
  #lastFullRefreshAt = 0
  #lastPollInterval = 60_000

  get pollInterval() {
    return this.#lastPollInterval
  }

  #hash(notification) {
    return createHash('md5').update(JSON.stringify(notification)).digest('hex')
  }

  #mergeToNode(thread, subject) {
    return {
      id: thread.threadId,
      title: thread.title,
      threadType: thread.subjectType,
      url: thread.webUrl,
      reason: thread.reason,
      lastUpdatedAt: thread.updatedAt,
      optionalSubject: subject ?? null,
      optionalList: {
        nameWithOwner: `${thread.owner}/${thread.repo}`,
        name: thread.repo,
        owner: { login: thread.owner }
      }
    }
  }

  /**
   * Enrich REST threads via GraphQL. Only threads whose updated_at differs
   * from cache are enriched; the rest reuse cached subject data.
   */
  async #enrichThreads(threads) {
    const needsEnrichment = threads.filter((t) => {
      const cached = this.#updatedAtCache.get(t.threadId)
      return cached !== t.updatedAt
    })

    if (needsEnrichment.length === 0) {
      return new Map()
    }

    const nodeIdTargets = needsEnrichment.filter(
      (t) => t.subjectType === 'Release' || t.subjectType === 'CheckSuite'
    )
    const nodeIds = nodeIdTargets.length > 0 ? await fetchSubjectNodeIds(nodeIdTargets) : new Map()

    const targets = needsEnrichment
      .map((t) => {
        const base = {
          threadId: t.threadId,
          owner: t.owner,
          repo: t.repo,
          subjectType: t.subjectType,
          subjectNumber: t.subjectNumber
        }
        if (t.subjectType === 'Release' || t.subjectType === 'CheckSuite') {
          base.nodeId = nodeIds.get(t.threadId)
          base.subjectNumber = null
        }
        return base
      })
      .filter(
        (t) =>
          (t.subjectNumber !== null && t.subjectNumber !== undefined) ||
          (t.nodeId !== null && t.nodeId !== undefined)
      )

    if (targets.length === 0) {
      return new Map()
    }

    const batches = buildEnrichmentQueries(targets)
    const gql = getGraphql()
    const allResults = new Map()

    const t0 = performance.now()
    const batchPromises = batches.map(async ({ query, mapping }, idx) => {
      try {
        const t1 = performance.now()
        const data = await gql(query)
        console.debug(
          `[timing] GQL enrichment batch ${idx + 1}/${batches.length} (${mapping.size} subjects): ${(performance.now() - t1).toFixed(0)}ms`
        )
        const results = extractEnrichmentResults(data, mapping)
        for (const [threadId, subject] of results) {
          allResults.set(threadId, subject)
        }
      } catch (err) {
        console.error('Enrichment query failed:', err.message)
        for (const threadId of mapping.values()) {
          allResults.set(threadId, null)
        }
      }
    })

    await Promise.all(batchPromises)
    console.debug(
      `[timing] GQL enrichment total (${batches.length} batches, ${targets.length} targets): ${(performance.now() - t0).toFixed(0)}ms`
    )
    return allResults
  }

  #enrichWithEvents(node, prevEntry) {
    const curr = extractLatestEvents(node)
    const saved = prevEntry ?? this.#previousEvents.get(node.id)
    const prev = saved?.events ?? []

    return {
      ...node,
      _latestEvents: { prev, curr }
    }
  }

  #buildCacheEntry(node) {
    const events = extractLatestEvents(node)
    this.#previousEvents.set(node.id, { events })
    return { hash: this.#hash(node), events, subject: node.optionalSubject }
  }

  #getCachedSubject(threadId) {
    return this.#cache.get(threadId)?.subject ?? null
  }

  #reconcileFull(fetched) {
    const updates = new Map()

    for (const [id, oldEntry] of this.#cache) {
      const node = fetched.get(id)
      if (!node) {
        updates.set(id, null)
      } else if (this.#hash(node) !== oldEntry.hash) {
        updates.set(id, this.#enrichWithEvents(node, oldEntry))
      }
    }

    for (const [id, node] of fetched) {
      if (!this.#cache.has(id)) {
        updates.set(id, this.#enrichWithEvents(node, null))
      }
    }

    this.#cache.clear()
    this.#updatedAtCache.clear()
    for (const [id, node] of fetched) {
      this.#cache.set(id, this.#buildCacheEntry(node))
      this.#updatedAtCache.set(id, node.lastUpdatedAt)
    }

    this.#lastFullRefreshAt = Date.now()
    return updates
  }

  invalidate(ids) {
    for (const id of ids) {
      this.#cache.delete(id)
      this.#updatedAtCache.delete(id)
    }
  }

  /**
   * @returns {Promise<{ updates: Map<string, GitHubNotificationNode | null>, pollInterval: number }>}
   */
  async fetchNotifications() {
    const isFullRefresh = Date.now() >= this.#lastFullRefreshAt + FULL_REFRESH_INTERVAL_MS

    const tRest = performance.now()
    const { threads, pollInterval, notModified } = await fetchNotificationThreads({
      fullRefresh: isFullRefresh
    })
    console.debug(
      `[timing] fetchNotificationThreads (full=${isFullRefresh}): ${(performance.now() - tRest).toFixed(0)}ms — ${threads.length} threads, notModified=${notModified}`
    )

    this.#lastPollInterval = pollInterval

    if (notModified) {
      return { updates: new Map(), pollInterval }
    }

    const tEnrich = performance.now()
    const enriched = await this.#enrichThreads(threads)
    console.debug(
      `[timing] enrichThreads: ${(performance.now() - tEnrich).toFixed(0)}ms — ${enriched.size} enriched`
    )

    const fetched = new Map()
    for (const thread of threads) {
      const subject = enriched.has(thread.threadId)
        ? enriched.get(thread.threadId)
        : this.#getCachedSubject(thread.threadId)

      const node = this.#mergeToNode(thread, subject)
      fetched.set(thread.threadId, node)
    }

    if (isFullRefresh) {
      const result = this.#reconcileFull(fetched)
      return { updates: result, pollInterval }
    }

    const updates = new Map()
    for (const [id, node] of fetched) {
      const hash = this.#hash(node)
      const cached = this.#cache.get(id)

      if (cached?.hash !== hash) {
        updates.set(id, this.#enrichWithEvents(node, cached ?? null))
        this.#cache.set(id, this.#buildCacheEntry(node))
        this.#updatedAtCache.set(id, node.lastUpdatedAt)
      }
    }

    return { updates, pollInterval }
  }
}

export { GitHubNotifications, extractLatestEvents }
