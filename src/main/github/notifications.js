const { getGraphql } = require('./client');
const { NOTIFICATION_QUERY } = require('./queries/notifications');
const store = require('../store');

const MAX_NOTIFICATIONS = 1000;

async function fetchNotifications() {
  const gql = getGraphql();
  const allNodes = [];
  let cursor = null;

  while (allNodes.length < MAX_NOTIFICATIONS) {
    const data = await gql(NOTIFICATION_QUERY, { cursor });
    const { nodes, pageInfo } = data.viewer.notificationThreads;

    allNodes.push(...nodes);

    if (!pageInfo.hasNextPage) break;
    if (nodes.some((n) => store.has(n.id))) break;
    cursor = pageInfo.endCursor;
  }

  return allNodes;
}

module.exports = { fetchNotifications };
