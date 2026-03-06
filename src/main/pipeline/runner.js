import { notify } from './notifier.js'

const taggers = []

function registerTagger(fn) {
  taggers.push(fn)
}

async function runPipeline(notification, { shouldNotify = false }) {
  const allTags = []

  for (const tagger of taggers) {
    try {
      const tags = await tagger(notification)
      if (Array.isArray(tags)) allTags.push(...tags)
    } catch (err) {
      console.error('Tagger failed:', err.message)
    }
  }

  notification.tags = [...new Set(allTags)]

  shouldNotify && notify(notification)

  return notification
}

export { registerTagger, runPipeline }
