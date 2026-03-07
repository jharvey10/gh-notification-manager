/** @type {Map<string, object>} */
let notifications = null

function getAll() {
  return notifications ? Array.from(notifications.values()) : null
}

function initialize() {
  notifications ??= new Map()
}

function upsert(id, notification) {
  notifications ??= new Map()
  notifications.set(id, notification)
}

function remove(id) {
  notifications?.delete(id)
}

function has(id) {
  return notifications?.has(id)
}

function clear() {
  notifications?.clear()
}

function markRead(id) {
  const n = notifications?.get(id)
  if (n) notifications.set(id, { ...n, isUnread: false })
}

function markUnread(id) {
  const n = notifications?.get(id)
  if (n) notifications.set(id, { ...n, isUnread: true })
}

function setSaved(id, isSaved) {
  const n = notifications?.get(id)
  if (n) notifications.set(id, { ...n, isSaved })
}

export { getAll, initialize, upsert, remove, has, clear, markRead, markUnread, setSaved }
