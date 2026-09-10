import { getGraphql, getRest } from './client.js'
import { VIEWER_LOGIN_QUERY } from './queries/viewer.js'
import {
  buildNodeIdDiscoveryQueries,
  extractDiscoveryResults,
  buildNodeEnrichmentQuery,
  extractNodeEnrichmentResults,
  buildFallbackEnrichmentQueries,
  extractFallbackEnrichmentResults,
  ENRICH_BATCH_SIZE
} from './queries/enrichSubjects.js'
import type { EnrichmentTarget } from '../pipeline/types.js'

interface EnrichSubjectsOptions {
  onBatchDone?: (results: Map<string, any>, batchSize: number) => void | Promise<void>
  onBatchFailed?: (threadIds: string[], message: string) => void | Promise<void>
}

class GitHubGraphQLService {
  #viewerLogin: string | null = null

  async resolveViewerLogin(): Promise<string> {
    if (!this.#viewerLogin) {
      const t0 = performance.now()
      const data = await getGraphql()(VIEWER_LOGIN_QUERY)
      console.debug(`[timing] GQL viewer login query: ${(performance.now() - t0).toFixed(0)}ms`)
      this.#viewerLogin = (data as { viewer: { login: string } }).viewer.login
    }
    return this.#viewerLogin
  }

  /**
   * Resolve GraphQL node IDs for targets that don't already have one.
   * PR/Issue/Discussion use a cheap GQL query; Release/CheckSuite use REST.
   */
  async discoverNodeIds(targets: EnrichmentTarget[]): Promise<Map<string, string>> {
    const needsDiscovery = targets.filter((t) => !t.nodeId)
    if (needsDiscovery.length === 0) {
      return new Map()
    }

    const allNodeIds = new Map<string, string>()
    const gql = getGraphql()

    const gqlTargets = needsDiscovery.filter(
      (t) => t.subjectType !== 'Release' && t.subjectType !== 'CheckSuite'
    )
    const restTargets = needsDiscovery.filter(
      (t): t is EnrichmentTarget & { subjectUrl: string } =>
        (t.subjectType === 'Release' || t.subjectType === 'CheckSuite') && Boolean(t.subjectUrl)
    )

    const discoveryBatches = buildNodeIdDiscoveryQueries(gqlTargets)
    for (const { query, mapping } of discoveryBatches) {
      try {
        const t0 = performance.now()
        const data = await gql<any>(query)
        console.debug(
          `[timing] GQL node ID discovery (${mapping.size} targets): ${(performance.now() - t0).toFixed(0)}ms`
        )
        const results = extractDiscoveryResults(data, mapping)
        for (const [threadId, nodeId] of results) {
          allNodeIds.set(threadId, nodeId)
        }
      } catch (err: unknown) {
        console.error('Node ID discovery batch failed:', (err as Error).message)
      }
    }

    if (restTargets.length > 0) {
      const octokit = getRest()
      const t0 = performance.now()
      const fetches = restTargets.map(async (target) => {
        try {
          const resp = await octokit.request(`GET ${new URL(target.subjectUrl).pathname}`)
          if (resp.data?.node_id) {
            allNodeIds.set(target.threadId, resp.data.node_id)
          }
        } catch (err: unknown) {
          console.warn(
            `Failed to fetch node_id for thread ${target.threadId}: ${(err as Error).message}`
          )
        }
      })
      await Promise.all(fetches)
      console.debug(
        `[timing] REST node ID discovery (${restTargets.length} targets): ${(performance.now() - t0).toFixed(0)}ms`
      )
    }

    return allNodeIds
  }

  /**
   * Enrich notification targets via GraphQL. Uses the fast nodes(ids: [...])
   * path for targets with a nodeId, and falls back to repo+number queries
   * for the rest.
   */
  async enrichSubjects(
    targets: EnrichmentTarget[],
    options?: EnrichSubjectsOptions
  ): Promise<Map<string, any>> {
    if (targets.length === 0) {
      return new Map()
    }

    const gql = getGraphql()
    const allResults = new Map<string, any>()

    const nodeIdTargets = targets.flatMap((t) =>
      t.nodeId
        ? [
            {
              nodeId: t.nodeId,
              subjectType: t.subjectType,
              threadId: t.threadId
            }
          ]
        : []
    )
    const fallbackTargets = targets.filter((t) => !t.nodeId)

    for (let i = 0; i < nodeIdTargets.length; i += ENRICH_BATCH_SIZE) {
      const batch = nodeIdTargets.slice(i, i + ENRICH_BATCH_SIZE)
      try {
        const { query, variables, threadIds } = buildNodeEnrichmentQuery(batch)
        const t0 = performance.now()
        const data = await gql<any>(query, variables)
        console.debug(
          `[timing] GQL nodes() enrichment (${batch.length} items): ${(performance.now() - t0).toFixed(0)}ms`
        )
        const results = extractNodeEnrichmentResults(data.nodes, threadIds)
        for (const [threadId, subject] of results) {
          allResults.set(threadId, subject)
        }
        await options?.onBatchDone?.(results, batch.length)
      } catch (err: unknown) {
        const message = (err as Error).message
        console.error('Node enrichment batch failed:', message)
        const threadIds = batch.map((item) => item.threadId)
        for (const threadId of threadIds) {
          allResults.set(threadId, null)
        }
        await options?.onBatchFailed?.(threadIds, message)
      }
    }

    if (fallbackTargets.length > 0) {
      const fallbackBatches = buildFallbackEnrichmentQueries(fallbackTargets)
      for (const { query, mapping } of fallbackBatches) {
        try {
          const t0 = performance.now()
          const data = await gql<any>(query)
          console.debug(
            `[timing] GQL fallback enrichment (${mapping.size} items): ${(performance.now() - t0).toFixed(0)}ms`
          )
          const results = extractFallbackEnrichmentResults(data, mapping)
          for (const [threadId, subject] of results) {
            allResults.set(threadId, subject)
          }
          await options?.onBatchDone?.(results, mapping.size)
        } catch (err: unknown) {
          const message = (err as Error).message
          console.error('Fallback enrichment batch failed:', message)
          const threadIds = [...mapping.values()]
          for (const threadId of threadIds) {
            allResults.set(threadId, null)
          }
          await options?.onBatchFailed?.(threadIds, message)
        }
      }
    }

    return allResults
  }
}

export { GitHubGraphQLService }
