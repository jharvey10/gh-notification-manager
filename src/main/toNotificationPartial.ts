import type { RestNotificationThread } from './github/GitHubRESTService.js'
import type { UpsertData } from './NotificationStore.js'

/**
 * Convert a raw REST notification thread into a partial notification
 * containing only the fields the REST API provides. The store's upsert
 * handles merging these with any previously-enriched data.
 */
function toNotificationPartial(thread: RestNotificationThread): UpsertData {
  return {
    id: thread.threadId,
    title: thread.title,
    threadType: thread.subjectType,
    url: thread.webUrl,
    reason: thread.reason,
    lastUpdatedAt: thread.updatedAt,
    optionalList: {
      nameWithOwner: `${thread.owner}/${thread.repo}`,
      name: thread.repo,
      owner: { login: thread.owner }
    },
    owner: thread.owner,
    repo: thread.repo,
    subjectNumber: thread.subjectNumber,
    subjectUrl: thread.subjectUrl
  }
}

export { toNotificationPartial }
