import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

if (app.isPackaged) {
  const payloadDir = path.join(app.getPath('userData'), 'payload')
  const bundledDir = path.join(app.getAppPath(), 'dist')
  const payloadVersionFile = path.join(payloadDir, 'version.json')

  let usePayload = false
  if (fs.existsSync(payloadVersionFile)) {
    try {
      const { version } = JSON.parse(fs.readFileSync(payloadVersionFile, 'utf-8'))
      globalThis.__payloadVersion = version
      usePayload = true
    } catch {
      fs.rmSync(payloadDir, { recursive: true, force: true })
    }
  }

  const root = usePayload ? payloadDir : bundledDir
  globalThis.__bundleRoot = root

  try {
    await import(pathToFileURL(path.join(root, 'main', 'main.mjs')).href)
  } catch (err) {
    if (usePayload) {
      console.error('Payload failed to load, falling back to bundled code:', err)
      fs.rmSync(payloadDir, { recursive: true, force: true })
      delete globalThis.__payloadVersion
      globalThis.__bundleRoot = bundledDir
      await import(pathToFileURL(path.join(bundledDir, 'main', 'main.mjs')).href)
    } else {
      throw err
    }
  }
} else {
  await import('./src/main/index.js')
}
