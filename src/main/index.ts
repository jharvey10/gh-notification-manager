import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { registerIpcHandlers } from './ipc.js'
import { NotificationStore } from './NotificationStore.js'
import { NotificationPoller } from './NotificationPoller.js'
import { PreferencesStore } from './PreferencesStore.js'
import { broadcastNotificationsUpdated } from './broadcastNotificationsUpdated.js'

const DEV_SERVER_URL = 'http://localhost:5173'
let mainWindow: BrowserWindow | null = null

let resolveRendererReady: () => void
const rendererReady = new Promise<void>((r) => {
  resolveRendererReady = r
})

/**
 * Used by the UI to tell the app it is ready to go.
 */
function markRendererAsReady() {
  resolveRendererReady()
}

function createWindow() {
  const bundleRoot = globalThis.__bundleRoot

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: bundleRoot && path.join(bundleRoot, 'main', 'assets', 'app-icon.png'),
    webPreferences: {
      preload: bundleRoot
        ? path.join(bundleRoot, 'preload', 'index.cjs')
        : path.join(import.meta.dirname, '../preload/index.cjs')
    }
  })

  if (bundleRoot) {
    mainWindow.loadFile(path.join(bundleRoot, 'renderer', 'index.html'))
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

  createWindow()

  const preferencesStore = new PreferencesStore()
  const store = new NotificationStore({
    onChange(s) {
      broadcastNotificationsUpdated(mainWindow, s)
    }
  })

  NotificationPoller.init(store, preferencesStore)

  registerIpcHandlers({ store, preferencesStore })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      broadcastNotificationsUpdated(mainWindow, store)
    }
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  NotificationPoller.getInstance().start({ shouldNotify: false, reEnrichAll: true })
}

// Needs to be un-awaited to allow electron to initialize properly in ESM mode
main().catch((err) => {
  console.error('Failed to start app:', err)
})

export { getMainWindow, rendererReady, markRendererAsReady }
