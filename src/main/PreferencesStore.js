import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { DEFAULT_SETTINGS, sanitizeSettings } from '../shared/settings.js'

class PreferencesStore {
  #filePath
  #settings

  constructor() {
    this.#filePath = path.join(app.getPath('userData'), 'settings.json')
    this.#settings = this.#load()
  }

  #load() {
    try {
      const raw = fs.readFileSync(this.#filePath, 'utf8')
      return sanitizeSettings(JSON.parse(raw))
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Failed to load settings:', err)
      }
      return { ...DEFAULT_SETTINGS }
    }
  }

  #save() {
    try {
      fs.mkdirSync(path.dirname(this.#filePath), { recursive: true })
      fs.writeFileSync(this.#filePath, JSON.stringify(this.#settings, null, 2))
    } catch (err) {
      console.error('Failed to save settings:', err)
      throw err
    }
  }

  get() {
    return { ...this.#settings }
  }

  update(partialSettings) {
    this.#settings = sanitizeSettings({
      ...this.#settings,
      ...partialSettings
    }, this.#settings)
    this.#save()
    return this.get()
  }
}

export { PreferencesStore }
