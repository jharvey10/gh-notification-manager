/**
 * Canonical type definitions for notification data throughout the app.
 * The NOTIFICATION_QUERY has been replaced by REST+GraphQL hybrid fetching
 * (see restNotifications.js and enrichSubjects.js).
 */

export type GitHubActor = { login: string }
export type GitHubLabel = { name: string }
export type GitHubLabelConnection = { nodes: GitHubLabel[] }
export type GitHubRequestedReviewer =
  | { __typename: 'User'; login: string }
  | { __typename: 'Team'; slug: string; organization: GitHubActor }
export type GitHubReviewRequest = { requestedReviewer: GitHubRequestedReviewer | null }
export type GitHubReviewRequestConnection = { nodes: GitHubReviewRequest[] }
export type GitHubMentionedEvent = { actor: { login: string }; createdAt: string }
export type GitHubAssignedEvent = { assignee: { login: string }; createdAt: string }
export type GitHubReviewRequestedEvent = { requestedReviewer: { login: string }; createdAt: string }
export type GitHubClosedEvent = {
  actor: { login: string }
  createdAt: string
  stateReason: string | null
}
export type GitHubReopenedEvent = {
  actor: { login: string }
  createdAt: string
  stateReason: string | null
}
export type GitHubMergedEvent = { actor: { login: string }; createdAt: string }
export type GitHubReadyForReviewEvent = { actor: { login: string }; createdAt: string }
export type GitHubReviewDismissedEvent = {
  actor: { login: string }
  createdAt: string
  previousReviewState: string
}
export type GitHubComment = { author: GitHubActor | null; createdAt: string }
export type GitHubCommentConnection = { nodes: GitHubComment[] }
export type GitHubPullRequestReview = {
  author: GitHubActor | null
  state: string
  submittedAt: string | null
}
export type GitHubPullRequestReviewConnection = { nodes: GitHubPullRequestReview[] }
export type GitHubMentionedEventConnection = { nodes: GitHubMentionedEvent[] }
export type GitHubAssignedEventConnection = { nodes: GitHubAssignedEvent[] }
export type GitHubReviewRequestedEventConnection = { nodes: GitHubReviewRequestedEvent[] }
export type GitHubClosedEventConnection = { nodes: GitHubClosedEvent[] }
export type GitHubReopenedEventConnection = { nodes: GitHubReopenedEvent[] }
export type GitHubMergedEventConnection = { nodes: GitHubMergedEvent[] }
export type GitHubReadyForReviewEventConnection = { nodes: GitHubReadyForReviewEvent[] }
export type GitHubReviewDismissedEventConnection = { nodes: GitHubReviewDismissedEvent[] }

export type GitHubPullRequestSubject = {
  __typename: 'PullRequest'
  id: string
  viewerSubscription: string | null
  number: number
  state: string
  isDraft: boolean
  merged: boolean
  reviewDecision: string | null
  author: GitHubActor | null
  labels: GitHubLabelConnection | null
  reviewRequests: GitHubReviewRequestConnection | null
  latestComment: GitHubCommentConnection | null
  latestReview: GitHubPullRequestReviewConnection | null
  latestMention: GitHubMentionedEventConnection | null
  latestAssignment: GitHubAssignedEventConnection | null
  latestReviewRequest: GitHubReviewRequestedEventConnection | null
  latestClosedEvent: GitHubClosedEventConnection | null
  latestReopenedEvent: GitHubReopenedEventConnection | null
  latestMergedEvent: GitHubMergedEventConnection | null
  latestReadyForReviewEvent: GitHubReadyForReviewEventConnection | null
  latestReviewDismissedEvent: GitHubReviewDismissedEventConnection | null
}

export type GitHubIssueSubject = {
  __typename: 'Issue'
  id: string
  viewerSubscription: string | null
  number: number
  state: string
  stateReason: string | null
  author: GitHubActor | null
  latestComment: GitHubCommentConnection | null
  latestMention: GitHubMentionedEventConnection | null
  latestAssignment: GitHubAssignedEventConnection | null
  latestClosedEvent: GitHubClosedEventConnection | null
  latestReopenedEvent: GitHubReopenedEventConnection | null
}

export type GitHubCheckSuiteSubject = {
  __typename: 'CheckSuite'
  status: string | null
  conclusion: string | null
  commit: { id: string; oid: string; viewerSubscription: string | null } | null
}

export type GitHubReleaseSubject = {
  __typename: 'Release'
  tagName: string
  isPrerelease: boolean
  tagCommit: { id: string; viewerSubscription: string | null } | null
}

export type GitHubDiscussionSubject = {
  __typename: 'Discussion'
  id: string
  viewerSubscription: string | null
  number: number
  isAnswered: boolean
  stateReason: string | null
  latestComment: GitHubCommentConnection | null
}

export type GitHubNotificationSubject =
  | GitHubPullRequestSubject
  | GitHubIssueSubject
  | GitHubCheckSuiteSubject
  | GitHubReleaseSubject
  | GitHubDiscussionSubject

export type GitHubRepositoryList = {
  nameWithOwner: string
  name: string
  owner: GitHubActor | null
}

export type LocalNotificationData = { isUnread: boolean; isSaved: boolean }
export type LocalNotificationDataPatch = Partial<LocalNotificationData>
