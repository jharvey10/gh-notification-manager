import type { BatchProcessor, LatestEvent, Notification, PipelineContext } from '../types.js'

const REVIEW_STATE_LABELS: Record<string, string> = {
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
  COMMENTED: 'review_comment',
  DISMISSED: 'review_dismissed',
  PENDING: 'review_pending'
}

const CLOSED_DETAIL_LABELS: Record<string, string> = {
  COMPLETED: 'completed',
  NOT_PLANNED: 'not_planned'
}

function labelForEvent(event: LatestEvent | null, context: PipelineContext): string {
  if (!event) {
    return ''
  }
  switch (event.type) {
    case 'comment':
      return 'new_comment'
    case 'review':
      return REVIEW_STATE_LABELS[event.detail ?? ''] ?? 'review_updated'
    case 'mention':
      return context.viewerLogin && event.actor === context.viewerLogin
        ? 'mentioned'
        : 'new_comment'
    case 'assign':
      return 'assigned'
    case 'review_requested':
      return 'review_requested'
    case 'closed':
      return CLOSED_DETAIL_LABELS[event.detail ?? ''] ?? 'closed'
    case 'reopened':
      return 'reopened'
    case 'merged':
      return 'merged'
    case 'ready_for_review':
      return 'ready_for_review'
    case 'review_dismissed':
      return 'review_dismissed'
    default:
      return 'unknown'
  }
}

function getMostRecentEvent(events: LatestEvent[]): LatestEvent | null {
  if (events.length === 0) {
    return null
  }
  return events.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
}

// TODO: CheckSuite and Release subjects have no timeline events — they'll
//       always get 'unknown'. May want a fallback using subject type + status/conclusion.
// TODO: Discussions only have 'comment' events — state changes like "answered"
//       won't surface as a label.
// TODO: On first poll there's no prev to diff against, so the most recent event
//       may be very old. Consider whether to suppress labels for stale events.
class ActivityLabelProcessor implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    for (const notification of batch) {
      const events = notification._latestEvents ?? []
      notification.activityLabel = labelForEvent(getMostRecentEvent(events), context)
    }
    return batch
  }
}

export { ActivityLabelProcessor }
