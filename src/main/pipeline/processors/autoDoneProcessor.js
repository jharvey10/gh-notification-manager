import { markThreadsAsDone } from '../../github/mutations.js'

const DAY_IN_MS = 24 * 60 * 60 * 1000

export async function autoDoneProcessor(notification, { userPreferences, invalidateCacheEntries }) {
  if (!userPreferences.autoMarkDoneEnabled || notification.isSaved) {
    return notification
  }

  const cutoffTime = Date.now() - userPreferences.autoMarkDoneDays * DAY_IN_MS
  const updatedAt = Date.parse(notification.lastUpdatedAt)
  if (!Number.isFinite(updatedAt) || updatedAt >= cutoffTime) {
    return notification
  }

  try {
    await markThreadsAsDone([notification.id])
    invalidateCacheEntries?.([notification.id])
    return null
  } catch (err) {
    console.error('Auto mark-done failed:', err.message)
    return notification
  }
}
