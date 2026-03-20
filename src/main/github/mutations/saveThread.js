export const SAVE_THREAD_MUTATION = `
  mutation SaveThread($input: CreateSavedNotificationThreadInput!) {
    createSavedNotificationThread(input: $input) { success }
  }
`
