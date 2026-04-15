import { broadcastBatchProgress } from './broadcastBatchProgress.js'

class ProgressTracker {
  #completed: number = 0
  readonly #total: number
  readonly #reason: string

  constructor(total: number, reason: string) {
    this.#total = total
    this.#reason = reason
    if (total > 1) {
      broadcastBatchProgress({ completed: 0, total, reason: this.#reason })
    }
  }

  report(count: number) {
    if (this.#total <= 1) {
      return
    }
    this.#completed += count
    broadcastBatchProgress({
      completed: this.#completed,
      total: this.#total,
      reason: this.#reason
    })
  }

  done() {
    if (this.#total <= 1) {
      return
    }
    broadcastBatchProgress(null)
  }
}

export { ProgressTracker }
