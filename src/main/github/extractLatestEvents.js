const EVENT_EXTRACTORS = [
  {
    key: 'latestComment',
    type: 'comment',
    actor: (n) => n.author?.login,
    time: (n) => n.createdAt
  },
  {
    key: 'latestReview',
    type: 'review',
    actor: (n) => n.author?.login,
    time: (n) => n.submittedAt,
    detail: (n) => n.state
  },
  { key: 'latestMention', type: 'mention', actor: (n) => n.actor?.login, time: (n) => n.createdAt },
  {
    key: 'latestAssignment',
    type: 'assign',
    actor: (n) => n.assignee?.login,
    time: (n) => n.createdAt
  },
  {
    key: 'latestReviewRequest',
    type: 'review_requested',
    actor: (n) => n.requestedReviewer?.login,
    time: (n) => n.createdAt
  },
  {
    key: 'latestClosedEvent',
    type: 'closed',
    actor: (n) => n.actor?.login,
    time: (n) => n.createdAt,
    detail: (n) => n.stateReason
  },
  {
    key: 'latestReopenedEvent',
    type: 'reopened',
    actor: (n) => n.actor?.login,
    time: (n) => n.createdAt,
    detail: (n) => n.stateReason
  },
  {
    key: 'latestMergedEvent',
    type: 'merged',
    actor: (n) => n.actor?.login,
    time: (n) => n.createdAt
  },
  {
    key: 'latestReadyForReviewEvent',
    type: 'ready_for_review',
    actor: (n) => n.actor?.login,
    time: (n) => n.createdAt
  },
  {
    key: 'latestReviewDismissedEvent',
    type: 'review_dismissed',
    actor: (n) => n.actor?.login,
    time: (n) => n.createdAt,
    detail: (n) => n.previousReviewState
  }
]

function extractLatestEvents(node) {
  const subject = node.optionalSubject
  if (!subject) {
    return []
  }

  const events = []
  for (const { key, type, actor, time, detail } of EVENT_EXTRACTORS) {
    const eventNode = subject[key]?.nodes?.[0]
    if (!eventNode) {
      continue
    }
    const timestamp = time(eventNode)
    if (!timestamp) {
      continue
    }
    events.push({
      type,
      actor: actor(eventNode) ?? null,
      timestamp,
      detail: detail ? (detail(eventNode) ?? null) : null
    })
  }
  return events
}

export { extractLatestEvents }
