const SUBJECT_TYPE_TAGS = {
  PullRequest: 'pr',
  Issue: 'issue',
  CheckSuite: 'ci',
  Release: 'release',
  Discussion: 'discussion'
}

function normalizeTypeTag(type) {
  return type
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replaceAll(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
}

function getBaseTag(notification) {
  const subjectType = notification.optionalSubject?.__typename ?? notification.threadType
  if (!subjectType) return null
  return SUBJECT_TYPE_TAGS[subjectType] ?? normalizeTypeTag(subjectType)
}

function getPullRequestTags(subject) {
  if (subject.isDraft) return ['pr_draft']
  if (subject.merged) return ['pr_merged']
  if (subject.state === 'CLOSED') return ['pr_closed']
  if (subject.reviewDecision === 'APPROVED') return ['pr_approved']
  if (subject.reviewDecision === 'CHANGES_REQUESTED') return ['pr_changes_requested']
  if (subject.reviewDecision === 'REVIEW_REQUIRED') return ['pr_review_required']
  return ['pr_open']
}

function getIssueTags(subject) {
  if (subject.state !== 'CLOSED') return ['issue_open']

  const tags = ['issue_closed']

  if (subject.stateReason === 'COMPLETED') tags.push('issue_completed')
  if (subject.stateReason === 'NOT_PLANNED') tags.push('issue_not_planned')

  return tags
}

function getCheckSuiteTags(subject) {
  if (subject.status === 'IN_PROGRESS') return ['ci_in_progress']
  if (subject.status === 'QUEUED') return ['ci_queued']

  const conclusionTags = {
    SUCCESS: 'ci_success',
    FAILURE: 'ci_failure',
    CANCELLED: 'ci_cancelled',
    TIMED_OUT: 'ci_timed_out',
    NEUTRAL: 'ci_neutral',
    SKIPPED: 'ci_skipped',
    STALE: 'ci_stale',
    ACTION_REQUIRED: 'ci_action_required',
    STARTUP_FAILURE: 'ci_startup_failure'
  }

  return [conclusionTags[subject.conclusion] ?? 'ci_unknown']
}

function getReleaseTags(subject) {
  if (subject.isPrerelease) return ['release_prerelease']
  return ['release_published']
}

function getDiscussionTags(subject) {
  if (subject.isAnswered) return ['discussion_answered']
  return ['discussion_open']
}

function getDetailTags(notification, baseTag) {
  const subject = notification.optionalSubject
  if (!subject) return []

  switch (baseTag) {
    case 'pr':
      return getPullRequestTags(subject)
    case 'issue':
      return getIssueTags(subject)
    case 'ci':
      return getCheckSuiteTags(subject)
    case 'release':
      return getReleaseTags(subject)
    case 'discussion':
      return getDiscussionTags(subject)
    default:
      return []
  }
}

/**
 * Normalizes the subject type into tags so the UI and filters can treat
 * every non-repo badge as standard notification metadata.
 */
export async function subjectTagger(notification) {
  const baseTag = getBaseTag(notification)
  if (!baseTag) return []

  return [baseTag, ...getDetailTags(notification, baseTag)]
}
