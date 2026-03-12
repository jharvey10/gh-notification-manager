import { createHash } from 'node:crypto'
import { LRUCache } from 'lru-cache'
import { getGraphql } from './client.js'
import { NOTIFICATION_QUERY } from './queries/fetchNotifications.js'

/** @typedef {import('./queries/fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode */

const MAX_NOTIFICATIONS = 1000
const FULL_REFRESH_INTERVAL_MS = 10 * 60 * 1000

const EVENT_EXTRACTORS = [
  { key: 'latestComment', type: 'comment', actor: n => n.author?.login, time: n => n.createdAt },
  { key: 'latestReview', type: 'review', actor: n => n.author?.login, time: n => n.submittedAt, detail: n => n.state },
  { key: 'latestMention', type: 'mention', actor: n => n.actor?.login, time: n => n.createdAt },
  { key: 'latestAssignment', type: 'assign', actor: n => n.assignee?.login, time: n => n.createdAt },
  { key: 'latestReviewRequest', type: 'review_requested', actor: n => n.requestedReviewer?.login, time: n => n.createdAt },
  { key: 'latestClosedEvent', type: 'closed', actor: n => n.actor?.login, time: n => n.createdAt, detail: n => n.stateReason },
  { key: 'latestReopenedEvent', type: 'reopened', actor: n => n.actor?.login, time: n => n.createdAt, detail: n => n.stateReason },
  { key: 'latestMergedEvent', type: 'merged', actor: n => n.actor?.login, time: n => n.createdAt },
  { key: 'latestReadyForReviewEvent', type: 'ready_for_review', actor: n => n.actor?.login, time: n => n.createdAt },
  { key: 'latestReviewDismissedEvent', type: 'review_dismissed', actor: n => n.actor?.login, time: n => n.createdAt, detail: n => n.previousReviewState },
]

function extractLatestEvents(node) {
  const subject = node.optionalSubject
  if (!subject) return []

  const events = []
  for (const { key, type, actor, time, detail } of EVENT_EXTRACTORS) {
    const eventNode = subject[key]?.nodes?.[0]
    if (!eventNode) continue
    const timestamp = time(eventNode)
    if (!timestamp) continue
    events.push({
      type,
      actor: actor(eventNode) ?? null,
      timestamp,
      detail: detail ? (detail(eventNode) ?? null) : null
    })
  }
  return events
}

/**
 * Fetches GitHub notification threads via GraphQL and figures out what's
 * actually changed since the last poll.
 *
 * The core idea: we keep an in-memory cache of MD5 hashes per thread. On
 * each poll we compare hashes to find new, changed, and deleted threads,
 * then only emit those as updates. Most polls are "incremental" — just the
 * first page of results. Every 10 minutes we do a full paginated fetch to
 * catch threads that fell off the first page or were removed entirely.
 *
 * Each notification's timeline events (comment, review, mention, assign,
 * state change, etc.) are extracted into a uniform list of
 * `{ type, actor, timestamp, detail }` objects. When a thread changes,
 * we attach both the previous and current event lists (as `_latestEvents`)
 * so downstream processors can determine what's new by comparing the two.
 *
 * `invalidate(ids)` lets the rest of the app force a re-fetch for
 * specific threads (e.g. after marking something as done or read).
 */
class GitHubNotifications {
  #cache = new Map()
  #previousEvents = new LRUCache({ max: MAX_NOTIFICATIONS })
  #lastFullRefreshAt = 0

  #hash(notification) {
    return createHash('md5').update(JSON.stringify(notification)).digest('hex')
  }

  /**
   * @returns {Promise<Map<string, GitHubNotificationNode>>}
   */
  async #fetchAllPages() {
    const gql = getGraphql()
    /** @type {Map<string, GitHubNotificationNode>} */
    const all = new Map()
    let cursor = null

    while (all.size < MAX_NOTIFICATIONS) {
      const data = await gql(NOTIFICATION_QUERY, { cursor })
      const { nodes, pageInfo } = data.viewer.notificationThreads

      for (const node of nodes) {
        all.set(node.id, node)
      }

      if (!pageInfo.hasNextPage) break
      cursor = pageInfo.endCursor
    }

    return all
  }

  /**
   * @returns {Promise<GitHubNotificationNode[]>}
   */
  async #fetchFirstPage() {
    const gql = getGraphql()
    const data = await gql(NOTIFICATION_QUERY, { cursor: null })
    return data.viewer.notificationThreads.nodes
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
    return { hash: this.#hash(node), events }
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
    for (const [id, node] of fetched) {
      this.#cache.set(id, this.#buildCacheEntry(node))
    }

    this.#lastFullRefreshAt = Date.now()
    return updates
  }

  invalidate(ids) {
    for (const id of ids) {
      this.#cache.delete(id)
    }
  }

  async fetchNotifications() {
    if (Date.now() >= this.#lastFullRefreshAt + FULL_REFRESH_INTERVAL_MS) {
      const fetched = await this.#fetchAllPages()
      return this.#reconcileFull(fetched)
    }

    const nodes = await this.#fetchFirstPage()
    const updates = new Map()

    for (const node of nodes) {
      const hash = this.#hash(node)
      const cached = this.#cache.get(node.id)

      if (cached?.hash !== hash) {
        updates.set(node.id, this.#enrichWithEvents(node, cached ?? null))
        this.#cache.set(node.id, this.#buildCacheEntry(node))
      }
    }

    return updates
  }
}

export { GitHubNotifications }
