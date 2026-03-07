export const UNSUBSCRIBE_MUTATION = `
  mutation Unsubscribe($input: UnsubscribeFromNotificationsInput!) {
    unsubscribeFromNotifications(input: $input) { success }
  }
`
