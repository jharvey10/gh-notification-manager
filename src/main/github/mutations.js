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
    const t0 = performance.now()
    await Promise.all(
      batch.map((id) =>
        octokit.request('DELETE /notifications/threads/{thread_id}', { thread_id: id })
      )
    )
    console.debug(
      `[timing] REST DELETE /notifications/threads (batch ${Math.floor(i / BATCH_SIZE) + 1}, ${batch.length} threads): ${(performance.now() - t0).toFixed(0)}ms`
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
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    const tGql = performance.now()
    await gql(buildUnsubscribeMutation(subBatch))
    console.debug(
      `[timing] GQL unsubscribe mutation (batch ${batchNum}, ${subBatch.length} subs): ${(performance.now() - tGql).toFixed(0)}ms`
    )

    const tRest = performance.now()
    await Promise.all(
      threadBatch.map((id) =>
        octokit.request('DELETE /notifications/threads/{thread_id}', { thread_id: id })
      )
    )
    console.debug(
      `[timing] REST DELETE /notifications/threads (batch ${batchNum}, ${threadBatch.length} threads): ${(performance.now() - tRest).toFixed(0)}ms`
    )

    if (onBatchDone) {
      await onBatchDone(threadBatch)
    }
  }
}

export { archiveThreads, unsubscribeAndArchive }
