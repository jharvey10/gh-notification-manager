import { createHash } from 'node:crypto'
import { getGraphql } from './client.js'
import { NOTIFICATION_QUERY } from './queries/fetchNotifications.js'

const MAX_NOTIFICATIONS = 1000
const FULL_REFRESH_INTERVAL_MS = 10 * 60 * 1000

class GitHubNotifications {
  #cache = new Map()
  #lastFullRefreshAt = 0

  #hash(notification) {
    return createHash('md5').update(JSON.stringify(notification)).digest('hex')
  }

  async #fetchAllPages() {
    const gql = getGraphql()
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

  async #fetchFirstPage() {
    const gql = getGraphql()
    const data = await gql(NOTIFICATION_QUERY, { cursor: null })
    return data.viewer.notificationThreads.nodes
  }

  #reconcileFull(fetched) {
    const updates = new Map()

    // Pass 1: walk cache — find deleted and changed notifications
    for (const [id, oldHash] of this.#cache) {
      const node = fetched.get(id)
      if (!node) {
        updates.set(id, null)
      } else if (this.#hash(node) !== oldHash) {
        updates.set(id, node)
      }
    }

    // Pass 2: walk fetched — find net-new notifications
    for (const [id, node] of fetched) {
      if (!this.#cache.has(id)) {
        updates.set(id, node)
      }
    }

    this.#cache.clear()
    for (const [id, node] of fetched) {
      this.#cache.set(id, this.#hash(node))
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

      if (cached !== hash) {
        updates.set(node.id, node)
        this.#cache.set(node.id, hash)
      }
    }

    return updates
  }
}

export { GitHubNotifications }
