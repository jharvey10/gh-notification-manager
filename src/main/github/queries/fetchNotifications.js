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
 * @typedef {{ actor: { login: string }, createdAt: string, stateReason: string | null }} GitHubClosedEvent
 * @typedef {{ actor: { login: string }, createdAt: string, stateReason: string | null }} GitHubReopenedEvent
 * @typedef {{ actor: { login: string }, createdAt: string }} GitHubMergedEvent
 * @typedef {{ actor: { login: string }, createdAt: string }} GitHubReadyForReviewEvent
 * @typedef {{ actor: { login: string }, createdAt: string, previousReviewState: string }} GitHubReviewDismissedEvent
 * @typedef {{ author: GitHubActor | null, createdAt: string }} GitHubComment
 * @typedef {{ nodes: GitHubComment[] }} GitHubCommentConnection
 * @typedef {{ author: GitHubActor | null, state: string, submittedAt: string | null }} GitHubPullRequestReview
 * @typedef {{ nodes: GitHubPullRequestReview[] }} GitHubPullRequestReviewConnection
 * @typedef {{ nodes: GitHubMentionedEvent[] }} GitHubMentionedEventConnection
 * @typedef {{ nodes: GitHubAssignedEvent[] }} GitHubAssignedEventConnection
 * @typedef {{ nodes: GitHubReviewRequestedEvent[] }} GitHubReviewRequestedEventConnection
 * @typedef {{ nodes: GitHubClosedEvent[] }} GitHubClosedEventConnection
 * @typedef {{ nodes: GitHubReopenedEvent[] }} GitHubReopenedEventConnection
 * @typedef {{ nodes: GitHubMergedEvent[] }} GitHubMergedEventConnection
 * @typedef {{ nodes: GitHubReadyForReviewEvent[] }} GitHubReadyForReviewEventConnection
 * @typedef {{ nodes: GitHubReviewDismissedEvent[] }} GitHubReviewDismissedEventConnection
 * @typedef {{ type: string, actor: string | null, timestamp: string, detail: string | null }} LatestEvent
 * @typedef {{
 *   __typename: 'PullRequest',
 *   id: string,
 *   viewerSubscription: string | null,
 *   number: number,
 *   state: string,
 *   isDraft: boolean,
 *   merged: boolean,
 *   reviewDecision: string | null,
 *   author: GitHubActor | null,
 *   labels: GitHubLabelConnection | null,
 *   reviewRequests: GitHubReviewRequestConnection | null,
 *   latestComment: GitHubCommentConnection | null,
 *   latestReview: GitHubPullRequestReviewConnection | null,
 *   latestMention: GitHubMentionedEventConnection | null,
 *   latestAssignment: GitHubAssignedEventConnection | null,
 *   latestReviewRequest: GitHubReviewRequestedEventConnection | null,
 *   latestClosedEvent: GitHubClosedEventConnection | null,
 *   latestReopenedEvent: GitHubReopenedEventConnection | null,
 *   latestMergedEvent: GitHubMergedEventConnection | null,
 *   latestReadyForReviewEvent: GitHubReadyForReviewEventConnection | null,
 *   latestReviewDismissedEvent: GitHubReviewDismissedEventConnection | null
 * }} GitHubPullRequestSubject
 * @typedef {{
 *   __typename: 'Issue',
 *   id: string,
 *   viewerSubscription: string | null,
 *   number: number,
 *   state: string,
 *   stateReason: string | null,
 *   author: GitHubActor | null,
 *   latestComment: GitHubCommentConnection | null,
 *   latestMention: GitHubMentionedEventConnection | null,
 *   latestAssignment: GitHubAssignedEventConnection | null,
 *   latestClosedEvent: GitHubClosedEventConnection | null,
 *   latestReopenedEvent: GitHubReopenedEventConnection | null
 * }} GitHubIssueSubject
 * @typedef {{
 *   __typename: 'CheckSuite',
 *   status: string | null,
 *   conclusion: string | null,
 *   commit: { id: string, oid: string, viewerSubscription: string | null } | null
 * }} GitHubCheckSuiteSubject
 * @typedef {{
 *   __typename: 'Release',
 *   tagName: string,
 *   isPrerelease: boolean,
 *   tagCommit: { id: string, viewerSubscription: string | null } | null
 * }} GitHubReleaseSubject
 * @typedef {{
 *   __typename: 'Discussion',
 *   id: string,
 *   viewerSubscription: string | null,
 *   number: number,
 *   isAnswered: boolean,
 *   stateReason: string | null,
 *   latestComment: GitHubCommentConnection | null
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
 *   activityLabel?: string | null,
 *   _latestEvents?: { prev: LatestEvent[], curr: LatestEvent[] }
 * }} GitHubNotificationNode
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
            }
            ... on Issue {
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
            }
            ... on CheckSuite {
              status
              conclusion
              commit { id oid viewerSubscription }
            }
            ... on Release {
              tagName
              isPrerelease
              tagCommit { id viewerSubscription }
            }
            ... on Discussion {
              id
              viewerSubscription
              number
              isAnswered
              stateReason
              latestComment: comments(last: 1) {
                nodes { author { login } createdAt }
              }
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
 * @exports LatestEvent
 * @exports GitHubNotificationSubject
 * @exports GitHubRepositoryList
 */
