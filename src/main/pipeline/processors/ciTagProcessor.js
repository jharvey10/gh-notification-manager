const TITLE_PATTERNS = [
  { pattern: /\bsucceeded\b/i, tag: 'ci_success' },
  { pattern: /\bfailed\b|\bnot successful\b/i, tag: 'ci_failure' },
  { pattern: /\bcancelled\b|\bcanceled\b/i, tag: 'ci_cancelled' },
  { pattern: /\btimed?\s*out\b/i, tag: 'ci_timed_out' },
  { pattern: /\bskipped\b/i, tag: 'ci_skipped' },
  { pattern: /\baction.required\b|\bwaiting\b|\bapproval\b/i, tag: 'ci_action_required' },
  { pattern: /\bin.progress\b|\brunning\b/i, tag: 'ci_in_progress' },
  { pattern: /\bqueued\b|\bpending\b/i, tag: 'ci_queued' },
  { pattern: /\bstartup.failure\b/i, tag: 'ci_startup_failure' },
  { pattern: /\bneutral\b/i, tag: 'ci_neutral' },
  { pattern: /\bstale\b/i, tag: 'ci_stale' }
]

function ciTagFromTitle(title) {
  if (!title) {
    return null
  }
  const lower = title.toLowerCase()
  for (const { pattern, tag } of TITLE_PATTERNS) {
    if (pattern.test(lower)) {
      return tag
    }
  }
  return null
}

/**
 * Adds detailed CI status tags by parsing the notification title.
 * Runs after subjectTagProcessor as a fallback for when GraphQL enrichment
 * doesn't return check suite status/conclusion data.
 *
 * @type {import('../Pipeline.js').PipelineProcessor}
 */
export async function ciTagProcessor(notification) {
  const tags = notification.tags ?? []
  const isCI = tags.includes('ci')
  const alreadyHasDetailedTag = tags.some((t) => t !== 'ci' && t.startsWith('ci_'))

  if (!isCI || alreadyHasDetailedTag) {
    return notification
  }

  const tag = ciTagFromTitle(notification.title)
  if (tag) {
    notification.tags = [...new Set([...tags, tag])]
  }

  return notification
}

export { ciTagFromTitle, TITLE_PATTERNS }
