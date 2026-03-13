export const UNSUBSCRIBE_AND_MARK_DONE_MUTATION = `
  mutation UnsubscribeAndMarkDone(
    $unsubscribeInput: UnsubscribeFromNotificationsInput!,
    $markDoneInput: MarkNotificationsAsDoneInput!
  ) {
    unsubscribeFromNotifications(input: $unsubscribeInput) { success }
    markNotificationsAsDone(input: $markDoneInput) { success }
  }
`
