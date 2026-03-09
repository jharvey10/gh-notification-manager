import { getGraphql } from '../../github/client.js'
import { VIEWER_LOGIN_QUERY } from '../../github/queries/viewer.js'

let cachedGraphqlClient = null
let cachedViewerLoginPromise = null

async function getViewerLogin() {
  const gql = getGraphql()

  if (gql !== cachedGraphqlClient) {
    cachedGraphqlClient = gql
    cachedViewerLoginPromise = gql(VIEWER_LOGIN_QUERY).then((data) => data.viewer.login)
  }

  return cachedViewerLoginPromise
}

/**
 * Tags review_requested notifications as either direct_review
 * (you personally) or team_review (one of your teams).
 */
export async function reviewTypeTagProcessor(notification) {
  if (notification.reason?.toLowerCase() !== 'review_requested') return notification

  const nodes = notification.optionalSubject?.reviewRequests?.nodes
  if (!Array.isArray(nodes)) return notification
  const viewerLogin = await getViewerLogin()

  const tags = []

  for (const { requestedReviewer: reviewer } of nodes) {
    if (reviewer?.__typename === 'User' && reviewer.login === viewerLogin) {
      tags.push('direct_review')
    }
    if (reviewer?.__typename === 'Team') {
      tags.push('team_review')
    }
  }

  notification.tags = [...new Set([...(notification.tags ?? []), ...tags])]
  return notification
}
