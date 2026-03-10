/**
 * Tags notifications with direct_review (you personally) or
 * team_review (one of your teams) based on the PR's current review
 * request list — regardless of what notification.reason reports,
 * since GitHub only surfaces the single most "important" reason.
 */
export async function reviewTypeTagProcessor(notification, context) {
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

  if (tags.length > 0) {
    notification.tags = [...new Set([...(notification.tags ?? []), ...tags])]
  }
  return notification
}
