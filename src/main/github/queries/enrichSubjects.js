/**
 * @typedef {import('./fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode
 * @typedef {import('./fetchNotifications.js').GitHubNotificationSubject} GitHubNotificationSubject
 */

const ENRICH_BATCH_SIZE = 20

const PR_FRAGMENT = `fragment PRFields on PullRequest {
  __typename
  id
  viewerSubscription
  number
  state
  isDraft
  merged
  reviewDecision
  author { login }
  labels(first: 20) { nodes { name } }
  reviewRequests(first: 50) {
    nodes {
      requestedReviewer {
        ... on User { __typename login }
        ... on Team { __typename slug organization { login } }
      }
    }
  }
  latestComment: comments(last: 1) {
    nodes { author { login } createdAt }
  }
  latestReview: reviews(last: 1) {
    nodes { author { login } state submittedAt }
  }
  latestMention: timelineItems(itemTypes: [MENTIONED_EVENT], last: 1) {
    nodes { ... on MentionedEvent { actor { login } createdAt } }
  }
  latestAssignment: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 1) {
    nodes { ... on AssignedEvent { assignee { ... on User { login } } createdAt } }
  }
  latestReviewRequest: timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT], last: 1) {
    nodes { ... on ReviewRequestedEvent { requestedReviewer { ... on User { login } } createdAt } }
  }
  latestClosedEvent: timelineItems(itemTypes: [CLOSED_EVENT], last: 1) {
    nodes { ... on ClosedEvent { actor { login } createdAt stateReason } }
  }
  latestReopenedEvent: timelineItems(itemTypes: [REOPENED_EVENT], last: 1) {
    nodes { ... on ReopenedEvent { actor { login } createdAt stateReason } }
  }
  latestMergedEvent: timelineItems(itemTypes: [MERGED_EVENT], last: 1) {
    nodes { ... on MergedEvent { actor { login } createdAt } }
  }
  latestReadyForReviewEvent: timelineItems(itemTypes: [READY_FOR_REVIEW_EVENT], last: 1) {
    nodes { ... on ReadyForReviewEvent { actor { login } createdAt } }
  }
  latestReviewDismissedEvent: timelineItems(itemTypes: [REVIEW_DISMISSED_EVENT], last: 1) {
    nodes { ... on ReviewDismissedEvent { actor { login } createdAt previousReviewState } }
  }
}`

const ISSUE_FRAGMENT = `fragment IssueFields on Issue {
  __typename
  id
  viewerSubscription
  number
  state
  stateReason
  author { login }
  latestComment: comments(last: 1) {
    nodes { author { login } createdAt }
  }
  latestMention: timelineItems(itemTypes: [MENTIONED_EVENT], last: 1) {
    nodes { ... on MentionedEvent { actor { login } createdAt } }
  }
  latestAssignment: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 1) {
    nodes { ... on AssignedEvent { assignee { ... on User { login } } createdAt } }
  }
  latestClosedEvent: timelineItems(itemTypes: [CLOSED_EVENT], last: 1) {
    nodes { ... on ClosedEvent { actor { login } createdAt stateReason } }
  }
  latestReopenedEvent: timelineItems(itemTypes: [REOPENED_EVENT], last: 1) {
    nodes { ... on ReopenedEvent { actor { login } createdAt stateReason } }
  }
}`

const DISCUSSION_FRAGMENT = `fragment DiscussionFields on Discussion {
  __typename
  id
  viewerSubscription
  number
  isAnswered
  stateReason
  latestComment: comments(last: 1) {
    nodes { author { login } createdAt }
  }
}`

const RELEASE_FRAGMENT = `fragment ReleaseFields on Release {
  __typename
  tagName
  isPrerelease
  tagCommit { id viewerSubscription }
}`

const CHECK_SUITE_FRAGMENT = `fragment CheckSuiteFields on CheckSuite {
  __typename
  status
  conclusion
  commit { id oid viewerSubscription }
}`

const FRAGMENT_MAP = {
  PullRequest: PR_FRAGMENT,
  Issue: ISSUE_FRAGMENT,
  Discussion: DISCUSSION_FRAGMENT,
  Release: RELEASE_FRAGMENT,
  CheckSuite: CHECK_SUITE_FRAGMENT
}

const SPREAD_MAP = {
  PullRequest: '...PRFields',
  Issue: '...IssueFields',
  Discussion: '...DiscussionFields',
  Release: '...ReleaseFields',
  CheckSuite: '...CheckSuiteFields'
}

const GQL_FIELD_MAP = {
  PullRequest: 'pullRequest',
  Issue: 'issue',
  Discussion: 'discussion'
}

/**
 * @typedef {{
 *   threadId: string,
 *   owner: string,
 *   repo: string,
 *   subjectType: string,
 *   subjectNumber: number | null,
 *   nodeId?: string
 * }} EnrichmentTarget
 */

/**
 * Build one or more GraphQL enrichment queries for a set of targets.
 * Groups subjects by repository and only includes fragments for types
 * that are actually present. Splits into batches of ENRICH_BATCH_SIZE.
 *
 * @param {EnrichmentTarget[]} targets
 * @returns {Array<{ query: string, mapping: Map<string, string> }>}
 *   Each element has the query string and a mapping from GraphQL alias -> threadId
 */
function buildEnrichmentQueries(targets) {
  if (targets.length === 0) {
    return []
  }

  const batches = []
  for (let i = 0; i < targets.length; i += ENRICH_BATCH_SIZE) {
    batches.push(targets.slice(i, i + ENRICH_BATCH_SIZE))
  }

  return batches.map(buildSingleBatchQuery)
}

function buildSingleBatchQuery(batch) {
  const usedTypes = new Set()
  const mapping = new Map()

  // Group by repo for subjects queryable by number
  const repoGroups = new Map()
  const nodeQueries = []
  let nodeIdx = 0

  for (const target of batch) {
    const gqlField = GQL_FIELD_MAP[target.subjectType]
    const spread = SPREAD_MAP[target.subjectType]

    if (!spread) {
      continue
    }

    usedTypes.add(target.subjectType)

    if (
      gqlField !== undefined &&
      target.subjectNumber !== null &&
      target.subjectNumber !== undefined
    ) {
      const repoKey = `${target.owner}/${target.repo}`
      if (!repoGroups.has(repoKey)) {
        repoGroups.set(repoKey, { owner: target.owner, repo: target.repo, fields: [] })
      }
      const alias = `${gqlField.charAt(0)}${target.subjectNumber}`
      repoGroups.get(repoKey).fields.push({
        alias,
        line: `${alias}: ${gqlField}(number: ${target.subjectNumber}) { ${spread} }`
      })
      mapping.set(alias, target.threadId)
    } else if (target.nodeId) {
      const alias = `n${nodeIdx++}`
      nodeQueries.push(
        `${alias}: node(id: "${target.nodeId}") { ... on ${target.subjectType} { ${spread} } }`
      )
      mapping.set(alias, target.threadId)
    }
  }

  const fragments = [...usedTypes]
    .map((t) => FRAGMENT_MAP[t])
    .filter(Boolean)
    .join('\n\n')

  const repoLines = []
  let repoIdx = 0
  for (const [, group] of repoGroups) {
    const alias = `r${repoIdx++}`
    const inner = group.fields.map((f) => `    ${f.line}`).join('\n')
    repoLines.push(
      `  ${alias}: repository(owner: "${group.owner}", name: "${group.repo}") {\n${inner}\n  }`
    )

    for (const f of group.fields) {
      const oldAlias = f.alias
      const newAlias = `${alias}.${oldAlias}`
      const threadId = mapping.get(oldAlias)
      mapping.delete(oldAlias)
      mapping.set(newAlias, threadId)
    }
  }

  const nodeLines = nodeQueries.map((q) => `  ${q}`)

  const queryBody = [...repoLines, ...nodeLines].join('\n')
  const query = `${fragments}\n\nquery Enrich {\n${queryBody}\n}`

  return { query, mapping }
}

/**
 * Extract enrichment results from a GraphQL response using the alias mapping.
 * @param {Record<string, any>} data - The GraphQL response data
 * @param {Map<string, string>} mapping - alias -> threadId
 * @returns {Map<string, GitHubNotificationSubject | null>} threadId -> subject data
 */
function extractEnrichmentResults(data, mapping) {
  const results = new Map()

  for (const [aliasPath, threadId] of mapping) {
    const parts = aliasPath.split('.')
    let value = data
    for (const part of parts) {
      value = value?.[part]
    }
    results.set(threadId, value ?? null)
  }

  return results
}

export { buildEnrichmentQueries, extractEnrichmentResults, ENRICH_BATCH_SIZE }
