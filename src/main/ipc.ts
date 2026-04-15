import { ipcMain } from 'electron'
import type { NotificationStore } from './NotificationStore.js'
import type { PreferencesStore } from './PreferencesStore.js'
import type { IpcContext } from './ipc/types.js'

import { ready } from './ipc/renderer/ready.js'
import { openExternal } from './ipc/shell/openExternal.js'
import { get as getNotifications } from './ipc/notifications/get.js'
import { markDone } from './ipc/notifications/markDone.js'
import { markRead } from './ipc/notifications/markRead.js'
import { markUnread } from './ipc/notifications/markUnread.js'
import { unsubscribe } from './ipc/notifications/unsubscribe.js'
import { save } from './ipc/notifications/save.js'
import { unsave } from './ipc/notifications/unsave.js'
import { resetAll } from './ipc/notifications/resetAll.js'
import { get as getSettings } from './ipc/settings/get.js'
import { update as updateSettings } from './ipc/settings/update.js'
import { getVersion } from './ipc/app/getVersion.js'
import { hasToken } from './ipc/auth/hasToken.js'
import { hasValidToken } from './ipc/auth/hasValidToken.js'
import { setToken } from './ipc/auth/setToken.js'
import { clearToken } from './ipc/auth/clearToken.js'
import { test as testOsNotification } from './ipc/osnotification/test.js'
import { getUpdaterStatus } from './ipc/updater/getStatus.js'
import { check as checkUpdater } from './ipc/updater/check.js'
import { download as downloadUpdate } from './ipc/updater/download.js'
import { install as installUpdate } from './ipc/updater/install.js'

type RegisterIpcHandlersOptions = {
  store: NotificationStore
  preferencesStore: PreferencesStore
}

function registerIpcHandlers({ store, preferencesStore }: RegisterIpcHandlersOptions) {
  const ctx: IpcContext = { store, preferencesStore }

  ipcMain.on('renderer:ready', () => {
    console.log('ipc: renderer:ready')
    ready()
  })

  ipcMain.handle('shell:openExternal', (_e, url) => {
    console.log('ipc: shell:openExternal')
    return openExternal(url)
  })

  ipcMain.handle('notifications:get', () => {
    console.log('ipc: notifications:get')
    return getNotifications(ctx)
  })
  ipcMain.handle('notifications:markDone', (_e, ids) => {
    console.log('ipc: notifications:markDone')
    return markDone(ctx, ids)
  })
  ipcMain.handle('notifications:markRead', (_e, ids) => {
    console.log('ipc: notifications:markRead')
    return markRead(ctx, ids)
  })
  ipcMain.handle('notifications:markUnread', (_e, ids) => {
    console.log('ipc: notifications:markUnread')
    return markUnread(ctx, ids)
  })
  ipcMain.handle('notifications:unsubscribe', (_e, ids) => {
    console.log('ipc: notifications:unsubscribe')
    return unsubscribe(ctx, ids)
  })
  ipcMain.handle('notifications:save', (_e, id) => {
    console.log('ipc: notifications:save')
    return save(ctx, id)
  })
  ipcMain.handle('notifications:unsave', (_e, id) => {
    console.log('ipc: notifications:unsave')
    return unsave(ctx, id)
  })
  ipcMain.handle('notifications:resetAll', () => {
    console.log('ipc: notifications:resetAll')
    return resetAll(ctx)
  })

  ipcMain.handle('settings:get', () => {
    console.log('ipc: settings:get')
    return getSettings(ctx)
  })
  ipcMain.handle('settings:update', (_e, partial) => {
    console.log('ipc: settings:update')
    return updateSettings(ctx, partial)
  })

  ipcMain.handle('app:getVersion', () => {
    console.log('ipc: app:getVersion')
    return getVersion()
  })

  ipcMain.handle('auth:hasToken', () => {
    console.log('ipc: auth:hasToken')
    return hasToken()
  })
  ipcMain.handle('auth:hasValidToken', () => {
    console.log('ipc: auth:hasValidToken')
    return hasValidToken()
  })
  ipcMain.handle('auth:setToken', (_e, token) => {
    console.log('ipc: auth:setToken')
    return setToken(ctx, token)
  })
  ipcMain.handle('auth:clearToken', () => {
    console.log('ipc: auth:clearToken')
    return clearToken(ctx)
  })

  ipcMain.handle('osnotification:test', () => {
    console.log('ipc: osnotification:test')
    return testOsNotification()
  })

  ipcMain.handle('updater:getStatus', () => {
    console.log('ipc: updater:getStatus')
    return getUpdaterStatus()
  })
  ipcMain.handle('updater:check', () => {
    console.log('ipc: updater:check')
    return checkUpdater()
  })
  ipcMain.handle('updater:download', () => {
    console.log('ipc: updater:download')
    return downloadUpdate()
  })
  ipcMain.handle('updater:install', () => {
    console.log('ipc: updater:install')
    return installUpdate()
  })
}

export { registerIpcHandlers }
