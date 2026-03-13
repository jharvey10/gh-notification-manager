import { app, ipcMain, shell, Notification } from 'electron'
import * as auth from './auth.js'
import {
  markThreadsAsDone,
  markThreadsAsRead,
  markThreadsAsUnread,
  unsubscribeAndMarkDone,
  saveThread,
  unsaveThread
} from './github/mutations.js'
import { broadcastError } from './broadcastError.js'
import { NotificationPoller } from './NotificationPoller.js'
import { resetClients } from './github/client.js'
import { getNotificationSubscribableTarget } from '../shared/notificationSubscription.js'

function registerIpcHandlers({ store, preferencesStore, poller: initialPoller }) {
  let poller = initialPoller

  ipcMain.handle('shell:openExternal', (_event, url) => {
    console.log('ipc: shell:openExternal')
    const parsed = new URL(url)
    if (parsed.hostname === 'github.com' && parsed.protocol === 'https:') {
      shell.openExternal(url)
    }
  })

  ipcMain.handle('notifications:get', () => {
    console.log('ipc: notifications:get')
    return store.getAll() // array or null
  })

  ipcMain.handle('notifications:markDone', async (_event, ids) => {
    console.log('ipc: notifications:markDone')
    poller?.stop()
    try {
      await markThreadsAsDone(ids, (batch) => {
        store.upsert(batch.map((id) => [id, null]))
        poller?.invalidateCacheEntries(batch)
      })
    } catch (err) {
      broadcastError('markDone', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:markRead', async (_event, ids) => {
    console.log('ipc: notifications:markRead')
    poller?.stop()
    try {
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
    } catch (err) {
      broadcastError('markRead', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:markUnread', async (_event, ids) => {
    console.log('ipc: notifications:markUnread')
    poller?.stop()
    try {
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
    } catch (err) {
      broadcastError('markUnread', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:unsubscribe', async (_event, ids) => {
    console.log('ipc: notifications:unsubscribe')
    poller?.stop()
    try {
      const subscribableMap = new Map()
      for (const id of ids) {
        const n = store.get(id)
        const target = getNotificationSubscribableTarget(n)
        if (target) {
          subscribableMap.set(target.id, id)
        } else {
          console.warn(`Cannot unsubscribe from notification ${id}: no subscribable subject`)
        }
      }
      const subscribableIds = [...subscribableMap.keys()]
      if (subscribableIds.length === 0) {
        return
      }

      const threadIds = [...subscribableMap.values()]
      await unsubscribeAndMarkDone(subscribableIds, threadIds, (batch) => {
        store.upsert(batch.map((id) => [id, null]))
        poller?.invalidateCacheEntries(batch)
      })
    } catch (err) {
      broadcastError('unsubscribe', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:save', async (_event, id) => {
    console.log('ipc: notifications:save')
    poller?.stop()
    try {
      await saveThread(id)
      const n = store.get(id)
      if (n) store.upsert([[id, { ...n, isSaved: true }]])
      poller?.invalidateCacheEntries([id])
    } catch (err) {
      broadcastError('save', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:unsave', async (_event, id) => {
    console.log('ipc: notifications:unsave')
    poller?.stop()
    try {
      await unsaveThread(id)
      const n = store.get(id)
      if (n) store.upsert([[id, { ...n, isSaved: false }]])
      poller?.invalidateCacheEntries([id])
    } catch (err) {
      broadcastError('unsave', err.message)
      throw err
    } finally {
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:refresh', async () => {
    console.log('ipc: notifications:refresh')
    poller?.stop()
    store.clear()
    poller = new NotificationPoller({ store, preferencesStore })
    await poller.start({ shouldNotify: false })
  })

  ipcMain.handle('settings:get', () => {
    console.log('ipc: settings:get')
    return preferencesStore.get()
  })

  ipcMain.handle('settings:update', (_event, partialSettings) => {
    console.log('ipc: settings:update')
    return preferencesStore.update(partialSettings)
  })

  ipcMain.handle('app:getVersion', () => {
    console.log('ipc: app:getVersion')
    return app.getVersion()
  })

  ipcMain.handle('auth:hasToken', () => {
    console.log('ipc: auth:hasToken')
    return auth.hasToken()
  })

  ipcMain.handle('auth:setToken', async (_event, token) => {
    console.log('ipc: auth:setToken')
    auth.saveToken(token)
    poller?.stop()
    resetClients()
    poller = new NotificationPoller({ store, preferencesStore })
    poller.start({ shouldNotify: false }) // Don't await. Let the UI refresh on token change.
  })

  ipcMain.handle('auth:clearToken', () => {
    console.log('ipc: auth:clearToken')
    auth.clearToken()
    poller?.stop()
    poller = null
    store.clear()
    resetClients()
  })

  ipcMain.handle('osnotification:test', () => {
    console.log('ipc: osnotification:test')
    new Notification({
      title: 'GH Notification Manager',
      body: 'This is a test notification from gh-notification-manager.'
    }).show()
  })
}

export { registerIpcHandlers }
