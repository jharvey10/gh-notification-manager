import { broadcastBatchProgress } from './broadcastBatchProgress.js'

class ProgressTracker {
  #completed = 0
  #total

  /** @param {number} total */
  constructor(total) {
    this.#total = total
    if (total > 1) {
      broadcastBatchProgress({ completed: 0, total })
    }
  }

  /** @param {number} count */
  report(count) {
    if (this.#total <= 1) {
      return
    }
    this.#completed += count
    broadcastBatchProgress({ completed: this.#completed, total: this.#total })
  }

  done() {
    if (this.#total <= 1) {
      return
    }
    broadcastBatchProgress(null)
  }
}

export { ProgressTracker }
