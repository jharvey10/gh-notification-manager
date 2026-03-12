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

const DIRECT_EVENT_LABELS = {
  mention: 'Mention',
  reviewRequest: 'Review Request',
  assignment: 'Assigned'
}

const GITHUB_REASON_LABELS = {
  mention: 'Mention',
  team_mention: 'Team Mention',
  assign: 'Assigned',
  author: 'Author Activity',
  ci_activity: 'CI Activity',
  comment: 'Comment',
  state_change: 'State Change',
  review_requested: 'Review Request',
  security_alert: 'Security Alert'
}

function classifyNotificationReason(notification, { userPreferences, viewerLogin }) {
  const prefs = userPreferences
  const latestEvents = notification._latestEvents

  if (latestEvents) {
    if (prefs.osNotifyOnDirectMention && hasNewEvent('mention', latestEvents, viewerLogin)) {
      return { source: 'direct', key: 'mention' }
    }
    if (
      prefs.osNotifyOnDirectReviewRequest &&
      hasNewEvent('review_requested', latestEvents, viewerLogin)
    ) {
      return { source: 'direct', key: 'reviewRequest' }
    }
    if (prefs.osNotifyOnDirectAssignment && hasNewEvent('assign', latestEvents, viewerLogin)) {
      return { source: 'direct', key: 'assignment' }
    }
  }

  if (prefs.osNotifyOnSavedThreadActivity && notification.isSaved) {
    return { source: 'github', key: notification.reason?.toLowerCase() }
  }

  if (prefs.osNotifyOnAllNew) {
    return { source: 'github', key: notification.reason?.toLowerCase() }
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
  const label =
    reason.source === 'direct' ? DIRECT_EVENT_LABELS[reason.key] : GITHUB_REASON_LABELS[reason.key]
  const suffix = subjectSuffix(notification.optionalSubject)
  const prefix = label ?? 'Activity'
  return suffix ? `${prefix} · ${suffix}` : prefix
}

export async function notifyProcessor(notification, context) {
  if (!context.shouldNotify) {
    return notification
  }

  const reason = classifyNotificationReason(notification, context)
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
