import { getMainWindow, rendererReady } from './index.js'

async function broadcastError(source, message) {
  await rendererReady

  const win = getMainWindow()
  if (!win || win.isDestroyed()) {
    console.error(`error: [main/${source}] ${message} (window unavailable, dropped)`)
    return
  }

  console.error(`error: [main/${source}] ${message}`)
  win.webContents.send('main:error', { source, message })
}

export { broadcastError }
