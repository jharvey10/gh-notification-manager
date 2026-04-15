import { NotificationPoller } from '../../NotificationPoller.js'
import type { IpcContext } from '../types.js'

export async function resetAll({ store }: IpcContext) {
  store.hardReset()
  const poller = NotificationPoller.getInstance()
  poller.restart({ shouldNotify: false })
}
