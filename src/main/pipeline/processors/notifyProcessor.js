import { Notification } from 'electron'
import { getDisplayableTypeName } from '../../../shared/getDisplayableTypeName.js'

function hasNewEvent(type, latestEvents, viewerLogin) {
  const { prev, curr } = latestEvents
  const currEvent = curr.find((e) => e.type === type)
  if (!currEvent) {
    return false
  }
  if (viewerLogin && currEvent.actor !== viewerLogin) {
    return false
  }
  const prevEvent = prev.find((e) => e.type === type)
  return currEvent.timestamp !== prevEvent?.timestamp
}

function getMostRecentEvent(events) {
  if (!events || events.length === 0) {
    return null
  }
  return events.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
}

function findDirectEventType(latestEvents, { userPreferences, viewerLogin }) {
  if (!latestEvents) {
    return null
  }

  const prefs = userPreferences

  if (prefs.osNotifyOnDirectMention && hasNewEvent('mention', latestEvents, viewerLogin)) {
    return 'mention'
  }
  if (
    prefs.osNotifyOnDirectReviewRequest &&
    hasNewEvent('review_requested', latestEvents, viewerLogin)
  ) {
    return 'review_requested'
  }
  if (prefs.osNotifyOnDirectAssignment && hasNewEvent('assign', latestEvents, viewerLogin)) {
    return 'assign'
  }
  return null
}

function findRelevantEventType(notification, context) {
  const events = notification._latestEvents?.curr ?? []
  const relevant = events.filter((e) => e.type !== 'mention' || e.actor === context.viewerLogin)
  return getMostRecentEvent(relevant)?.type ?? null
}

function findNotificationTriggerType(notification, context) {
  if (context.userPreferences.osNotifyOnAllNew) {
    return findRelevantEventType(notification, context) ?? 'activity'
  }

  if (context.userPreferences.osNotifyOnSavedThreadActivity && notification._localData?.isSaved) {
    return findRelevantEventType(notification, context) ?? 'saved'
  }

  const directEventType = findDirectEventType(notification._latestEvents, context)
  if (directEventType) {
    return directEventType
  }

  return null
}

function subjectSuffix(subject) {
  const typeName = getDisplayableTypeName(subject?.__typename)
  if (!typeName) {
    return ''
  }
  const num = subject.number
  return num ? `${typeName} #${num}` : typeName
}

function buildNotificationTitle(reason, notification) {
  const suffix = subjectSuffix(notification.optionalSubject)
  return suffix ? `${reason} · ${suffix}` : reason
}

/** @type {import('../Pipeline.js').PipelineProcessor} */
export async function notifyProcessor(notification, context) {
  if (!context.shouldNotify) {
    return notification
  }
  if (!notification._localData?.isUnread) {
    return notification
  }

  const reason = findNotificationTriggerType(notification, context)
  if (!reason) {
    return notification
  }

  const repo = notification.optionalList?.nameWithOwner ?? ''

  new Notification({
    title: buildNotificationTitle(reason, notification),
    body: repo ? `[${repo}] ${notification.title}` : notification.title
  }).show()

  return notification
}
