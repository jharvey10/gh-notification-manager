const store = require('./store')

function broadcastNotificationsUpdated(mainWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('notifications:updated', store.getAll())
}

module.exports = { broadcastNotificationsUpdated }
