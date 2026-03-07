import { getGraphql } from './client.js'
import { NOTIFICATION_QUERY } from './queries/fetchNotifications.js'
import * as store from '../store.js'

const MAX_NOTIFICATIONS = 1000

async function fetchNotifications() {
  const gql = getGraphql()
  const allNodes = []
  let cursor = null

  while (allNodes.length < MAX_NOTIFICATIONS) {
    const data = await gql(NOTIFICATION_QUERY, { cursor })
    const { nodes, pageInfo } = data.viewer.notificationThreads

    allNodes.push(...nodes)

    if (!pageInfo.hasNextPage) break
    if (nodes.some((n) => store.has(n.id))) break
    cursor = pageInfo.endCursor
  }

  return allNodes
}

export { fetchNotifications }
