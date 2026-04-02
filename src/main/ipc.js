import { app, ipcMain, shell, Notification } from 'electron'
import * as auth from './auth.js'
import {
  archiveThreads,
  unsubscribeAndArchive
} from './github/mutations.js'
import { broadcastError } from './broadcastError.js'
import { markRendererAsReady } from './index.js'
import { ProgressTracker } from './ProgressTracker.js'
import { NotificationPoller } from './NotificationPoller.js'
import { resetClients } from './github/client.js'
import { resetLastModified } from './github/restNotifications.js'
import { getNotificationSubscribableTarget } from '../shared/notificationSubscription.js'
import { getStatus as getUpdaterStatus, checkForUpdates, downloadUpdate, quitAndInstall } from './updater.js'

/**
 * @param {{
 *   store: import('./NotificationStore.js').NotificationStore,
 *   preferencesStore: import('./PreferencesStore.js').PreferencesStore,
 *   poller: import('./NotificationPoller.js').NotificationPoller
 * }} options
 */
function registerIpcHandlers({ store, preferencesStore, poller: initialPoller }) {
  /** @type {import('./NotificationPoller.js').NotificationPoller | null} */
  let poller = initialPoller

  ipcMain.on('renderer:ready', () => {
    console.log('ipc: renderer:ready')
    markRendererAsReady()
  })

  ipcMain.handle('shell:openExternal', (_event, url) => {
    console.log('ipc: shell:openExternal')
    const parsed = new URL(url)
    if (parsed.hostname === 'github.com' && parsed.protocol === 'https:') {
      shell.openExternal(url)
    }
  })

  ipcMain.handle('notifications:get', () => {
    console.log('ipc: notifications:get')
    return store.getAll()
  })

  ipcMain.handle('notifications:markDone', async (_event, ids) => {
    console.log('ipc: notifications:markDone')
    poller?.stop()
    const progress = new ProgressTracker(ids.length)
    try {
      await archiveThreads(ids, (batch) => {
        store.upsert(batch.map((id) => [id, null]))
        poller?.invalidateCacheEntries(batch)
        progress.report(batch.length)
      })
    } catch (err) {
      broadcastError('markDone', err.message)
      throw err
    } finally {
      progress.done()
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:markRead', (_event, ids) => {
    console.log('ipc: notifications:markRead')
    store.upsert(ids.map((id) => [id, { _localData: { isUnread: false } }]))
  })

  ipcMain.handle('notifications:markUnread', (_event, ids) => {
    console.log('ipc: notifications:markUnread')
    store.upsert(ids.map((id) => [id, { _localData: { isUnread: true } }]))
  })

  ipcMain.handle('notifications:unsubscribe', async (_event, ids) => {
    console.log('ipc: notifications:unsubscribe')
    poller?.stop()
    const progress = new ProgressTracker(ids.length)
    try {
      const subscribableIds = []
      const subscribableThreadIds = []
      const nonSubscribableThreadIds = []

      for (const id of ids) {
        const n = store.get(id)
        const target = getNotificationSubscribableTarget(n)
        if (target) {
          subscribableIds.push(target.id)
          subscribableThreadIds.push(id)
        } else {
          nonSubscribableThreadIds.push(id)
        }
      }

      const onBatchDone = (batch) => {
        store.upsert(batch.map((id) => [id, null]))
        poller?.invalidateCacheEntries(batch)
        progress.report(batch.length)
      }

      if (subscribableIds.length > 0) {
        await unsubscribeAndArchive(subscribableIds, subscribableThreadIds, onBatchDone)
      }

      if (nonSubscribableThreadIds.length > 0) {
        await archiveThreads(nonSubscribableThreadIds, onBatchDone)
      }
    } catch (err) {
      broadcastError('unsubscribe', err.message)
      throw err
    } finally {
      progress.done()
      poller?.startDeferred()
    }
  })

  ipcMain.handle('notifications:save', (_event, id) => {
    console.log('ipc: notifications:save')
    store.upsert([[id, { _localData: { isSaved: true } }]])
  })

  ipcMain.handle('notifications:unsave', (_event, id) => {
    console.log('ipc: notifications:unsave')
    store.upsert([[id, { _localData: { isSaved: false } }]])
  })

  ipcMain.handle('notifications:refresh', async () => {
    console.log('ipc: notifications:refresh')
    poller?.stop()
    store.clear()
    resetLastModified()
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
    return globalThis.__payloadVersion || app.getVersion()
  })

  ipcMain.handle('auth:hasValidToken', async () => {
    console.log('ipc: auth:hasValidToken')
    const result = await auth.validateToken()
    if (result.valid) {
      return true
    }

    if (result.message) {
      broadcastError('auth', result.message)
    }
    return false
  })

  ipcMain.handle('auth:setToken', async (_event, token) => {
    console.log('ipc: auth:setToken')
    auth.saveToken(token)
    poller?.stop()
    resetClients()
    resetLastModified()
    poller = new NotificationPoller({ store, preferencesStore })
    poller.start({ shouldNotify: false })
  })

  ipcMain.handle('auth:clearToken', () => {
    console.log('ipc: auth:clearToken')
    auth.clearToken()
    poller?.stop()
    poller = null
    store.clear()
    resetClients()
    resetLastModified()
  })

  ipcMain.handle('osnotification:test', () => {
    console.log('ipc: osnotification:test')
    new Notification({
      title: 'GH Notification Manager',
      body: 'This is a test notification from gh-notification-manager.'
    }).show()
  })

  ipcMain.handle('updater:getStatus', () => {
    return getUpdaterStatus()
  })

  ipcMain.handle('updater:check', () => {
    checkForUpdates()
  })

  ipcMain.handle('updater:download', () => {
    downloadUpdate()
  })

  ipcMain.handle('updater:install', () => {
    quitAndInstall()
  })
}

export { registerIpcHandlers }
