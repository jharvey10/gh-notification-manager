import { getMainWindow } from './index.js'

type BatchProgressData = {
  completed: number
  total: number
  reason: string
}

function broadcastBatchProgress(data: BatchProgressData | null) {
  const win = getMainWindow()
  if (!win || win.isDestroyed()) {
    return
  }
  win.webContents.send('batch:progress', data)
}

export { broadcastBatchProgress }
