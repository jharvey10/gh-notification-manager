import * as auth from '../../auth.js'
import { resetClients } from '../../github/client.js'
import { NotificationPoller } from '../../NotificationPoller.js'
import type { IpcContext } from '../types.js'

export async function setToken(_ctx: IpcContext, token: string) {
  auth.saveToken(token)
  resetClients()
  NotificationPoller.getInstance().restart()
}
