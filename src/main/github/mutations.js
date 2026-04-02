import { getGraphql, getRest } from './client.js'
import { buildUnsubscribeMutation } from './mutations/unsubscribe.js'

const BATCH_SIZE = 20

/**
 * Archive (mark done) notification threads via REST DELETE.
 * This removes them from the GitHub notification inbox entirely.
 */
async function archiveThreads(threadIds, onBatchDone) {
  const octokit = getRest()

  for (let i = 0; i < threadIds.length; i += BATCH_SIZE) {
    const batch = threadIds.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map((id) =>
        octokit.request('DELETE /notifications/threads/{thread_id}', { thread_id: id })
      )
    )
    if (onBatchDone) {
      await onBatchDone(batch)
    }
  }
}

/**
 * Unsubscribe from threads via GraphQL, then archive them via REST DELETE.
 */
async function unsubscribeAndArchive(subscribableIds, threadIds, onBatchDone) {
  const gql = getGraphql()
  const octokit = getRest()

  for (let i = 0; i < subscribableIds.length; i += BATCH_SIZE) {
    const subBatch = subscribableIds.slice(i, i + BATCH_SIZE)
    const threadBatch = threadIds.slice(i, i + BATCH_SIZE)

    await gql(buildUnsubscribeMutation(subBatch))

    await Promise.all(
      threadBatch.map((id) =>
        octokit.request('DELETE /notifications/threads/{thread_id}', { thread_id: id })
      )
    )

    if (onBatchDone) {
      await onBatchDone(threadBatch)
    }
  }
}

export { archiveThreads, unsubscribeAndArchive }
