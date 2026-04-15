import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

const NON_ENRICHABLE_TYPES = new Set(['Commit', 'RepositoryVulnerabilityAlert'])

/**
 * Resolves GraphQL node IDs for notifications that need them.
 *
 * 1. Separates notifications that already have a nodeId (pass-through).
 * 2. Filters out non-enrichable types (Commit, RepositoryVulnerabilityAlert).
 * 3. Discovers nodeIds for the rest via GraphQL/REST.
 * 4. Drops any notification that still lacks a nodeId after discovery,
 *    so downstream stages can safely assume every notification has one.
 */
class NodeIdEnricher implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    const alreadyResolved = batch.filter((n) => n._nodeId)
    const needsWork = batch.filter((n) => !n._nodeId)

    const enrichable = needsWork.filter((n) => !NON_ENRICHABLE_TYPES.has(n.threadType))
    if (enrichable.length === 0) {
      return alreadyResolved
    }

    const targets = enrichable.map((n) => ({
      threadId: n.id,
      owner: n.owner,
      repo: n.repo,
      subjectType: n.threadType,
      subjectNumber: n.subjectNumber,
      subjectUrl: n.subjectUrl
    }))

    const discovered = await context.graphqlService.discoverNodeIds(targets)

    for (const notification of enrichable) {
      const nodeId = discovered.get(notification.id)
      if (nodeId) {
        notification._nodeId = nodeId
      }
    }

    const newlyResolved = enrichable.filter((n) => n._nodeId)
    return [...alreadyResolved, ...newlyResolved]
  }
}

export { NodeIdEnricher }
