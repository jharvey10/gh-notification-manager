import { getMainWindow } from './index.js'

function broadcastBatchProgress(data) {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) {
    return
  }
  win.webContents.send('batch:progress', data)
}

export { broadcastBatchProgress }
