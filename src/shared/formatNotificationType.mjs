/**
 * Derives a human-readable "Type – Detail" label from the GraphQL
 * optionalSubject union, giving triage-useful context like whether a
 * PR is merged/draft/approved or an issue is completed vs not-planned.
 */
function formatNotificationType(notification) {
  const subject = notification.optionalSubject;
  if (!subject?.__typename) return notification.threadType ?? 'Unknown';

  switch (subject.__typename) {
    case 'PullRequest':
      return `PR – ${prDetail(subject)}`;
    case 'Issue':
      return `Issue – ${issueDetail(subject)}`;
    case 'CheckSuite':
      return `CI – ${checkSuiteDetail(subject)}`;
    case 'Release':
      return subject.isPrerelease ? 'Release – Pre-release' : 'Release';
    case 'Discussion':
      return subject.isAnswered ? 'Discussion – Answered' : 'Discussion – Open';
    default:
      return subject.__typename;
  }
}

function prDetail(pr) {
  if (pr.isDraft) return 'Draft';
  if (pr.merged) return 'Merged';
  if (pr.state === 'CLOSED') return 'Closed';
  if (pr.reviewDecision === 'APPROVED') return 'Approved';
  if (pr.reviewDecision === 'CHANGES_REQUESTED') return 'Changes Requested';
  if (pr.reviewDecision === 'REVIEW_REQUIRED') return 'Review Required';
  return 'Open';
}

function issueDetail(issue) {
  if (issue.state !== 'CLOSED') return 'Open';
  if (issue.stateReason === 'COMPLETED') return 'Completed';
  if (issue.stateReason === 'NOT_PLANNED') return 'Not Planned';
  return 'Closed';
}

function checkSuiteDetail(cs) {
  if (cs.status === 'IN_PROGRESS') return 'In Progress';
  if (cs.status === 'QUEUED') return 'Queued';
  const conclusions = {
    SUCCESS: 'Success',
    FAILURE: 'Failure',
    CANCELLED: 'Cancelled',
    TIMED_OUT: 'Timed Out',
    NEUTRAL: 'Neutral',
    SKIPPED: 'Skipped',
    STALE: 'Stale',
    ACTION_REQUIRED: 'Action Required',
    STARTUP_FAILURE: 'Startup Failure',
  };
  return conclusions[cs.conclusion] ?? cs.conclusion ?? 'Unknown';
}

export { formatNotificationType };
