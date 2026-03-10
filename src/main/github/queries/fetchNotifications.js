/**
 * @typedef {{ login: string }} GitHubActor
 * @typedef {{ name: string }} GitHubLabel
 * @typedef {{ nodes: GitHubLabel[] }} GitHubLabelConnection
 * @typedef {{ __typename: 'User', login: string } | { __typename: 'Team', slug: string, organization: GitHubActor }} GitHubRequestedReviewer
 * @typedef {{ requestedReviewer: GitHubRequestedReviewer | null }} GitHubReviewRequest
 * @typedef {{ nodes: GitHubReviewRequest[] }} GitHubReviewRequestConnection
 * @typedef {{ actor: { login: string }, createdAt: string }} GitHubMentionedEvent
 * @typedef {{ assignee: { login: string }, createdAt: string }} GitHubAssignedEvent
 * @typedef {{ requestedReviewer: { login: string }, createdAt: string }} GitHubReviewRequestedEvent
 * @typedef {{ nodes: GitHubMentionedEvent[] }} GitHubMentionedEventConnection
 * @typedef {{ nodes: GitHubAssignedEvent[] }} GitHubAssignedEventConnection
 * @typedef {{ nodes: GitHubReviewRequestedEvent[] }} GitHubReviewRequestedEventConnection
 * @typedef {{
 *   __typename: 'PullRequest',
 *   id: string,
 *   state: string,
 *   isDraft: boolean,
 *   merged: boolean,
 *   reviewDecision: string | null,
 *   author: GitHubActor | null,
 *   labels: GitHubLabelConnection | null,
 *   reviewRequests: GitHubReviewRequestConnection | null,
 *   latestMention: GitHubMentionedEventConnection | null,
 *   latestAssignment: GitHubAssignedEventConnection | null,
 *   latestReviewRequest: GitHubReviewRequestedEventConnection | null
 * }} GitHubPullRequestSubject
 * @typedef {{
 *   __typename: 'Issue',
 *   id: string,
 *   state: string,
 *   stateReason: string | null,
 *   author: GitHubActor | null,
 *   latestMention: GitHubMentionedEventConnection | null,
 *   latestAssignment: GitHubAssignedEventConnection | null
 * }} GitHubIssueSubject
 * @typedef {{
 *   __typename: 'CheckSuite',
 *   status: string | null,
 *   conclusion: string | null,
 *   commit: { id: string } | null
 * }} GitHubCheckSuiteSubject
 * @typedef {{
 *   __typename: 'Release',
 *   tagName: string,
 *   isPrerelease: boolean,
 *   tagCommit: { id: string } | null
 * }} GitHubReleaseSubject
 * @typedef {{
 *   __typename: 'Discussion',
 *   id: string,
 *   isAnswered: boolean,
 *   stateReason: string | null
 * }} GitHubDiscussionSubject
 * @typedef {GitHubPullRequestSubject | GitHubIssueSubject | GitHubCheckSuiteSubject | GitHubReleaseSubject | GitHubDiscussionSubject} GitHubNotificationSubject
 * @typedef {{
 *   nameWithOwner: string,
 *   name: string,
 *   owner: GitHubActor | null
 * }} GitHubRepositoryList
 * @typedef {{
 *   id: string,
 *   title: string,
 *   threadType: string,
 *   url: string,
 *   reason: string | null,
 *   isUnread: boolean,
 *   isSaved: boolean,
 *   lastUpdatedAt: string,
 *   optionalSubject: GitHubNotificationSubject | null,
 *   optionalList: GitHubRepositoryList | null,
 *   tags?: string[],
 *   _directEvents?: { prev: DirectEventTimestamps, curr: DirectEventTimestamps }
 * }} GitHubNotificationNode
 * @typedef {{
 *   lastMentionedAt: string | null,
 *   lastAssignedAt: string | null,
 *   lastReviewRequestedAt: string | null,
 *   mentionedLogin?: string | null,
 *   assignedLogin?: string | null,
 *   reviewRequestedLogin?: string | null
 * }} DirectEventTimestamps
 */

const NOTIFICATION_QUERY = `
  query FetchNotifications($cursor: String) {
    viewer {
      notificationThreads(
        first: 50,
        after: $cursor,
        filterBy: { statuses: [READ, UNREAD] }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          threadType
          url
          reason
          isUnread
          isSaved
          lastUpdatedAt
          optionalSubject {
            __typename
            ... on PullRequest {
              id
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
              latestMention: timelineItems(itemTypes: [MENTIONED_EVENT], last: 1) {
                nodes { ... on MentionedEvent { actor { login } createdAt } }
              }
              latestAssignment: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 1) {
                nodes { ... on AssignedEvent { assignee { ... on User { login } } createdAt } }
              }
              latestReviewRequest: timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT], last: 1) {
                nodes { ... on ReviewRequestedEvent { requestedReviewer { ... on User { login } } createdAt } }
              }
            }
            ... on Issue {
              id
              state
              stateReason
              author { login }
              latestMention: timelineItems(itemTypes: [MENTIONED_EVENT], last: 1) {
                nodes { ... on MentionedEvent { actor { login } createdAt } }
              }
              latestAssignment: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 1) {
                nodes { ... on AssignedEvent { assignee { ... on User { login } } createdAt } }
              }
            }
            ... on CheckSuite {
              status
              conclusion
              commit { id }
            }
            ... on Release {
              tagName
              isPrerelease
              tagCommit { id }
            }
            ... on Discussion {
              id
              isAnswered
              stateReason
            }
          }
          optionalList {
            ... on Repository {
              nameWithOwner
              name
              owner { login }
            }
          }
        }
      }
    }
  }
`

export { NOTIFICATION_QUERY }

/**
 * Re-export typedefs for use by other modules.
 * @exports GitHubNotificationNode
 * @exports DirectEventTimestamps
 * @exports GitHubNotificationSubject
 * @exports GitHubRepositoryList
 */
