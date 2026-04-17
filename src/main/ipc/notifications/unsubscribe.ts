import { archiveThreads, unsubscribeAndArchive } from '../../github/mutations.js'
import { broadcastError } from '../../broadcastError.js'
import { ProgressTracker } from '../../ProgressTracker.js'
import { NotificationPoller } from '../../NotificationPoller.js'
import { getNotificationSubscribableTarget } from '../../../shared/notificationSubscription.js'
import type { IpcContext } from '../types.js'

export async function unsubscribe({ store }: IpcContext, ids: string[]) {
  const poller = NotificationPoller.getInstance()
  poller.stop()
  const progress = new ProgressTracker(ids.length, 'Unsubscribing')
  try {
    const subscribableIds: string[] = []
    const subscribableThreadIds: string[] = []
    const nonSubscribableThreadIds: string[] = []

    for (const id of ids) {
      const n = store.get(id)
      const target = getNotificationSubscribableTarget(n)
      if (target) {
        subscribableIds.push(target.id)
        subscribableThreadIds.push(id)
      } else {
        nonSubscribableThreadIds.push(id)
      }
    }

    const onBatchDone = (batch: string[]) => {
      store.upsert(batch.map((id) => [id, null]))
      progress.report(batch.length)
    }

    if (subscribableIds.length > 0) {
      await unsubscribeAndArchive(subscribableIds, subscribableThreadIds, onBatchDone)
    }

    if (nonSubscribableThreadIds.length > 0) {
      await archiveThreads(nonSubscribableThreadIds, onBatchDone)
    }
  } catch (err) {
    broadcastError('unsubscribe', (err as Error).message)
    throw err
  } finally {
    progress.done()
    poller.startDeferred()
  }
}
