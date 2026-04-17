import type { BatchProcessor, LatestEvent, Notification, PipelineContext } from '../types.js'

const REVIEW_STATE_LABELS: Record<string, string> = {
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'requested changed',
  COMMENTED: 'added review comment',
  DISMISSED: 'dismissed review',
  PENDING: 'has pending review'
}

const CLOSED_DETAIL_LABELS: Record<string, string> = {
  COMPLETED: 'closed: completed',
  NOT_PLANNED: 'closed: not planned'
}

function labelForEvent(event: LatestEvent | null, context: PipelineContext): string {
  if (!event) {
    return ''
  }
  switch (event.type) {
    case 'comment':
      return 'commented'
    case 'review':
      return REVIEW_STATE_LABELS[event.detail ?? ''] ?? 'updated review'
    case 'mention':
      return context.viewerLogin && event.actor === context.viewerLogin
        ? 'mentioned you'
        : `mentioned ${event.actor}`
    case 'assign':
      return 'assigned'
    case 'review_requested':
      return 'requested review'
    case 'closed':
      return CLOSED_DETAIL_LABELS[event.detail ?? ''] ?? 'closed'
    case 'reopened':
      return 'reopened'
    case 'merged':
      return 'merged'
    case 'ready_for_review':
      return 'ready for review'
    case 'review_dismissed':
      return 'dismissed review'
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
