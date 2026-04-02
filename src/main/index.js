import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { registerIpcHandlers } from './ipc.js'
import { NotificationStore } from './NotificationStore.js'
import { NotificationPoller } from './NotificationPoller.js'
import { PreferencesStore } from './PreferencesStore.js'
import { broadcastNotificationsUpdated } from './notificationsBroadcaster.js'

const DEV_SERVER_URL = 'http://localhost:5173'
let mainWindow = null
let resolveReady
let waitForRendererPromise

function ensureWaitForRendererPromise() {
  if (!waitForRendererPromise) {
    waitForRendererPromise = new Promise((resolve) => {
      resolveReady = resolve
    })
  }
}

/**
 * Global signal to all parts of the app that the renderer is ready to go.
 */
const waitForRenderer = async () => {
  ensureWaitForRendererPromise()

  await waitForRendererPromise
}

/**
 * Used by the UI to tell the app it is ready to go.
 */
function markRendererAsReady() {
  ensureWaitForRendererPromise()

  resolveReady()
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
    onChange: () => broadcastNotificationsUpdated(mainWindow, store)
  })
  const poller = new NotificationPoller({ store, preferencesStore })

  let resolveFirstPoll
  const firstPollComplete = new Promise((resolve) => {
    resolveFirstPoll = resolve
  })

  registerIpcHandlers({ store, preferencesStore, poller, firstPollComplete })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      broadcastNotificationsUpdated(mainWindow, store)
    }
  })

  app.on('window-all-closed', () => {
    poller?.stop()
    app.quit()
  })

  poller.start({ shouldNotify: false }).finally(resolveFirstPoll)
}

// Needs to be un-awaited to allow electron to initialize properly in ESM mode
main().catch((err) => {
  console.error('Failed to start app:', err)
})

export { getMainWindow, waitForRenderer, markRendererAsReady }
