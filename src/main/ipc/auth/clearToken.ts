import * as auth from '../../auth.js'
import { resetClients } from '../../github/client.js'
import { NotificationPoller } from '../../NotificationPoller.js'
import type { IpcContext } from '../types.js'

export function clearToken({ store }: IpcContext) {
  auth.clearToken()
  NotificationPoller.getInstance().shutdown()
  store.hardReset()
  resetClients()
}
