const { fetchNotifications } = require('./github/notifications')
const { runPipeline } = require('./pipeline/runner')
const store = require('./store')

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

module.exports = { start, stop, poll }
