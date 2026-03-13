import { getGraphql } from './client.js'
import { MARK_DONE_MUTATION } from './queries/markDone.js'
import { MARK_READ_MUTATION } from './queries/markRead.js'
import { MARK_UNREAD_MUTATION } from './queries/markUnread.js'
import { UNSUBSCRIBE_MUTATION } from './queries/unsubscribe.js'
import { UNSUBSCRIBE_AND_MARK_DONE_MUTATION } from './queries/unsubscribeAndMarkDone.js'
import { SAVE_THREAD_MUTATION } from './queries/saveThread.js'
import { UNSAVE_THREAD_MUTATION } from './queries/unsaveThread.js'

const BATCH_SIZE = 50

async function mutateInBatches(ids, mutation, label, onBatchDone) {
  const gql = getGraphql()

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    const result = await gql(mutation, { input: { ids: batch } })
    const payload = result[label]
    if (!payload?.success) {
      throw new Error(`${label} failed (batch ${i / BATCH_SIZE + 1})`)
    }
    if (onBatchDone) {
      await onBatchDone(batch)
    }
  }
}

async function markThreadsAsDone(ids, onBatchDone) {
  await mutateInBatches(ids, MARK_DONE_MUTATION, 'markNotificationsAsDone', onBatchDone)
}

async function markThreadsAsRead(ids, onBatchDone) {
  await mutateInBatches(ids, MARK_READ_MUTATION, 'markNotificationsAsRead', onBatchDone)
}

async function markThreadsAsUnread(ids, onBatchDone) {
  await mutateInBatches(ids, MARK_UNREAD_MUTATION, 'markNotificationsAsUnread', onBatchDone)
}

async function unsubscribeFromThreads(ids, onBatchDone) {
  await mutateInBatches(ids, UNSUBSCRIBE_MUTATION, 'unsubscribeFromNotifications', onBatchDone)
}

async function unsubscribeAndMarkDone(subscribableIds, threadIds, onBatchDone) {
  const gql = getGraphql()

  for (let i = 0; i < subscribableIds.length; i += BATCH_SIZE) {
    const subBatch = subscribableIds.slice(i, i + BATCH_SIZE)
    const threadBatch = threadIds.slice(i, i + BATCH_SIZE)
    const result = await gql(UNSUBSCRIBE_AND_MARK_DONE_MUTATION, {
      unsubscribeInput: { ids: subBatch },
      markDoneInput: { ids: threadBatch }
    })

    const failures = []
    if (!result.unsubscribeFromNotifications?.success) failures.push('unsubscribe')
    if (!result.markNotificationsAsDone?.success) failures.push('markDone')
    if (failures.length > 0) {
      throw new Error(`unsubscribeAndMarkDone failed (batch ${i / BATCH_SIZE + 1}): ${failures.join(', ')}`)
    }

    if (onBatchDone) {
      await onBatchDone(threadBatch)
    }
  }
}

async function saveThread(id) {
  const gql = getGraphql()
  const result = await gql(SAVE_THREAD_MUTATION, { input: { id } })
  if (!result.createSavedNotificationThread?.success) {
    console.error(`createSavedNotificationThread returned success=false for id ${id}`)
  }
}

async function unsaveThread(id) {
  const gql = getGraphql()
  const result = await gql(UNSAVE_THREAD_MUTATION, { input: { id } })
  if (!result.deleteSavedNotificationThread?.success) {
    console.error(`deleteSavedNotificationThread returned success=false for id ${id}`)
  }
}

export {
  markThreadsAsDone,
  markThreadsAsRead,
  markThreadsAsUnread,
  unsubscribeFromThreads,
  unsubscribeAndMarkDone,
  saveThread,
  unsaveThread
}
