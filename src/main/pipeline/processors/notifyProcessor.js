import { Notification } from 'electron'
import { formatNotificationType } from '../../../shared/formatNotificationType.js'

function shouldFireNotification(notification) {
  if (!notification.isUnread) {
    return false
  }

  const { tags } = notification

  if (tags.includes('direct_review')) {
    return true
  }
  if (tags.includes('direct_mention')) {
    return true
  }

  return false
}

export async function notifyProcessor(notification, { shouldNotify }) {
  if (!shouldNotify || !shouldFireNotification(notification)) {
    return notification
  }

  new Notification({
    title: `${formatNotificationType(notification)} [${notification.optionalList?.nameWithOwner ?? 'unknown'}]`,
    body: `${notification.title}`
  }).show()

  return notification
}
