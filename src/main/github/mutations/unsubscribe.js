/**
 * @param {string[]} subscribableIds
 * @returns {string}
 */
export function buildUnsubscribeMutation(subscribableIds) {
  const fields = subscribableIds
    .map(
      (id, i) =>
        `a${i}: updateSubscription(input: {subscribableId: "${id}", state: UNSUBSCRIBED}) { subscribable { id } }`
    )
    .join('\n    ')
  return `mutation { ${fields} }`
}
