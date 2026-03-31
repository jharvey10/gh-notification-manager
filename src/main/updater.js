import { app } from 'electron'
import electronUpdater from 'electron-updater'
import { getMainWindow } from './index.js'

const { autoUpdater } = electronUpdater

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

let lastStatus = { state: 'idle' }

function sendStatusToWindow(status) {
  lastStatus = status
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('updater:status', status)
  }
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow({ state: 'checking' })
})

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow({ state: 'available', version: info.version })
})

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow({ state: 'not-available' })
})

autoUpdater.on('download-progress', (progress) => {
  sendStatusToWindow({ state: 'downloading', percent: progress.percent })
})

autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow({ state: 'downloaded' })
})

autoUpdater.on('error', (err) => {
  sendStatusToWindow({ state: 'error', message: err.message })
})

function getStatus() {
  return lastStatus
}

function checkForUpdates() {
  if (!app.isPackaged) {
    sendStatusToWindow({
      state: 'error',
      message: 'Auto-update is not available in development mode.'
    })
    return
  }
  if (lastStatus.state === 'downloading' || lastStatus.state === 'downloaded') {
    return
  }
  autoUpdater.checkForUpdates()
}

function downloadUpdate() {
  autoUpdater.downloadUpdate()
}

function quitAndInstall() {
  autoUpdater.quitAndInstall()
}

export { getStatus, checkForUpdates, downloadUpdate, quitAndInstall }
