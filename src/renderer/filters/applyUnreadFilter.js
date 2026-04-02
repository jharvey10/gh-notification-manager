/**
 * @param {object[]} notifications
 * @param {boolean} data - whether unread-only mode is enabled
 * @returns {object[]}
 */
export function applyUnreadFilter(notifications, data) {
  if (!data) {
    return notifications
  }
  return notifications.filter((n) => n._localData?.isUnread)
}
