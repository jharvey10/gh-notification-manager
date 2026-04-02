import { getDisplayableTypeName } from './getDisplayableTypeName.js'

/** @typedef {import('../main/github/queries/fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode */

function shortSha(oid) {
  return typeof oid === 'string' && oid.length > 0 ? oid.slice(0, 7) : null
}

/**
 * @param {GitHubNotificationNode} notification
 * @returns {string | null}
 */
export function formatNotificationReference(notification) {
  const subject = notification.optionalSubject
  if (!subject?.__typename) {
    return null
  }
  const subjectType = subject.__typename

  switch (subjectType) {
    case 'PullRequest':
    case 'Issue':
    case 'Discussion': {
      return typeof subject.number === 'number'
        ? `#${subject.number}`
        : getDisplayableTypeName(subjectType)
    }
    case 'Release':
      return subject.tagName ? `release ${subject.tagName}` : 'release'
    case 'CheckSuite': {
      const sha = shortSha(subject.commit?.oid)
      return sha ? `ci ${sha}` : 'ci'
    }
    default:
      return getDisplayableTypeName(subjectType)
  }
}
