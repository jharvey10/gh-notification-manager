import { autoDoneProcessor } from './processors/autoDoneProcessor.js'
import { notifyProcessor } from './processors/notifyProcessor.js'
import { activityLabelProcessor } from './processors/activityLabelProcessor.js'
import { junkTagProcessor } from './processors/junkTagProcessor.js'
import { reasonTagProcessor } from './processors/reasonTagProcessor.js'
import { reviewTypeTagProcessor } from './processors/reviewTypeTagProcessor.js'
import { subjectTagProcessor } from './processors/subjectTagProcessor.js'

const DEFAULT_PROCESSORS = Object.freeze([
  subjectTagProcessor,
  reviewTypeTagProcessor,
  reasonTagProcessor,
  activityLabelProcessor,
  junkTagProcessor,
  notifyProcessor,
  autoDoneProcessor
])

/**
 * @typedef {Record<string, any>} PipelineNotification
 * @typedef {[string, PipelineNotification | null]} NotificationEntry
 * @typedef {Map<string, PipelineNotification | null> | NotificationEntry[]} NotificationUpdates
 * @typedef {{
 *   userPreferences: Record<string, any>,
 *   shouldNotify: boolean,
 *   viewerLogin: string | null,
 *   invalidateCacheEntries?: (ids: string[]) => void,
 *   notifications: PipelineNotification[]
 * }} PipelineContext
 * @typedef {(notification: PipelineNotification, context: PipelineContext) => Promise<PipelineNotification | null> | PipelineNotification | null} PipelineProcessor
 * @typedef {{
 *   userPreferences?: { autoMarkDoneEnabled?: boolean },
 *   shouldNotify?: boolean,
 *   viewerLogin?: string | null,
 *   invalidateCacheEntries?: (ids: string[]) => void,
 *   customProcessors?: PipelineProcessor[]
 * }} PipelineOptions
 */

class Pipeline {
  #processors
  #context

  /**
   * @param {PipelineOptions} [options]
   */
  constructor({
    userPreferences = { autoMarkDoneEnabled: false },
    shouldNotify = false,
    viewerLogin = null,
    invalidateCacheEntries,
    customProcessors = []
  } = {}) {
    this.#processors = [...DEFAULT_PROCESSORS, ...customProcessors]
    this.#context = {
      userPreferences,
      shouldNotify,
      viewerLogin,
      invalidateCacheEntries
    }
  }

  /**
   * @param {NotificationUpdates} updates
   */
  async run(updates) {
    const entries = Array.isArray(updates) ? updates : Array.from(updates)
    const notifications = entries.map(([, notification]) => notification).filter(Boolean)

    for (const notification of notifications) {
      notification.tags = []
    }

    const results = []

    for (const [id, notification] of entries) {
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
