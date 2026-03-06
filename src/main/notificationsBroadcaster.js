import * as store from './store.js'

function broadcastNotificationsUpdated(mainWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('notifications:updated', store.getAll())
}

export { broadcastNotificationsUpdated }
