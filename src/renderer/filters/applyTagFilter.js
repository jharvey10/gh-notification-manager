/**
 * @param {object[]} notifications
 * @param {import('./types.js').FilterSelection[]} data
 * @returns {object[]}
 */
export function applyTagFilter(notifications, data) {
  if (data.length === 0) {
    return notifications
  }

  const included = new Set(data.filter((s) => s.state === 'include').map((s) => s.value))
  const excluded = new Set(data.filter((s) => s.state === 'exclude').map((s) => s.value))

  return notifications.filter((n) => {
    const tags = n.tags || []
    if (included.size > 0 && !tags.some((t) => included.has(t))) {
      return false
    }
    if (excluded.size > 0 && tags.some((t) => excluded.has(t))) {
      return false
    }
    return true
  })
}
