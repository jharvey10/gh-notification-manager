/**
 * Formats a date as a relative "time ago" string.
 *
 * @param {string|Date} date
 * @param {Date} [now] - current time, overridable for testing
 * @returns {{ label: string, tooltip: string | null }}
 *   `label` is the display text ("now", "5m ago", "2h ago", "1d ago", or a locale date).
 *   `tooltip` is the full formatted date/time string.
 */
export function formatTimeAgo(date, now = new Date()) {
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  const fullDate = d.toLocaleString()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const dateOnly = `${yyyy}-${mm}-${dd}`

  if (diffMinutes < 1) {
    return { label: 'now', tooltip: fullDate }
  }
  if (diffMinutes < 60) {
    return { label: `${diffMinutes}m ago`, tooltip: fullDate }
  }
  if (diffHours < 24) {
    return { label: `${diffHours}h ago`, tooltip: fullDate }
  }
  if (diffDays <= 3) {
    return { label: `${diffDays}d ago`, tooltip: fullDate }
  }

  return { label: dateOnly, tooltip: fullDate }
}
