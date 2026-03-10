import { GitHubNotifications } from './github/GitHubNotifications.js'
import { getGraphql } from './github/client.js'
import { VIEWER_LOGIN_QUERY } from './github/queries/viewer.js'
import { Pipeline } from './pipeline/Pipeline.js'
import { broadcastError } from './broadcastError.js'

const POLL_INTERVAL_MS = 60_000

class NotificationPoller {
  #timeoutId = null
  #stopped = false
  #notifications = new GitHubNotifications()
  #store
  #preferencesStore
  #viewerLogin = null

  constructor({ store, preferencesStore }) {
    console.log('constructed new notification poller')

    this.#store = store
    this.#preferencesStore = preferencesStore
  }

  async #resolveViewerLogin() {
    if (!this.#viewerLogin) {
      const data = await getGraphql()(VIEWER_LOGIN_QUERY)
      this.#viewerLogin = data.viewer.login
    }
    return this.#viewerLogin
  }

  async #poll({ shouldNotify = false } = {}) {
    console.log('polling notifications')

    try {
      const [updates, viewerLogin] = await Promise.all([
        this.#notifications.fetchNotifications(),
        this.#resolveViewerLogin()
      ])
      const userPreferences = this.#preferencesStore.get()
      const shouldSendOsNotifications = shouldNotify && userPreferences.osNotificationsEnabled

      if (this.#stopped) {
        return
      }

      const pipeline = new Pipeline({
        userPreferences,
        shouldNotify: shouldSendOsNotifications,
        viewerLogin,
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
      broadcastError('poller', err.message)
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
