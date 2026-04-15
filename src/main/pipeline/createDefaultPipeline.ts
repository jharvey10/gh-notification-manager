import { Pipeline } from './Pipeline.js'
import { NodeIdEnricher } from './enrichers/nodeIdEnricher.js'
import { GraphQLEnricher } from './enrichers/graphQLEnricher.js'
import { TimelineEventEnricher } from './enrichers/timelineEventEnricher.js'
import { SubjectTagger } from './taggers/subjectTagger.js'
import { CiTagger } from './taggers/ciTagger.js'
import { ReviewTypeTagger } from './taggers/reviewTypeTagger.js'
import { ReasonTagger } from './taggers/reasonTagger.js'
import { JunkTagger } from './taggers/junkTagger.js'
import { ActivityLabelProcessor } from './processors/activityLabelProcessor.js'
import { NotifyProcessor } from './processors/notifyProcessor.js'
import { AutoDoneProcessor } from './processors/autoDoneProcessor.js'

function createDefaultPipeline(): Pipeline {
  return new Pipeline([
    new NodeIdEnricher(),
    new GraphQLEnricher(),
    new TimelineEventEnricher(),

    new SubjectTagger(),
    new CiTagger(),
    new ReviewTypeTagger(),
    new ReasonTagger(),
    new JunkTagger(),

    new ActivityLabelProcessor(),
    new NotifyProcessor(),
    new AutoDoneProcessor()
  ])
}

export { createDefaultPipeline }
