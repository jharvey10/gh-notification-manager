export const getNotificationRepo = (notification) =>
  notification.optionalList?.nameWithOwner ?? 'unknown'

export function getEventActor(notification) {
  const events = notification._latestEvents?.curr ?? []
  if (events.length === 0) return null

  const mostRecent = events.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
  return mostRecent.type === 'mention'
    ? (events.find((e) => e.type === 'comment')?.actor ?? null)
    : (mostRecent.actor ?? null)
}

export const compareValues = (left, right) => left.localeCompare(right)
