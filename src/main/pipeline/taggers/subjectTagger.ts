import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const SUBJECT_TYPE_TAGS: Record<string, string> = {
  PullRequest: 'pr',
  Issue: 'issue',
  CheckSuite: 'ci',
  Release: 'release',
  Discussion: 'discussion'
}

function normalizeTypeTag(type: string) {
  return type
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replaceAll(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
}

function getBaseTag(notification: Notification): string | null {
  const subjectType = notification.optionalSubject?.__typename ?? notification.threadType
  if (!subjectType) {
    return null
  }
  return SUBJECT_TYPE_TAGS[subjectType] ?? normalizeTypeTag(subjectType)
}

function getPullRequestTags(subject: any): string[] {
  if (subject.isDraft) {
    return ['pr_draft']
  }
  if (subject.merged) {
    return ['pr_merged']
  }
  if (subject.state === 'CLOSED') {
    return ['pr_closed']
  }
  if (subject.reviewDecision === 'APPROVED') {
    return ['pr_approved']
  }
  if (subject.reviewDecision === 'CHANGES_REQUESTED') {
    return ['pr_changes_requested']
  }
  if (subject.reviewDecision === 'REVIEW_REQUIRED') {
    return ['pr_review_required']
  }
  return ['pr_open']
}

function getIssueTags(subject: any): string[] {
  if (subject.state !== 'CLOSED') {
    return ['issue_open']
  }
  const tags = ['issue_closed']
  if (subject.stateReason === 'COMPLETED') {
    tags.push('issue_completed')
  }
  if (subject.stateReason === 'NOT_PLANNED') {
    tags.push('issue_not_planned')
  }
  return tags
}

function getCheckSuiteTags(subject: any): string[] {
  if (subject.status === 'IN_PROGRESS') {
    return ['ci_in_progress']
  }
  if (subject.status === 'QUEUED') {
    return ['ci_queued']
  }
  const conclusionTags: Record<string, string> = {
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

function getReleaseTags(subject: any): string[] {
  if (subject.isPrerelease) {
    return ['release_prerelease']
  }
  return ['release_published']
}

function getDiscussionTags(subject: any): string[] {
  if (subject.isAnswered) {
    return ['discussion_answered']
  }
  return ['discussion_open']
}

function getSubjectTags(baseTag: string, subject: unknown): string[] {
  if (!subject) {
    return [baseTag]
  }
  switch (baseTag) {
    case 'pr':
      return [baseTag, ...getPullRequestTags(subject)]
    case 'issue':
      return [baseTag, ...getIssueTags(subject)]
    case 'ci':
      return [baseTag, ...getCheckSuiteTags(subject)]
    case 'release':
      return [baseTag, ...getReleaseTags(subject)]
    case 'discussion':
      return [baseTag, ...getDiscussionTags(subject)]
    default:
      return [baseTag]
  }
}

class SubjectTagger implements BatchProcessor {
  async process(batch: Notification[], _context: PipelineContext): Promise<Notification[]> {
    for (const notification of batch) {
      const baseTag = getBaseTag(notification)
      if (!baseTag) {
        continue
      }
      const tags = getSubjectTags(baseTag, notification.optionalSubject)
      notification.tags = [...new Set([...notification.tags, ...tags])]
    }
    return batch
  }
}

export { SubjectTagger }
