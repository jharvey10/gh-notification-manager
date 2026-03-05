const { getGraphql } = require('./client');
const { MARK_DONE_MUTATION, MARK_READ_MUTATION } = require('./queries/notifications');

const BATCH_SIZE = 50;

async function mutateInBatches(ids, mutation, label, onBatchDone) {
  const gql = getGraphql();

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const result = await gql(mutation, { input: { ids: batch } });
    const payload = result[label];
    if (!payload?.success) {
      console.error(`${label} returned success=false for batch ${i / BATCH_SIZE + 1}`);
    }
    if (onBatchDone) {
      await onBatchDone(batch);
    }
  }
}

async function markThreadsAsDone(ids, onBatchDone) {
  await mutateInBatches(ids, MARK_DONE_MUTATION, 'markNotificationsAsDone', onBatchDone);
}

async function markThreadsAsRead(ids, onBatchDone) {
  await mutateInBatches(ids, MARK_READ_MUTATION, 'markNotificationsAsRead', onBatchDone);
}

module.exports = { markThreadsAsDone, markThreadsAsRead };
