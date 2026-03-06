import { Notification } from 'electron'
import { formatNotificationType } from '../../shared/formatNotificationType.js'

/**
 * Decides whether a processed notification should trigger a macOS push
 * notification. Fill in your own logic based on the tags attached by
 * the pipeline.
 *
 * @param {object} notification - The tagged notification object
 * @returns {boolean} true to fire a desktop notification
 */
function shouldNotify(notification) {
  const { tags } = notification

  if (tags.includes('direct_review')) return true
  if (tags.includes('direct_mention')) return true

  return false
}

async function notify(notification) {
  if (!shouldNotify(notification)) return

  new Notification({
    title: `${formatNotificationType(notification)} [${notification.optionalList?.nameWithOwner ?? 'unknown'}]`,
    body: `${notification.title}`
  }).show()
}

export { notify }
