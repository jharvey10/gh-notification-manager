/**
 * Resolves the Subscribable node ID from a notification's optionalSubject.
 *
 * Issue, PullRequest, and Discussion are directly Subscribable.
 * CheckSuite and Release aren't, but their associated commit is.
 *
 * Returns null if no subscribable ID can be found.
 */
function findSubscribableId(notification) {
  const subject = notification?.optionalSubject
  return subject?.id ?? subject?.commit?.id ?? subject?.tagCommit?.id ?? null
}

export { findSubscribableId }
