/**
 * Tags notifications based on the reason field for mention types.
 */
export async function junkTagger(notification) {
  if (
    notification.title?.toLowerCase().match(/attempt #\d+ succeeded/) ||
    notification.title?.toLowerCase().includes('workflow run cancelled') ||
    notification.optionalSubject?.state === 'MERGED'
  ) {
    return ['junk']
  }

  return []
}
