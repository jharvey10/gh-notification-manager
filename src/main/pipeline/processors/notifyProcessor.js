import { Notification } from 'electron'
import { formatNotificationType } from '../../../shared/formatNotificationType.js'

function hasNewDirectEvent(type, directEvents, viewerLogin) {
  const { prev, curr } = directEvents

  switch (type) {
    case 'mention':
      return (
        curr.lastMentionedAt !== null &&
        curr.lastMentionedAt !== prev.lastMentionedAt &&
        curr.mentionedLogin === viewerLogin
      )
    case 'assignment':
      return (
        curr.lastAssignedAt !== null &&
        curr.lastAssignedAt !== prev.lastAssignedAt &&
        curr.assignedLogin === viewerLogin
      )
    case 'reviewRequest':
      return (
        curr.lastReviewRequestedAt !== null &&
        curr.lastReviewRequestedAt !== prev.lastReviewRequestedAt &&
        curr.reviewRequestedLogin === viewerLogin
      )
    default:
      return false
  }
}

function shouldFireNotification(notification, { userPreferences, viewerLogin }) {
  const prefs = userPreferences

  if (prefs.osNotifyOnAllNew) {
    return true
  }

  if (prefs.osNotifyOnSavedThreadActivity && notification.isSaved) {
    return true
  }

  const directEvents = notification._directEvents
  if (!directEvents) {
    return false
  }

  if (prefs.osNotifyOnDirectMention && hasNewDirectEvent('mention', directEvents, viewerLogin)) {
    return true
  }

  if (prefs.osNotifyOnDirectReviewRequest && hasNewDirectEvent('reviewRequest', directEvents, viewerLogin)) {
    return true
  }

  if (prefs.osNotifyOnDirectAssignment && hasNewDirectEvent('assignment', directEvents, viewerLogin)) {
    return true
  }

  return false
}

export async function notifyProcessor(notification, context) {
  if (!context.shouldNotify || !shouldFireNotification(notification, context)) {
    return notification
  }

  new Notification({
    title: `${formatNotificationType(notification)} [${notification.optionalList?.nameWithOwner ?? 'unknown'}]`,
    body: `${notification.title}`
  }).show()

  return notification
}
