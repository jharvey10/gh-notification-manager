import { getEventActor } from '../utils/notifications.js'

/**
 * @param {import('../../types').Notification[]} notifications
 * @param {string} data - search string
 * @returns {import('../../types').Notification[]}
 */
export function applyTextFilter(notifications, data) {
  if (!data) return notifications

  const lower = data.toLowerCase()

  return notifications.filter((n) => {
    const repo = n.optionalList?.nameWithOwner ?? ''
    const actor = getEventActor(n) ?? ''
    return `${n.title} ${repo} ${actor}`.toLowerCase().includes(lower)
  })
}
