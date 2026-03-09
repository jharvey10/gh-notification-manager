import { GitHubNotifications } from './github/GitHubNotifications.js'
import { Pipeline } from './pipeline/Pipeline.js'

const POLL_INTERVAL_MS = 60_000

class NotificationPoller {
  #timeoutId = null
  #stopped = false
  #notifications = new GitHubNotifications()
  #store
  #preferencesStore

  constructor({ store, preferencesStore }) {
    console.log('constructed new notification poller')

    this.#store = store
    this.#preferencesStore = preferencesStore
  }

  async #poll({ shouldNotify = false } = {}) {
    console.log('polling notifications')

    try {
      const updates = await this.#notifications.fetchNotifications()
      const userPreferences = this.#preferencesStore.get()
      const shouldSendOsNotifications = shouldNotify && userPreferences.osNotificationsEnabled

      if (this.#stopped) {
        return
      }

      const pipeline = new Pipeline({
        userPreferences,
        shouldNotify: shouldSendOsNotifications,
        invalidateCacheEntries: (ids) => this.#notifications.invalidate(ids)
      })
      const results = await pipeline.run(updates)

      if (this.#stopped) {
        return
      }

      if (results.length > 0) {
        this.#store.upsert(results)
      } else {
        console.log('no upserts needed after polling')
      }
    } catch (err) {
      console.error('Poll failed:', err.message)
    }

    if (this.#stopped) {
      return
    }

    this.#timeoutId = setTimeout(() => {
      this.#poll({ shouldNotify: true })
    }, POLL_INTERVAL_MS)
  }

  async start() {
    console.log('starting notification poller')
    if (this.#timeoutId || this.#stopped) {
      return
    }

    await this.#poll({ shouldNotify: false })
  }

  invalidateCacheEntries(ids) {
    this.#notifications.invalidate(ids)
  }

  stop() {
    this.#stopped = true
    clearTimeout(this.#timeoutId)
    this.#timeoutId = null
  }
}

export { NotificationPoller }
