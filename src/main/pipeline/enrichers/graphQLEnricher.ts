import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const NON_ENRICHABLE_TYPES = new Set(['Commit', 'RepositoryVulnerabilityAlert'])
const NULL_SUBJECT_MESSAGE = 'GitHub returned no subject data for this notification'

function markEnrichmentOk(notification: Notification, updatedAt = new Date().toISOString()) {
  notification._enrichmentStatus = {
    state: 'ok',
    updatedAt
  }
}

function markEnrichmentFailed(
  notification: Notification,
  message: string,
  updatedAt = new Date().toISOString()
) {
  const previousStatus = notification._enrichmentStatus
  notification._enrichmentStatus = {
    state: 'failed',
    stage: 'subject_enrichment',
    message,
    firstFailedAt: previousStatus?.state === 'failed' ? previousStatus.firstFailedAt : updatedAt,
    updatedAt
  }
}

class GraphQLEnricher implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    const enrichable = batch.filter((n) => !NON_ENRICHABLE_TYPES.has(n.threadType))
    if (enrichable.length > 0) {
      await this.#enrichSubjects(batch, enrichable, context)
    }

    return batch
  }

  async #enrichSubjects(
    batch: Notification[],
    enrichable: Notification[],
    context: PipelineContext
  ) {
    const targets = enrichable.map((n) => ({
      threadId: n.id,
      owner: n.owner,
      repo: n.repo,
      subjectType: n.threadType,
      subjectNumber: n.subjectNumber,
      subjectUrl: n.subjectUrl,
      nodeId: n._nodeId
    }))

    const notificationMap = new Map(batch.map((n) => [n.id, n]))

    await context.graphqlService.enrichSubjects(targets, {
      onBatchDone: async (batchResults) => {
        const updatedAt = new Date().toISOString()
        for (const [threadId, subject] of batchResults) {
          const notification = notificationMap.get(threadId)
          if (notification && subject) {
            notification.optionalSubject = subject
            notification._nodeId = subject.id ?? notification._nodeId
            markEnrichmentOk(notification, updatedAt)
          } else if (notification) {
            markEnrichmentFailed(notification, NULL_SUBJECT_MESSAGE, updatedAt)
          }
        }
      },
      onBatchFailed: async (threadIds, message) => {
        const updatedAt = new Date().toISOString()
        for (const threadId of threadIds) {
          const notification = notificationMap.get(threadId)
          if (notification) {
            markEnrichmentFailed(notification, message, updatedAt)
          }
        }
      }
    })
  }
}

export { GraphQLEnricher }
