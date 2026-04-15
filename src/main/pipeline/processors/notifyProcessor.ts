import { Notification as ElectronNotification } from 'electron'
import { getDisplayableTypeName } from '../../../shared/getDisplayableTypeName.js'
import type { BatchProcessor, LatestEvent, Notification, PipelineContext } from '../types.js'

class NotifyProcessor implements BatchProcessor {
  #lastNotifiedAt = new Date().toISOString()

  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    if (!context.shouldNotify) {
      return batch
    }

    const cutoff = this.#lastNotifiedAt
    let newestTimestamp = cutoff

    for (const notification of batch) {
      const mostRecent = this.#getMostRecentEvent(notification._latestEvents ?? [])
      if (!mostRecent || mostRecent.timestamp <= cutoff) {
        continue
      }

      if (mostRecent.timestamp > newestTimestamp) {
        newestTimestamp = mostRecent.timestamp
      }

      if (!notification._localData?.isUnread) {
        continue
      }

      const reason = this.#findTriggerType(notification, cutoff, context)
      if (!reason) {
        continue
      }

      const repo = notification.optionalList?.nameWithOwner ?? ''
      new ElectronNotification({
        title: this.#buildTitle(reason, notification),
        body: repo ? `[${repo}] ${notification.title}` : notification.title
      }).show()
    }

    this.#lastNotifiedAt = newestTimestamp

    return batch
  }

  #findTriggerType(
    notification: Notification,
    cutoff: string,
    context: PipelineContext
  ): string | null {
    const events = notification._latestEvents ?? []
    if (context.settings.osNotifyOnAllNew) {
      return this.#findRelevantEventType(events, context) ?? 'activity'
    }
    if (context.settings.osNotifyOnSavedThreadActivity && notification._localData?.isSaved) {
      return this.#findRelevantEventType(events, context) ?? 'saved'
    }
    return this.#findDirectEventType(events, cutoff, context)
  }

  #findDirectEventType(
    events: LatestEvent[],
    cutoff: string,
    context: PipelineContext
  ): string | null {
    const prefs = context.settings
    if (
      prefs.osNotifyOnDirectMention &&
      this.#hasNewEvent('mention', events, cutoff, context.viewerLogin)
    ) {
      return 'mention'
    }
    if (
      prefs.osNotifyOnDirectReviewRequest &&
      this.#hasNewEvent('review_requested', events, cutoff, context.viewerLogin)
    ) {
      return 'review_requested'
    }
    if (
      prefs.osNotifyOnDirectAssignment &&
      this.#hasNewEvent('assign', events, cutoff, context.viewerLogin)
    ) {
      return 'assign'
    }
    return null
  }

  #findRelevantEventType(events: LatestEvent[], context: PipelineContext): string | null {
    const relevant = events.filter((e) => e.type !== 'mention' || e.actor === context.viewerLogin)
    return this.#getMostRecentEvent(relevant)?.type ?? null
  }

  #hasNewEvent(
    type: string,
    events: LatestEvent[],
    cutoff: string,
    viewerLogin: string | null
  ): boolean {
    const event = events.find((e) => e.type === type)
    if (!event || event.timestamp <= cutoff) {
      return false
    }
    return !viewerLogin || event.actor === viewerLogin
  }

  #getMostRecentEvent(events: LatestEvent[]): LatestEvent | null {
    if (events.length === 0) {
      return null
    }
    return events.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b), events[0])
  }

  #buildTitle(reason: string, notification: Notification): string {
    const subject = notification.optionalSubject
    const typeName = getDisplayableTypeName(subject?.__typename)
    if (!typeName) {
      return reason
    }

    let num: number | null = null
    if (subject && 'number' in subject) {
      num = subject.number
    }

    const suffix = num ? `${typeName} #${num}` : typeName
    return `${reason} · ${suffix}`
  }
}

export { NotifyProcessor }
