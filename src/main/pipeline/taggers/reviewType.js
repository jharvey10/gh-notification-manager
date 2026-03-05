const YOUR_LOGIN = 'jharvey10';

/**
 * Tags review_requested notifications as either direct_review
 * (you personally) or team_review (one of your teams).
 */
async function reviewTypeTagger(notification) {
  if (notification.reason !== 'REVIEW_REQUESTED') return [];

  const nodes = notification.optionalSubject?.reviewRequests?.nodes;
  if (!Array.isArray(nodes)) return [];

  const tags = [];

  for (const { requestedReviewer: reviewer } of nodes) {
    if (reviewer?.__typename === 'User' && reviewer.login === YOUR_LOGIN) {
      tags.push('direct_review');
    }
    if (reviewer?.__typename === 'Team') {
      tags.push('team_review');
    }
  }

  return tags;
}

module.exports = { reviewTypeTagger };
