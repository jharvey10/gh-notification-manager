const REASON_TAGS = Object.freeze({
  mention: 'direct_mention',
  team_mention: 'team_mention',
  assign: 'assigned',
  author: 'author',
  ci_activity: 'ci',
  comment: 'comment',
  state_change: 'state_change'
})

/**
 * Tags notifications based on GitHub's reported reason AND the actual
 * direct-event timeline data. GitHub only surfaces a single "most
 * important" reason per notification, so we cross-check _directEvents
 * to pick up mentions and assignments the reason field may hide.
 */
export async function reasonTagProcessor(notification, context) {
  const reason = notification.reason?.toLowerCase()
  const tags = []

  if (reason && reason !== 'review_requested') {
    const reasonTag = REASON_TAGS[reason]
    if (reasonTag) {
      tags.push(reasonTag)
    } else {
      console.warn('unknown reason', reason)
      tags.push('unknown_reason')
    }
  }

  const curr = notification._directEvents?.curr
  if (curr && context.viewerLogin) {
    if (curr.lastMentionedAt && curr.mentionedLogin === context.viewerLogin) {
      tags.push('direct_mention')
    }
    if (curr.lastAssignedAt && curr.assignedLogin === context.viewerLogin) {
      tags.push('assigned')
    }
  }

  notification.tags = [...new Set([...(notification.tags ?? []), ...tags])]
  return notification
}
