import { autoDoneProcessor } from './processors/autoDoneProcessor.js'
import { notifyProcessor } from './processors/notifyProcessor.js'
import { junkTagProcessor } from './processors/junkTagProcessor.js'
import { reasonTagProcessor } from './processors/reasonTagProcessor.js'
import { reviewTypeTagProcessor } from './processors/reviewTypeTagProcessor.js'
import { subjectTagProcessor } from './processors/subjectTagProcessor.js'

const DEFAULT_PROCESSORS = Object.freeze([
  subjectTagProcessor,
  reviewTypeTagProcessor,
  reasonTagProcessor,
  junkTagProcessor,
  notifyProcessor,
  autoDoneProcessor
])

class Pipeline {
  #processors
  #context

  constructor({
    userPreferences = { autoMarkDoneEnabled: false },
    shouldNotify = false,
    invalidateCacheEntries,
    customProcessors = []
  } = {}) {
    this.#processors = [...DEFAULT_PROCESSORS, ...customProcessors]
    this.#context = {
      userPreferences,
      shouldNotify,
      invalidateCacheEntries
    }
  }

  async run(updates) {
    const notifications = updates.map(([, notification]) => notification).filter(Boolean)

    for (const notification of notifications) {
      notification.tags = []
    }

    const results = []

    for (const [id, notification] of updates) {
      if (notification === null) {
        results.push([id, null])
        continue
      }

      let currentNotification = notification
      const context = {
        ...this.#context,
        notifications
      }

      for (const processor of this.#processors) {
        if (currentNotification === null) {
          break
        }

        currentNotification = await processor(currentNotification, context)
      }

      results.push([id, currentNotification])
    }

    return results
  }
}

export { Pipeline }
