export const UNSAVE_THREAD_MUTATION = `
  mutation UnsaveThread($input: DeleteSavedNotificationThreadInput!) {
    deleteSavedNotificationThread(input: $input) { success }
  }
`
