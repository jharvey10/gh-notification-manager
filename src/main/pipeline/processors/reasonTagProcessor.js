const REASON_TAGS = Object.freeze({
  mention: 'direct_mention',
  team_mention: 'team_mention',
  assign: 'assigned',
  author: 'author',
  ci_activity: 'ci',
  comment: 'comment',
  state_change: 'state_change'
})

export async function reasonTagProcessor(notification) {
  const reason = notification.reason?.toLowerCase()

  // This is handled by the reviewTypeTagProcessor
  if (reason === 'review_requested') {
    return notification
  }

  const tag = REASON_TAGS[reason]
  if (!tag) {
    console.warn('unknown reason', reason)
    notification.tags = [...new Set([...(notification.tags ?? []), 'unknown_reason'])]
    return notification
  }

  notification.tags = [...new Set([...(notification.tags ?? []), tag])]
  return notification
}
