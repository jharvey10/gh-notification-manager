import type { BatchProcessor, Notification, PipelineContext } from '../types.js'
import type { GitHubPullRequestSubject } from '../../github/queries/types.js'

function getSizeTag(subject: GitHubPullRequestSubject, smallMax: number, largeMin: number): string {
  const totalLines = subject.additions + subject.deletions
  if (totalLines <= smallMax) {
    return 'pr_size_small'
  }
  if (totalLines >= largeMin) {
    return 'pr_size_large'
  }
  return 'pr_size_medium'
}

class PrSizeTagger implements BatchProcessor {
  async process(batch: Notification[], context: PipelineContext): Promise<Notification[]> {
    const { prSizeSmallMax: smallMax, prSizeLargeMin: largeMin } = context.settings

    for (const notification of batch) {
      const subject = notification.optionalSubject
      if (subject?.__typename !== 'PullRequest') {
        continue
      }
      if (subject.additions == null || subject.deletions == null) {
        continue
      }
      const tag = getSizeTag(subject, smallMax, largeMin)
      notification.tags = [...new Set([...notification.tags, tag])]
    }
    return batch
  }
}

export { PrSizeTagger }
