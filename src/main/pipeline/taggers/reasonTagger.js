/**
 * Tags notifications based on the reason field for mention types.
 */
export async function reasonTagger(notification) {
  const reason = notification.reason?.toLowerCase()

  if (reason === 'mention') return ['direct_mention']
  if (reason === 'team_mention') return ['team_mention']
  if (reason === 'assign') return ['assigned']
  if (reason === 'author') return ['author']
  if (reason === 'ci_activity') return ['ci']
  if (reason === 'comment') return ['comment']
  if (reason === 'state_change') return ['state_change']
  if (reason === 'review_requested') return ['review_requested']

  console.warn('unknown reason', reason)
  return ['unknown_reason']
}
