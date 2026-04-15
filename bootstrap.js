import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const bundledDir = path.join(app.getAppPath(), 'dist')
let root = bundledDir

if (app.isPackaged) {
  const payloadDir = path.join(app.getPath('userData'), 'payload')
  const payloadVersionFile = path.join(payloadDir, 'version.json')

  if (fs.existsSync(payloadVersionFile)) {
    try {
      const { version } = JSON.parse(fs.readFileSync(payloadVersionFile, 'utf-8'))
      globalThis.__payloadVersion = version
      root = payloadDir
    } catch {
      fs.rmSync(payloadDir, { recursive: true, force: true })
    }
  }

  globalThis.__bundleRoot = root
}

let payloadFailed = false
try {
  await import(pathToFileURL(path.join(root, 'main', 'main.mjs')).href)
} catch (err) {
  if (root === bundledDir) {
    throw err
  }
  payloadFailed = true
  console.error('Payload failed to load, falling back to bundled code:', err)
}

if (payloadFailed) {
  fs.rmSync(root, { recursive: true, force: true })
  delete globalThis.__payloadVersion
  root = bundledDir
  globalThis.__bundleRoot = root
  await import(pathToFileURL(path.join(root, 'main', 'main.mjs')).href)
}
