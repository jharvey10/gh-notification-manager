import { GitHubNotifications } from './github/GitHubNotifications.js'
import { runPipeline } from './pipeline/runner.js'

const POLL_INTERVAL_MS = 30_000

class NotificationPoller {
  #timeoutId = null
  #stopped = false
  #notifications = new GitHubNotifications()
  #store

  constructor({ store }) {
    console.log('constructed new notification poller')

    this.#store = store
  }

  async #poll({ shouldNotify = false } = {}) {
    console.log('polling notifications')

    try {
      const updates = await this.#notifications.fetchNotifications()

      if (this.#stopped) {
        return
      }

      const results = []

      for (const [id, thread] of updates) {
        if (thread === null) {
          results.push([id, null])
          continue
        }

        thread.tags = []
        const tagged = await runPipeline(thread, { shouldNotify })
        if (this.#stopped) {
          return
        }
        results.push([tagged.id, tagged])
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
