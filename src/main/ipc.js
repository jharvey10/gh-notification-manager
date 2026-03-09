import { ipcMain, shell, Notification } from 'electron'
import * as auth from './auth.js'
import {
  markThreadsAsDone,
  markThreadsAsRead,
  markThreadsAsUnread,
  unsubscribeFromThreads,
  saveThread,
  unsaveThread
} from './github/mutations.js'
import { NotificationPoller } from './NotificationPoller.js'
import { resetClients } from './github/client.js'
import { findSubscribableId } from '../shared/findSubscribableId.js'

function registerIpcHandlers({ store, preferencesStore, poller: initialPoller }) {
  let poller = initialPoller

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
      store.upsert(batch.map((id) => [id, null]))
      poller?.invalidateCacheEntries(batch)
    })
  })

  ipcMain.handle('notifications:markRead', async (_event, ids) => {
    await markThreadsAsRead(ids, (batch) => {
      store.upsert(
        batch
          .map((id) => {
            const n = store.get(id)
            return n ? [id, { ...n, isUnread: false }] : null
          })
          .filter(Boolean)
      )
      poller?.invalidateCacheEntries(batch)
    })
  })

  ipcMain.handle('notifications:markUnread', async (_event, ids) => {
    await markThreadsAsUnread(ids, (batch) => {
      store.upsert(
        batch
          .map((id) => {
            const n = store.get(id)
            return n ? [id, { ...n, isUnread: true }] : null
          })
          .filter(Boolean)
      )
      poller?.invalidateCacheEntries(batch)
    })
  })

  ipcMain.handle('notifications:unsubscribe', async (_event, ids) => {
    const subscribableMap = new Map()
    for (const id of ids) {
      const n = store.get(id)
      const subjectId = findSubscribableId(n)
      if (subjectId) {
        subscribableMap.set(subjectId, id)
      } else {
        console.warn(`Cannot unsubscribe from notification ${id}: no subscribable subject`)
      }
    }
    const subscribableIds = [...subscribableMap.keys()]
    if (subscribableIds.length === 0) {
      return
    }

    const threadIds = [...subscribableMap.values()]
    await Promise.all([
      unsubscribeFromThreads(subscribableIds),
      markThreadsAsDone(threadIds, (batch) => {
        store.upsert(batch.map((id) => [id, null]))
        poller?.invalidateCacheEntries(batch)
      })
    ])
  })

  ipcMain.handle('notifications:save', async (_event, id) => {
    await saveThread(id)
    const n = store.get(id)
    if (n) store.upsert([[id, { ...n, isSaved: true }]])
    poller?.invalidateCacheEntries([id])
  })

  ipcMain.handle('notifications:unsave', async (_event, id) => {
    await unsaveThread(id)
    const n = store.get(id)
    if (n) store.upsert([[id, { ...n, isSaved: false }]])
    poller?.invalidateCacheEntries([id])
  })

  ipcMain.handle('notifications:refresh', async () => {
    poller?.stop()
    store.clear()
    poller = new NotificationPoller({ store, preferencesStore })
    await poller.start()
  })

  ipcMain.handle('settings:get', () => {
    return preferencesStore.get()
  })

  ipcMain.handle('settings:update', (_event, partialSettings) => {
    return preferencesStore.update(partialSettings)
  })

  ipcMain.handle('auth:hasToken', () => {
    return auth.hasToken()
  })

  ipcMain.handle('auth:setToken', async (_event, token) => {
    auth.saveToken(token)
    poller?.stop()
    resetClients()
    poller = new NotificationPoller({ store, preferencesStore })
    void poller.start() // Don't await. Let the UI refresh on notification change.
  })

  ipcMain.handle('auth:clearToken', () => {
    auth.clearToken()
    poller?.stop()
    poller = null
    store.clear()
    resetClients()
  })

  ipcMain.handle('osnotification:test', () => {
    new Notification({
      title: 'GH Notification Manager',
      body: 'This is a test notification from gh-notification-manager.'
    }).show()
  })
}

export { registerIpcHandlers }
