import { getMainWindow } from './index.js'

function broadcastError(source, message) {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) {
    return
  }

  win.webContents.send('main:error', { source, message })
}

export { broadcastError }
