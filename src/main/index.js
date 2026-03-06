import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { registerIpcHandlers } from './ipc.js'
import { start, stop } from './poller.js'
import { broadcastNotificationsUpdated } from './notificationsBroadcaster.js'
import { registerTagger } from './pipeline/runner.js'
import { reviewTypeTagger } from './pipeline/taggers/reviewTypeTagger.js'
import { reasonTagger } from './pipeline/taggers/reasonTagger.js'
import { junkTagger } from './pipeline/taggers/junkTagger.js'

const DEV_SERVER_URL = 'http://localhost:5173'
let mainWindow = null

function registerTaggers() {
  registerTagger(reviewTypeTagger)
  registerTagger(reasonTagger)
  registerTagger(junkTagger)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(import.meta.dirname, 'assets/app-icon.png'),
    webPreferences: {
      preload: path.join(import.meta.dirname, '../preload/index.cjs')
    }
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(import.meta.dirname, '../../dist/renderer/index.html'))
  } else {
    mainWindow.loadURL(DEV_SERVER_URL)
  }
}

function getMainWindow() {
  return mainWindow
}

async function main() {
  if (!app.isReady()) {
    await app.whenReady()
  }

  registerTaggers()
  createWindow()
  const onNotificationsChanged = () => broadcastNotificationsUpdated(mainWindow)
  registerIpcHandlers({ onNotificationsChanged })
  start({ onPollComplete: onNotificationsChanged })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      onNotificationsChanged()
    }
  })

  app.on('window-all-closed', () => {
    stop()
    app.quit()
  })
}

main().catch((err) => {
  console.error('Failed to start app:', err)
})

export { getMainWindow }
