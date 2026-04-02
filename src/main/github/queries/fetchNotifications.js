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
 * @typedef {{ isUnread: boolean, isSaved: boolean }} LocalNotificationData
 * @typedef {Partial<LocalNotificationData>} LocalNotificationDataPatch
 * @typedef {{
 *   id: string,
 *   title: string,
 *   threadType: string,
 *   url: string,
 *   reason: string | null,
 *   lastUpdatedAt: string,
 *   optionalSubject: GitHubNotificationSubject | null,
 *   optionalList: GitHubRepositoryList | null,
 *   _localData: LocalNotificationData,
 *   tags?: string[],
 *   activityLabel?: string | null,
 *   _latestEvents?: { prev: LatestEvent[], curr: LatestEvent[] }
 * }} GitHubNotificationNode
 */

/**
 * Re-export typedefs for use by other modules.
 * The NOTIFICATION_QUERY has been replaced by REST+GraphQL hybrid fetching
 * (see restNotifications.js and enrichSubjects.js). These typedefs remain
 * as the canonical shape for notification data throughout the app.
 *
 * @exports GitHubNotificationNode
 * @exports LatestEvent
 * @exports GitHubNotificationSubject
 * @exports GitHubRepositoryList
 */
