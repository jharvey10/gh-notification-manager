import { EnrichmentTarget } from '../../pipeline/types.js'
import { GitHubNotificationSubject } from './types.js'

const DISCOVERY_BATCH_SIZE = 100
const ENRICH_BATCH_SIZE = 50
const FALLBACK_ENRICH_BATCH_SIZE = 20

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
 *   subjectUrl?: string | null,
 *   nodeId?: string
 * }} EnrichmentTarget
 */

// ---------------------------------------------------------------------------
// Phase 1: Node ID Discovery (cheap — only fetches { id } per item)
// ---------------------------------------------------------------------------

/**
 * Build cheap discovery queries that only resolve the GraphQL node ID
 * for each target. No timeline connections, no fragments — just { id }.
 * Batch size is large (~100) since the cost per item is minimal.
 *
 * Only works for types with a GQL_FIELD_MAP entry (PR, Issue, Discussion).
 * Release/CheckSuite need REST-based node_id resolution (handled separately).
 */
function buildNodeIdDiscoveryQueries(
  targets: EnrichmentTarget[]
): Array<{ query: string; mapping: Map<string, string> }> {
  const eligible = targets.filter(
    (t) => GQL_FIELD_MAP[t.subjectType] && t.subjectNumber !== null && t.subjectNumber !== undefined
  )

  if (eligible.length === 0) {
    return []
  }

  const batches: EnrichmentTarget[][] = []
  for (let i = 0; i < eligible.length; i += DISCOVERY_BATCH_SIZE) {
    batches.push(eligible.slice(i, i + DISCOVERY_BATCH_SIZE))
  }

  return batches.map(buildSingleDiscoveryQuery)
}

function buildSingleDiscoveryQuery(batch: EnrichmentTarget[]): {
  query: string
  mapping: Map<string, string>
} {
  const mapping = new Map()
  const repoGroups = new Map()

  for (const target of batch) {
    const gqlField = GQL_FIELD_MAP[target.subjectType]
    const repoKey = `${target.owner}/${target.repo}`
    if (!repoGroups.has(repoKey)) {
      repoGroups.set(repoKey, { owner: target.owner, repo: target.repo, fields: [] })
    }
    const alias = `${gqlField.charAt(0)}${target.subjectNumber}`
    repoGroups.get(repoKey).fields.push({
      alias,
      line: `${alias}: ${gqlField}(number: ${target.subjectNumber}) { id }`
    })
    mapping.set(alias, target.threadId)
  }

  const repoLines: string[] = []
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

  const query = `query Discover {\n${repoLines.join('\n')}\n}`
  return { query, mapping }
}

/**
 * Extract node IDs from a discovery response.
 */
function extractDiscoveryResults(
  data: Record<string, any>,
  mapping: Map<string, string>
): Map<string, string> {
  const results = new Map()
  for (const [aliasPath, threadId] of mapping) {
    const parts = aliasPath.split('.')
    let value = data
    for (const part of parts) {
      value = value?.[part]
    }
    if (value?.id) {
      results.set(threadId, value.id)
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// Phase 2: Node-based enrichment via nodes(ids: [...])
// ---------------------------------------------------------------------------

/**
 * Build a single enrichment query using the fast nodes(ids: [...]) path.
 * Only includes fragments for types actually present in the batch.
 */
function buildNodeEnrichmentQuery(
  items: { nodeId: string; subjectType: string; threadId: string }[]
): { query: string; variables: { ids: string[] }; threadIds: string[] } {
  const usedTypes = new Set<string>()
  const ids: string[] = []
  const threadIds: string[] = []

  for (const item of items) {
    if (!SPREAD_MAP[item.subjectType]) {
      continue
    }
    usedTypes.add(item.subjectType)
    ids.push(item.nodeId)
    threadIds.push(item.threadId)
  }

  const fragments = [...usedTypes]
    .map((t) => FRAGMENT_MAP[t])
    .filter(Boolean)
    .join('\n\n')

  const spreads = [...usedTypes].map((t) => `    ${SPREAD_MAP[t]}`).join('\n')

  const query = `${fragments}\n\nquery Enrich($ids: [ID!]!) {\n  nodes(ids: $ids) {\n${spreads}\n  }\n}`
  return { query, variables: { ids }, threadIds }
}

/**
 * Extract enrichment results from a nodes()-based response.
 * Results come back in the same order as the input IDs.
 */
function extractNodeEnrichmentResults(
  nodes: any[],
  threadIds: string[]
): Map<string, GitHubNotificationSubject | null> {
  const results = new Map()
  for (let i = 0; i < threadIds.length; i++) {
    results.set(threadIds[i], nodes[i] ?? null)
  }
  return results
}

// ---------------------------------------------------------------------------
// Fallback: repo+number enrichment (for threads without a cached nodeId)
// ---------------------------------------------------------------------------

/**
 * Build repo+number enrichment queries (the old path). Used as a fallback
 * when node ID discovery fails or for Release/CheckSuite with REST-resolved IDs.
 */
function buildFallbackEnrichmentQueries(
  targets: EnrichmentTarget[]
): Array<{ query: string; mapping: Map<string, string> }> {
  if (targets.length === 0) {
    return []
  }

  const batches: EnrichmentTarget[][] = []
  for (let i = 0; i < targets.length; i += FALLBACK_ENRICH_BATCH_SIZE) {
    batches.push(targets.slice(i, i + FALLBACK_ENRICH_BATCH_SIZE))
  }

  return batches.map(buildSingleFallbackQuery).filter((q) => q !== null)
}

function buildSingleFallbackQuery(
  batch: EnrichmentTarget[]
): { query: string; mapping: Map<string, string> } | null {
  const usedTypes = new Set<string>()
  const mapping = new Map()
  const repoGroups = new Map()
  const nodeQueries: string[] = []
  let nodeIdx = 0

  for (const target of batch) {
    const gqlField = GQL_FIELD_MAP[target.subjectType]
    const spread = SPREAD_MAP[target.subjectType]

    if (!spread) {
      continue
    }

    if (
      gqlField !== undefined &&
      target.subjectNumber !== null &&
      target.subjectNumber !== undefined
    ) {
      usedTypes.add(target.subjectType)
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
      usedTypes.add(target.subjectType)
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

  const repoLines: string[] = []
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

  if (mapping.size === 0) {
    return null
  }

  const query = `${fragments}\n\nquery Enrich {\n${queryBody}\n}`

  return { query, mapping }
}

/**
 * Extract enrichment results from a fallback (alias-based) GraphQL response.
 */
function extractFallbackEnrichmentResults(
  data: Record<string, any>,
  mapping: Map<string, string>
): Map<string, GitHubNotificationSubject | null> {
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

export {
  buildNodeIdDiscoveryQueries,
  extractDiscoveryResults,
  buildNodeEnrichmentQuery,
  extractNodeEnrichmentResults,
  buildFallbackEnrichmentQueries,
  extractFallbackEnrichmentResults,
  DISCOVERY_BATCH_SIZE,
  ENRICH_BATCH_SIZE,
  FALLBACK_ENRICH_BATCH_SIZE
}
