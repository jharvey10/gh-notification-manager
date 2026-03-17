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
 * timeline event data. GitHub only surfaces a single "most important"
 * reason per notification, so we cross-check _latestEvents to pick up
 * mentions and assignments the reason field may hide.
 *
 * @type {import('../Pipeline.js').PipelineProcessor}
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

  const events = notification._latestEvents?.curr ?? []
  if (context.viewerLogin) {
    const mention = events.find((e) => e.type === 'mention')
    if (mention && mention.actor === context.viewerLogin) {
      tags.push('direct_mention')
    }
    const assign = events.find((e) => e.type === 'assign')
    if (assign && assign.actor === context.viewerLogin) {
      tags.push('assigned')
    }
  }

  notification.tags = [...new Set([...(notification.tags ?? []), ...tags])]
  return notification
}
