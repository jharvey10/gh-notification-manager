/**
 * @param {string[]} subscribableIds
 * @param {string[]} threadIds
 * @returns {string}
 */
export function buildUnsubscribeAndMarkDoneMutation(subscribableIds, threadIds) {
  const unsubFields = subscribableIds
    .map(
      (id, i) =>
        `a${i}: updateSubscription(input: {subscribableId: "${id}", state: UNSUBSCRIBED}) { subscribable { id } }`
    )
    .join('\n    ')
  const idList = threadIds.map((id) => `"${id}"`).join(', ')
  return `mutation {
    ${unsubFields}
    markNotificationsAsDone(input: {ids: [${idList}]}) { success }
  }`
}
