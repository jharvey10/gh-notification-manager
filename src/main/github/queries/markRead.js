export const MARK_READ_MUTATION = `
  mutation MarkRead($input: MarkNotificationsAsReadInput!) {
    markNotificationsAsRead(input: $input) { success }
  }
`
