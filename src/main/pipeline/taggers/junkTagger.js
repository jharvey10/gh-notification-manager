/**
 * Tags notifications based on the reason field for mention types.
 */
async function junkTagger(notification) {
  if (
    notification.title?.toLowerCase().match(/attempt #\d+ succeeded/) ||
    notification.title?.toLowerCase().includes('workflow run cancelled') ||
    notification.optionalList?.nameWithOwner?.toLowerCase() === 'grafana/deployment_tools'
  ) {
    return ['junk'];
  }

  return [];
}

module.exports = { junkTagger };
