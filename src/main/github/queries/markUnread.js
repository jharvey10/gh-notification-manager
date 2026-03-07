export const MARK_UNREAD_MUTATION = `
  mutation MarkUnread($input: MarkNotificationsAsUnreadInput!) {
    markNotificationsAsUnread(input: $input) { success }
  }
`
