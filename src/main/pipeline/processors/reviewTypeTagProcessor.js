/**
 * Tags review_requested notifications as either direct_review
 * (you personally) or team_review (one of your teams).
 */
export async function reviewTypeTagProcessor(notification, context) {
  if (notification.reason?.toLowerCase() !== 'review_requested') return notification

  const nodes = notification.optionalSubject?.reviewRequests?.nodes
  if (!Array.isArray(nodes)) return notification

  const tags = []

  for (const { requestedReviewer: reviewer } of nodes) {
    if (reviewer?.__typename === 'User' && reviewer.login === context.viewerLogin) {
      tags.push('direct_review')
    }
    if (reviewer?.__typename === 'Team') {
      tags.push('team_review')
    }
  }

  notification.tags = [...new Set([...(notification.tags ?? []), ...tags])]
  return notification
}
