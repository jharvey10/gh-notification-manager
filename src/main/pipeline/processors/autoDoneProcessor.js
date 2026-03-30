import { markThreadsAsDone } from '../../github/mutations.js'
import { broadcastError } from '../../broadcastError.js'

const DAY_IN_MS = 24 * 60 * 60 * 1000

/** @type {import('../Pipeline.js').PipelineProcessor} */
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
    console.log('Marking notification as done:', notification.id)
    await markThreadsAsDone([notification.id])
    invalidateCacheEntries?.([notification.id])
    return null
  } catch (err) {
    broadcastError('autoDone', err.message)
    return notification
  }
}
