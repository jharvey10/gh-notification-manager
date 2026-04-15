import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const NON_ENRICHABLE_TYPES = new Set(['Commit', 'RepositoryVulnerabilityAlert'])

class GraphQLEnricher implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    const enrichable = batch.filter((n) => !NON_ENRICHABLE_TYPES.has(n.threadType))
    if (enrichable.length === 0) {
      return batch
    }

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
    let enrichedSoFar = 0

    await context.graphqlService.enrichSubjects(targets, {
      onBatchDone: async (batchResults, batchSize) => {
        for (const [threadId, subject] of batchResults) {
          const notification = notificationMap.get(threadId)
          if (notification && subject) {
            notification.optionalSubject = subject
            notification._nodeId = subject.id ?? notification._nodeId
          }
        }

        enrichedSoFar += batchSize
      }
    })

    return batch
  }
}

export { GraphQLEnricher }
