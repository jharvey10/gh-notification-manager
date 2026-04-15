import { archiveThreads } from '../../github/mutations.js'
import { broadcastError } from '../../broadcastError.js'
import { ProgressTracker } from '../../ProgressTracker.js'
import { NotificationPoller } from '../../NotificationPoller.js'
import type { IpcContext } from '../types.js'

export async function markDone({ store }: IpcContext, ids: string[]) {
  const poller = NotificationPoller.getInstance()
  poller.stop()
  const progress = new ProgressTracker(ids.length, 'Marking done')
  try {
    await archiveThreads(ids, (batch) => {
      store.markDeleted(batch)
      progress.report(batch.length)
    })
  } catch (err) {
    broadcastError('markDone', (err as Error).message)
    throw err
  } finally {
    progress.done()
    poller.startDeferred()
  }
}
