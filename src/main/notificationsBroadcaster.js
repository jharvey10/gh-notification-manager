function broadcastNotificationsUpdated(mainWindow, store) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  console.log('broadcasting notifications updated')

  mainWindow.webContents.send('notifications:updated', store.getAll())
}

export { broadcastNotificationsUpdated }
