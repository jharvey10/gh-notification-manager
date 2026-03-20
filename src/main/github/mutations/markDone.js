export const MARK_DONE_MUTATION = `
  mutation MarkDone($input: MarkNotificationsAsDoneInput!) {
    markNotificationsAsDone(input: $input) { success }
  }
`
