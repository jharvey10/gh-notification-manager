/** @type {import('../Pipeline.js').PipelineProcessor} */
export async function junkTagProcessor(notification) {
  const isJunk =
    notification.title?.toLowerCase().match(/attempt #\d+ succeeded/) ||
    notification.title?.toLowerCase().includes('workflow run cancelled') ||
    notification.optionalSubject?.state === 'MERGED'

  if (isJunk) {
    notification.tags = [...new Set([...(notification.tags ?? []), 'junk'])]
  }

  return notification
}
