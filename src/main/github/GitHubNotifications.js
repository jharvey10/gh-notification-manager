import { createHash } from 'node:crypto'
import { getGraphql } from './client.js'
import { NOTIFICATION_QUERY } from './queries/fetchNotifications.js'

const MAX_NOTIFICATIONS = 1000
const FULL_REFRESH_INTERVAL_MS = 10 * 60 * 1000

/**
 * @typedef {{ login: string }} GitHubActor
 * @typedef {{ name: string }} GitHubLabel
 * @typedef {{ nodes: GitHubLabel[] }} GitHubLabelConnection
 * @typedef {{ __typename: 'User', login: string } | { __typename: 'Team', slug: string, organization: GitHubActor }} GitHubRequestedReviewer
 * @typedef {{ requestedReviewer: GitHubRequestedReviewer | null }} GitHubReviewRequest
 * @typedef {{ nodes: GitHubReviewRequest[] }} GitHubReviewRequestConnection
 * @typedef {{
 *   __typename: 'PullRequest',
 *   id: string,
 *   state: string,
 *   isDraft: boolean,
 *   merged: boolean,
 *   reviewDecision: string | null,
 *   author: GitHubActor | null,
 *   labels: GitHubLabelConnection | null,
 *   reviewRequests: GitHubReviewRequestConnection | null
 * }} GitHubPullRequestSubject
 * @typedef {{
 *   __typename: 'Issue',
 *   id: string,
 *   state: string,
 *   stateReason: string | null,
 *   author: GitHubActor | null
 * }} GitHubIssueSubject
 * @typedef {{
 *   __typename: 'CheckSuite',
 *   status: string | null,
 *   conclusion: string | null,
 *   commit: { id: string } | null
 * }} GitHubCheckSuiteSubject
 * @typedef {{
 *   __typename: 'Release',
 *   tagName: string,
 *   isPrerelease: boolean,
 *   tagCommit: { id: string } | null
 * }} GitHubReleaseSubject
 * @typedef {{
 *   __typename: 'Discussion',
 *   id: string,
 *   isAnswered: boolean,
 *   stateReason: string | null
 * }} GitHubDiscussionSubject
 * @typedef {GitHubPullRequestSubject | GitHubIssueSubject | GitHubCheckSuiteSubject | GitHubReleaseSubject | GitHubDiscussionSubject} GitHubNotificationSubject
 * @typedef {{
 *   nameWithOwner: string,
 *   name: string,
 *   owner: GitHubActor | null
 * }} GitHubRepositoryList
 * @typedef {{
 *   id: string,
 *   title: string,
 *   threadType: string,
 *   url: string,
 *   reason: string | null,
 *   isUnread: boolean,
 *   isSaved: boolean,
 *   lastUpdatedAt: string,
 *   optionalSubject: GitHubNotificationSubject | null,
 *   optionalList: GitHubRepositoryList | null,
 *   tags?: string[]
 * }} GitHubNotificationNode
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
