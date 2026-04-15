import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

/**
 * Tags notifications with direct_review (you personally) or
 * team_review (one of your teams) based on the PR's current review
 * request list — regardless of what notification.reason reports,
 * since GitHub only surfaces the single most "important" reason.
 */
class ReviewTypeTagger implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    for (const notification of batch) {
      const subject = notification.optionalSubject
      if (subject?.__typename !== 'PullRequest') {
        continue
      }
      const nodes = subject.reviewRequests?.nodes
      if (!Array.isArray(nodes)) {
        continue
      }

      const tags: string[] = []
      for (const { requestedReviewer: reviewer } of nodes) {
        if (reviewer?.__typename === 'User' && reviewer.login === context.viewerLogin) {
          tags.push('direct_review')
        }
        if (reviewer?.__typename === 'Team') {
          tags.push('team_review')
        }
      }

      if (tags.length > 0) {
        notification.tags = [...new Set([...notification.tags, ...tags])]
      }
    }
    return batch
  }
}

export { ReviewTypeTagger }
