import { ipcMain, shell, Notification } from 'electron'
import * as store from './store.js'
import * as auth from './auth.js'
import {
  markThreadsAsDone,
  markThreadsAsRead,
  markThreadsAsUnread,
  unsubscribeFromThreads,
  saveThreads,
  unsaveThreads
} from './github/mutations.js'
import { start, stop, poll } from './poller.js'
import { resetClients } from './github/client.js'

function registerIpcHandlers({ onNotificationsChanged }) {
  ipcMain.handle('shell:openExternal', (_event, url) => {
    const parsed = new URL(url)
    if (parsed.hostname === 'github.com' && parsed.protocol === 'https:') {
      shell.openExternal(url)
    }
  })

  ipcMain.handle('notifications:get', () => {
    return store.getAll() // array or null
  })

  ipcMain.handle('notifications:markDone', async (_event, ids) => {
    await markThreadsAsDone(ids, (batch) => {
      for (const id of batch) store.remove(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:markRead', async (_event, ids) => {
    await markThreadsAsRead(ids, (batch) => {
      for (const id of batch) store.markRead(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:markUnread', async (_event, ids) => {
    await markThreadsAsUnread(ids, (batch) => {
      for (const id of batch) store.markUnread(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:unsubscribe', async (_event, ids) => {
    await unsubscribeFromThreads(ids, (batch) => {
      for (const id of batch) store.remove(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:save', async (_event, ids) => {
    await saveThreads(ids, (id) => {
      store.setSaved(id, true)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:unsave', async (_event, ids) => {
    await unsaveThreads(ids, (id) => {
      store.setSaved(id, false)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:refresh', async () => {
    stop()
    store.clear()
    onNotificationsChanged()
    await poll({ shouldNotify: false, onPollComplete: onNotificationsChanged })
    start({ onPollComplete: onNotificationsChanged })
  })

  ipcMain.handle('auth:hasToken', () => {
    return auth.hasToken()
  })

  ipcMain.handle('auth:setToken', (_event, token) => {
    auth.saveToken(token)
    resetClients()
  })

  ipcMain.handle('auth:clearToken', () => {
    auth.clearToken()
    store.clear()
    resetClients()
    onNotificationsChanged()
  })

  ipcMain.handle('osnotification:test', () => {
    new Notification({
      title: 'GH Notification Manager',
      body: 'This is a test notification from gh-notification-manager.'
    }).show()
  })
}

export { registerIpcHandlers }
