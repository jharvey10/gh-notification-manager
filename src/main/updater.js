import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import AdmZip from 'adm-zip'
import { getMainWindow } from './index.js'
import { broadcastError } from './broadcastError.js'

const RELEASES_URL =
  'https://api.github.com/repos/jharvey10/gh-notification-manager/releases/latest'

let lastStatus = { state: 'idle' }
let latestRelease = null

function sendStatusToWindow(status) {
  lastStatus = status
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('updater:status', status)
  }
}

function getCurrentVersion() {
  return globalThis.__payloadVersion || app.getVersion()
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) {
      return 1
    }
    if ((pa[i] || 0) < (pb[i] || 0)) {
      return -1
    }
  }
  return 0
}

function getStatus() {
  return lastStatus
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    return
  }

  if (lastStatus.state === 'downloading' || lastStatus.state === 'ready') {
    return
  }

  try {
    const response = await fetch(RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })

    if (!response.ok) {
      return
    }

    const release = await response.json()
    const remoteVersion = release.tag_name.replace(/^v/, '')
    const currentVersion = getCurrentVersion()

    if (compareVersions(remoteVersion, currentVersion) <= 0) {
      latestRelease = null
      return
    }

    const payloadAsset = release.assets.find(
      (a) => a.name.startsWith('payload-') && a.name.endsWith('.zip')
    )

    if (!payloadAsset) {
      return
    }

    latestRelease = {
      version: remoteVersion,
      downloadUrl: payloadAsset.browser_download_url
    }

    sendStatusToWindow({ state: 'available', version: remoteVersion })
  } catch (err) {
    broadcastError('updater', err.message)
  }
}

async function downloadUpdate() {
  if (!latestRelease) {
    return
  }

  const { version, downloadUrl } = latestRelease

  try {
    sendStatusToWindow({ state: 'downloading' })

    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    const userDataPath = app.getPath('userData')
    const payloadDir = path.join(userDataPath, 'payload')
    const stagingDir = path.join(userDataPath, 'payload-staging')
    const oldDir = path.join(userDataPath, 'payload-old')

    fs.rmSync(stagingDir, { recursive: true, force: true })
    fs.rmSync(oldDir, { recursive: true, force: true })

    fs.mkdirSync(stagingDir, { recursive: true })
    const zip = new AdmZip(buffer)
    zip.extractAllTo(stagingDir, true)

    if (fs.existsSync(payloadDir)) {
      fs.renameSync(payloadDir, oldDir)
    }
    fs.renameSync(stagingDir, payloadDir)
    fs.rmSync(oldDir, { recursive: true, force: true })

    sendStatusToWindow({ state: 'ready', version })
  } catch (err) {
    broadcastError('updater', err.message)
    sendStatusToWindow({ state: 'available', version })
  }
}

function quitAndInstall() {
  app.relaunch()
  app.exit(0)
}

export { getStatus, checkForUpdates, downloadUpdate, quitAndInstall }
