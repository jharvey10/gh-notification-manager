import type { BatchProcessor, Notification, PipelineContext } from './types.js'

class Pipeline {
  readonly #stages: BatchProcessor[]

  constructor(stages: BatchProcessor[]) {
    this.#stages = stages
  }

  async run(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    let current = batch

    for (const notification of current) {
      notification.tags = []
    }

    for (const stage of this.#stages) {
      current = await stage.process(current, context)
    }

    return current
  }
}

export { Pipeline }
