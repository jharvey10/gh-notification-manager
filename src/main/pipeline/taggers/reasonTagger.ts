import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const REASON_TAGS: Readonly<Record<string, string>> = Object.freeze({
  mention: 'direct_mention',
  team_mention: 'team_mention',
  assign: 'assigned',
  author: 'author',
  ci_activity: 'ci',
  comment: 'comment',
  state_change: 'state_change',
  security_alert: 'security_alert',
  subscribed: 'subscribed',
  manual: 'manual',
  invitation: 'invitation'
})

/**
 * Tags notifications based on GitHub's reported reason AND the actual
 * timeline event data. GitHub only surfaces a single "most important"
 * reason per notification, so we cross-check _latestEvents to pick up
 * mentions and assignments the reason field may hide.
 */
class ReasonTagger implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    for (const notification of batch) {
      const reason = notification.reason?.toLowerCase()
      const tags: string[] = []

      if (reason && reason !== 'review_requested') {
        const reasonTag = REASON_TAGS[reason]
        if (reasonTag) {
          tags.push(reasonTag)
        } else {
          console.warn('unknown reason', reason)
          tags.push('unknown_reason')
        }
      }

      const events = notification._latestEvents ?? []
      if (context.viewerLogin) {
        const mention = events.find((e) => e.type === 'mention')
        if (mention?.actor === context.viewerLogin) {
          tags.push('direct_mention')
        }
        const assign = events.find((e) => e.type === 'assign')
        if (assign?.actor === context.viewerLogin) {
          tags.push('assigned')
        }
      }

      if (tags.length > 0) {
        notification.tags = [...new Set([...notification.tags, ...tags])]
      }
    }
    return batch
  }
}

export { ReasonTagger }
