const NOTIFICATION_QUERY = `
  query FetchNotifications($cursor: String) {
    viewer {
      notificationThreads(
        first: 50,
        after: $cursor,
        filterBy: { statuses: [READ, UNREAD] }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          threadType
          url
          reason
          isUnread
          lastUpdatedAt
          optionalSubject {
            __typename
            ... on PullRequest {
              state
              isDraft
              merged
              reviewDecision
              author { login }
              labels(first: 20) { nodes { name } }
              reviewRequests(first: 50) {
                nodes {
                  requestedReviewer {
                    ... on User { __typename login }
                    ... on Team { __typename slug organization { login } }
                  }
                }
              }
            }
            ... on Issue {
              state
              stateReason
            }
            ... on CheckSuite {
              status
              conclusion
            }
            ... on Release {
              tagName
              isPrerelease
            }
            ... on Discussion {
              isAnswered
              stateReason
            }
          }
          optionalList {
            ... on Repository {
              nameWithOwner
              name
              owner { login }
            }
          }
        }
      }
    }
  }
`

const MARK_DONE_MUTATION = `
  mutation MarkDone($input: MarkNotificationsAsDoneInput!) {
    markNotificationsAsDone(input: $input) { success }
  }
`

const MARK_READ_MUTATION = `
  mutation MarkRead($input: MarkNotificationsAsReadInput!) {
    markNotificationsAsRead(input: $input) { success }
  }
`

export { NOTIFICATION_QUERY, MARK_DONE_MUTATION, MARK_READ_MUTATION }
