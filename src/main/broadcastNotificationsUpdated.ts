import { BrowserWindow } from 'electron'
import { NotificationStore } from './NotificationStore.js'

function broadcastNotificationsUpdated(mainWindow: BrowserWindow, store: NotificationStore) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  console.log('broadcasting notifications updated. store size:', store.getAll()?.length)

  mainWindow.webContents.send('notifications:updated', store.getAll())
}

export { broadcastNotificationsUpdated }
