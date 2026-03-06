export function getDisplayableTypeName(type) {
  switch (type) {
    case 'PullRequest':
      return 'PR'
    case 'Issue':
      return 'Issue'
    case 'CheckSuite':
      return 'CI'
    case 'Release':
      return 'Release'
    case 'Discussion':
      return 'Discussion'
    default:
      return type
  }
}
