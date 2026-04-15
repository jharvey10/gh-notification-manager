import type { BatchProcessor, Notification, PipelineContext } from './types.js'
import { NodeIdEnricher } from './enrichers/nodeIdEnricher.js'
import { GraphQLEnricher } from './enrichers/graphQLEnricher.js'
import { TimelineEventEnricher } from './enrichers/timelineEventEnricher.js'
import { SubjectTagger } from './taggers/subjectTagger.js'
import { PrSizeTagger } from './taggers/prSizeTagger.js'
import { CiTagger } from './taggers/ciTagger.js'
import { ReviewTypeTagger } from './taggers/reviewTypeTagger.js'
import { ReasonTagger } from './taggers/reasonTagger.js'
import { JunkTagger } from './taggers/junkTagger.js'
import { ActivityLabelProcessor } from './processors/activityLabelProcessor.js'
import { NotifyProcessor } from './processors/notifyProcessor.js'
import { AutoDoneProcessor } from './processors/autoDoneProcessor.js'

class Pipeline {
  readonly #stages: BatchProcessor[]

  constructor(stages: BatchProcessor[]) {
    this.#stages = stages
  }

  static createDefault(): Pipeline {
    return new Pipeline([
      new NodeIdEnricher(),
      new GraphQLEnricher(),
      new TimelineEventEnricher(),

      new SubjectTagger(),
      new PrSizeTagger(),
      new CiTagger(),
      new ReviewTypeTagger(),
      new ReasonTagger(),
      new JunkTagger(),

      new ActivityLabelProcessor(),
      new NotifyProcessor(),
      new AutoDoneProcessor()
    ])
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
