import { getGraphql } from './client.js'
import { MARK_DONE_MUTATION } from './queries/markDone.js'
import { MARK_READ_MUTATION } from './queries/markRead.js'
import { MARK_UNREAD_MUTATION } from './queries/markUnread.js'
import { UNSUBSCRIBE_MUTATION } from './queries/unsubscribe.js'
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
      console.error(`${label} returned success=false for batch ${i / BATCH_SIZE + 1}`)
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
  saveThread,
  unsaveThread
}
