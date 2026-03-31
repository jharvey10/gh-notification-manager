import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

if (app.isPackaged) {
  const payloadDir = path.join(app.getPath('userData'), 'payload')
  const versionFile = path.join(payloadDir, 'version.json')
  const payloadEntry = path.join(payloadDir, 'main', 'main.mjs')

  if (fs.existsSync(payloadEntry) && fs.existsSync(versionFile)) {
    try {
      const { version } = JSON.parse(fs.readFileSync(versionFile, 'utf-8'))
      globalThis.__payloadVersion = version
      await import(pathToFileURL(payloadEntry).href)
    } catch (err) {
      console.error('Payload failed to load, falling back to bundled code:', err)
      fs.rmSync(payloadDir, { recursive: true, force: true })
      delete globalThis.__payloadVersion
      await import('./dist/main/main.mjs')
    }
  } else {
    await import('./dist/main/main.mjs')
  }
} else {
  await import('./src/main/index.js')
}
