import { fetchNotifications } from './github/notifications.js'
import { runPipeline } from './pipeline/runner.js'
import * as store from './store.js'

const POLL_INTERVAL_MS = 60_000
let intervalId = null

async function poll({ shouldNotify = false, onPollComplete = () => {} } = {}) {
  try {
    const threads = await fetchNotifications()
    store.initialize()

    for (const thread of threads) {
      if (store.has(thread.id)) continue
      thread.tags = []
      const tagged = await runPipeline(thread, { shouldNotify })
      store.upsert(tagged.id, tagged)
    }
  } catch (err) {
    console.error('Poll failed:', err.message)
  }

  onPollComplete()
}

function start({ onPollComplete = () => {} } = {}) {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(async () => {
    await poll({ shouldNotify: true, onPollComplete })
  }, POLL_INTERVAL_MS)
}

function stop() {
  if (intervalId) clearInterval(intervalId)
  intervalId = null
}

export { start, stop, poll }
