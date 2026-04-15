import type { BatchProcessor, Notification, PipelineContext } from '../types.js'

class JunkTagger implements BatchProcessor {
  async process(batch: Notification[], _context: PipelineContext): Promise<Notification[]> {
    for (const notification of batch) {
      const subject = notification.optionalSubject
      const subjectState = subject && 'state' in subject ? (subject.state as string) : null
      const isJunk =
        notification.title?.toLowerCase().match(/attempt #\d+ succeeded/) ||
        notification.title?.toLowerCase().includes('workflow run cancelled') ||
        (subjectState !== null && ['MERGED', 'CLOSED'].includes(subjectState))

      if (isJunk) {
        notification.tags = [...new Set([...notification.tags, 'junk'])]
      }
    }
    return batch
  }
}

export { JunkTagger }
