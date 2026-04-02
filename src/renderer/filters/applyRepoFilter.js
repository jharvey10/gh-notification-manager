import { getNotificationRepo } from '../utils/notifications'

/**
 * @param {import('../../types').Notification[]} notifications
 * @param {import('./types').FilterSelection[]} data
 * @returns {import('../../types').Notification[]}
 */
export function applyRepoFilter(notifications, data) {
  if (data.length === 0) {
    return notifications
  }

  const included = new Set(data.filter((s) => s.state === 'include').map((s) => s.value))
  const excluded = new Set(data.filter((s) => s.state === 'exclude').map((s) => s.value))

  return notifications.filter((n) => {
    const repo = getNotificationRepo(n)
    if (included.size > 0 && !included.has(repo)) {
      return false
    }
    if (excluded.size > 0 && excluded.has(repo)) {
      return false
    }
    return true
  })
}
