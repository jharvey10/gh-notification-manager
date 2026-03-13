/**
 * Resolves the normalized subscribable target from a notification's
 * optionalSubject.
 *
 * Issue, PullRequest, and Discussion are directly Subscribable.
 * CheckSuite and Release aren't, but their associated commit is.
 *
 * Returns null if no subscribable target can be found.
 */
function getNotificationSubscribableTarget(notification) {
  const subject = notification?.optionalSubject
  if (!subject) {
    return null
  }

  if (subject.id) {
    return {
      id: subject.id,
      viewerSubscription: subject.viewerSubscription ?? null
    }
  }

  const commitTarget = subject.commit ?? subject.tagCommit
  if (!commitTarget?.id) {
    return null
  }

  return {
    id: commitTarget.id,
    viewerSubscription: commitTarget.viewerSubscription ?? null
  }
}

/**
 * Returns true when the notification should show an unsubscribe action.
 *
 * For direct subscribable subjects, prefer GitHub's explicit viewer subscription
 * state. For other subject shapes, fall back to whether we can resolve a
 * subscribable node ID at all.
 */
function canUnsubscribeNotification(notification) {
  const target = getNotificationSubscribableTarget(notification)
  if (!target) {
    return false
  }

  if (target.viewerSubscription) {
    return target.viewerSubscription !== 'UNSUBSCRIBED'
  }

  return true
}

export { canUnsubscribeNotification, getNotificationSubscribableTarget }
