import { createHash } from 'node:crypto'
import { getGraphql } from './client.js'
import { NOTIFICATION_QUERY } from './queries/fetchNotifications.js'

/** @typedef {import('./queries/fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode */

const MAX_NOTIFICATIONS = 1000
const FULL_REFRESH_INTERVAL_MS = 10 * 60 * 1000

function extractDirectEventTimestamps(node) {
  const subject = node.optionalSubject
  if (!subject) return { lastMentionedAt: null, lastAssignedAt: null, lastReviewRequestedAt: null }

  const mentionNode = subject.latestMention?.nodes?.[0]
  const assignNode = subject.latestAssignment?.nodes?.[0]
  const reviewNode = subject.latestReviewRequest?.nodes?.[0]

  return {
    lastMentionedAt: mentionNode?.createdAt ?? null,
    lastAssignedAt: assignNode?.createdAt ?? null,
    lastReviewRequestedAt: reviewNode?.createdAt ?? null,
    mentionedLogin: mentionNode?.actor?.login ?? null,
    assignedLogin: assignNode?.assignee?.login ?? null,
    reviewRequestedLogin: reviewNode?.requestedReviewer?.login ?? null
  }
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
 * Alongside each hash we also cache the timestamps of the latest
 * MentionedEvent, AssignedEvent, and ReviewRequestedEvent from the
 * thread's timeline. When a thread comes back as changed, we attach both
 * the previous and current timestamps (as `_directEvents`) so downstream
 * processors can tell whether a particular direct event (mention,
 * assignment, review request) is genuinely new vs. already seen. This is
 * what powers the per-rule OS notification logic. The silent first poll seeds
 * the cache, and subsequent polls compare against it.
 *
 * `invalidate(ids)` lets the rest of the app force a re-fetch for
 * specific threads (e.g. after marking something as done or read).
 */
class GitHubNotifications {
  #cache = new Map()
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

  #enrichWithTimestamps(node, prevEntry) {
    const curr = extractDirectEventTimestamps(node)
    const prev = prevEntry
      ? {
          lastMentionedAt: prevEntry.lastMentionedAt,
          lastAssignedAt: prevEntry.lastAssignedAt,
          lastReviewRequestedAt: prevEntry.lastReviewRequestedAt
        }
      : { lastMentionedAt: null, lastAssignedAt: null, lastReviewRequestedAt: null }

    return { ...node, _directEvents: { prev, curr } }
  }

  #buildCacheEntry(node) {
    const timestamps = extractDirectEventTimestamps(node)
    return {
      hash: this.#hash(node),
      lastMentionedAt: timestamps.lastMentionedAt,
      lastAssignedAt: timestamps.lastAssignedAt,
      lastReviewRequestedAt: timestamps.lastReviewRequestedAt,
      mentionedLogin: timestamps.mentionedLogin,
      assignedLogin: timestamps.assignedLogin,
      reviewRequestedLogin: timestamps.reviewRequestedLogin
    }
  }

  #reconcileFull(fetched) {
    const updates = new Map()

    for (const [id, oldEntry] of this.#cache) {
      const node = fetched.get(id)
      if (!node) {
        updates.set(id, null)
      } else if (this.#hash(node) !== oldEntry.hash) {
        updates.set(id, this.#enrichWithTimestamps(node, oldEntry))
      }
    }

    for (const [id, node] of fetched) {
      if (!this.#cache.has(id)) {
        updates.set(id, this.#enrichWithTimestamps(node, null))
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
        updates.set(node.id, this.#enrichWithTimestamps(node, cached ?? null))
        this.#cache.set(node.id, this.#buildCacheEntry(node))
      }
    }

    return updates
  }
}

export { GitHubNotifications }
