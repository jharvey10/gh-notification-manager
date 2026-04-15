import {
  GitHubRESTService,
  PER_PAGE,
  type RestNotificationThread
} from './github/GitHubRESTService.js'
import { GitHubGraphQLService } from './github/GitHubGraphQLService.js'
import { broadcastError } from './broadcastError.js'
import { ProgressTracker } from './ProgressTracker.js'
import { createDefaultPipeline } from './pipeline/createDefaultPipeline.js'
import { toNotificationPartial } from './toNotificationPartial.js'
import type { Pipeline } from './pipeline/Pipeline.js'
import type { Notification } from './pipeline/types.js'
import type { NotificationStore } from './NotificationStore.js'
import type { PreferencesStore } from './PreferencesStore.js'

const DEFAULT_POLL_INTERVAL_MS = 60_000
const FALLBACK_SINCE = '2025-01-01T00:00:00Z'

class NotificationPoller {
  private static instance?: NotificationPoller

  static init(store: NotificationStore, preferencesStore: PreferencesStore) {
    if (NotificationPoller.instance) {
      throw new Error('NotificationPoller already initialized')
    }
    NotificationPoller.instance = new NotificationPoller(store, preferencesStore)
  }

  static getInstance(): NotificationPoller {
    if (!NotificationPoller.instance) {
      throw new Error('NotificationPoller not initialized')
    }

    return NotificationPoller.instance
  }

  #timeoutId: NodeJS.Timeout | null = null
  #stopped = false
  #pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
  readonly #store: NotificationStore
  readonly #preferencesStore: PreferencesStore
  #restService: GitHubRESTService
  #graphqlService: GitHubGraphQLService
  #pipeline: Pipeline

  private constructor(store: NotificationStore, preferencesStore: PreferencesStore) {
    this.#store = store
    this.#preferencesStore = preferencesStore
    this.#restService = new GitHubRESTService()
    this.#graphqlService = new GitHubGraphQLService()
    this.#pipeline = createDefaultPipeline()
  }

  async #poll({ shouldNotify = false } = {}) {
    console.log('polling notifications')

    let viewerLogin: string
    let restData: { threads: RestNotificationThread[]; pollInterval: number }

    try {
      viewerLogin = await this.#graphqlService.resolveViewerLogin()
      restData = await this.#fetchThreads()
      this.#pollIntervalMs = restData.pollInterval
    } catch (err) {
      broadcastError('poller', (err as Error).message)
      return
    }

    const relevant = this.#filterIrrelevant(restData.threads)
    console.log('Relevant notifications', relevant.length)

    const progress = new ProgressTracker(relevant.length, 'Fetching notification data')

    try {
      for (const chunk of this.#chunk(relevant, PER_PAGE)) {
        const batch = this.#upsertPartials(chunk)
        const results = await this.#runPipeline(batch, { viewerLogin, shouldNotify })
        this.#upsertResults(results)

        progress.report(chunk.length)
      }
    } catch (err) {
      broadcastError('poller', (err as Error).message)
    } finally {
      progress.done()
    }

    if (this.#stopped) {
      return
    }

    this.#timeoutId = setTimeout(() => {
      this.#poll({ shouldNotify: true })
    }, this.#pollIntervalMs)
  }

  #chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size))
    }
    return chunks
  }

  async #fetchThreads() {
    const since = this.#getSinceDate()
    const t0 = performance.now()
    const result = await this.#restService.fetchNotifications({ since })
    console.debug(
      `[timing] REST fetch (since=${since}): ${(performance.now() - t0).toFixed(0)}ms — ${result.threads.length} threads`
    )
    return result
  }

  /**
   * Drop threads that are deleted or unchanged since the last enrichment.
   * GitHub's `since` param is inclusive, so unchanged threads reappear
   * on every poll — especially after a reset where the `since` value
   * jumps and invalidates the 304 cache.
   */
  #filterIrrelevant(threads: RestNotificationThread[]) {
    return threads.filter((t) => {
      if (this.#store.isDeleted(t.threadId)) {
        return false
      }
      const storedUpdatedAt = this.#store.getUpdatedAt(t.threadId)
      return !storedUpdatedAt || t.updatedAt > storedUpdatedAt
    })
  }

  #upsertPartials(threads: RestNotificationThread[]): Notification[] {
    const partials = threads.map((t) => [t.threadId, toNotificationPartial(t)] as const)
    return this.#store.upsert(partials.map(([id, data]) => [id, data]))
  }

  async #runPipeline(
    batch: Notification[],
    { viewerLogin, shouldNotify }: { viewerLogin: string; shouldNotify: boolean }
  ) {
    const userPreferences = this.#preferencesStore.get()
    return this.#pipeline.run(batch, {
      store: this.#store,
      settings: userPreferences,
      viewerLogin,
      shouldNotify: shouldNotify && userPreferences.osNotificationsEnabled,
      graphqlService: this.#graphqlService,
      restService: this.#restService
    })
  }

  #upsertResults(results: Notification[]) {
    if (results.length > 0) {
      this.#store.upsert(results.map((n) => [n.id, n]))
    }
  }

  /**
   * Determine the "since" cutoff from the store's newest notification,
   * falling back to 2025-01-01 on first run so there's no fork in the logic.
   */
  #getSinceDate(): string {
    const all = this.#store.getAll()
    if (!all || all.length === 0) {
      return FALLBACK_SINCE
    }
    let newest = ''
    for (const n of all) {
      if (n.lastUpdatedAt && n.lastUpdatedAt > newest) {
        newest = n.lastUpdatedAt
      }
    }
    return newest || FALLBACK_SINCE
  }

  async start({ shouldNotify = true } = {}) {
    console.log('starting notification poller')
    if (this.#timeoutId) {
      return
    }
    this.#stopped = false
    await this.#poll({ shouldNotify })
  }

  async startDeferred({ shouldNotify = true } = {}) {
    console.log('deferred starting notification poller')
    if (this.#timeoutId) {
      return
    }
    this.#stopped = false

    this.#timeoutId = setTimeout(() => {
      this.#timeoutId = null
      this.start({ shouldNotify })
    }, this.#pollIntervalMs)
  }

  stop() {
    this.#stopped = true
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
  }

  /**
   * Tears down current services/pipeline and creates fresh ones.
   * Used after auth changes or store resets.
   */
  restart({ shouldNotify = false } = {}) {
    this.stop()
    this.#restService = new GitHubRESTService()
    this.#graphqlService = new GitHubGraphQLService()
    this.#pipeline = createDefaultPipeline()
    this.#pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
    this.start({ shouldNotify })
  }

  /**
   * Fully stops polling. Used when auth is cleared.
   */
  shutdown() {
    this.stop()
  }
}

export { NotificationPoller }
