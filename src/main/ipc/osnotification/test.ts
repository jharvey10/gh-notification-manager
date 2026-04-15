import { Notification } from 'electron'

export function test() {
  new Notification({
    title: 'GH Notification Manager',
    body: 'This is a test notification from gh-notification-manager.'
  }).show()
}
