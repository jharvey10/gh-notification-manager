const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { registerIpcHandlers } = require('./ipc')
const { start, stop } = require('./poller')
const { broadcastNotificationsUpdated } = require('./notificationsBroadcaster')
const { registerTagger } = require('./pipeline/runner')
const { reviewTypeTagger } = require('./pipeline/taggers/reviewType')
const { mentionTypeTagger } = require('./pipeline/taggers/mentionType')
const { junkTagger } = require('./pipeline/taggers/junkTagger')

registerTagger(reviewTypeTagger)
registerTagger(mentionTypeTagger)
registerTagger(junkTagger)

const DEV_SERVER_URL = 'http://localhost:5173'
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, '../../assets/app-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  if (!app.isPackaged) {
    mainWindow.loadURL(DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }
}

async function main() {
  await app.whenReady()
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

main().catch(console.error)

module.exports = { getMainWindow: () => mainWindow }
