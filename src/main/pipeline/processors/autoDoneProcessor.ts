import { broadcastError } from '../../broadcastError.js'
import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const DAY_IN_MS = 24 * 60 * 60 * 1000

class AutoDoneProcessor implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    if (!context.settings.autoMarkDoneEnabled) {
      return batch
    }

    const cutoffTime = Date.now() - (context.settings.autoMarkDoneDays as number) * DAY_IN_MS
    const toArchive: string[] = []

    for (const notification of batch) {
      if (notification._localData?.isSaved) {
        continue
      }
      const updatedAt = Date.parse(notification.lastUpdatedAt)
      if (!Number.isFinite(updatedAt) || updatedAt >= cutoffTime) {
        continue
      }
      toArchive.push(notification.id)
    }

    if (toArchive.length === 0) {
      return batch
    }

    try {
      console.log(`Auto-archiving ${toArchive.length} notifications`)
      await context.restService.deleteThreads(toArchive)
      context.store.markDeleted(toArchive)
    } catch (err: unknown) {
      broadcastError('autoDone', (err as Error).message)
      return batch
    }

    const archived = new Set(toArchive)
    return batch.filter((n) => !archived.has(n.id))
  }
}

export { AutoDoneProcessor }
