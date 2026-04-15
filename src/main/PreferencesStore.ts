import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { DEFAULT_SETTINGS, sanitizeSettings } from '../shared/settings.js'
import { broadcastError } from './broadcastError.js'

/** @typedef {import('../shared/settings.js').DEFAULT_SETTINGS} Settings */

class PreferencesStore {
  #filePath
  /** @type {Settings} */
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
        broadcastError('settings', `Failed to load: ${err.message}`)
      }
      return { ...DEFAULT_SETTINGS }
    }
  }

  #save() {
    try {
      fs.mkdirSync(path.dirname(this.#filePath), { recursive: true })
      fs.writeFileSync(this.#filePath, JSON.stringify(this.#settings, null, 2))
    } catch (err) {
      broadcastError('settings', `Failed to save: ${err.message}`)
      throw err
    }
  }

  /** @returns {Settings} */
  get() {
    return { ...this.#settings }
  }

  /** @param {Partial<Settings>} partialSettings @returns {Settings} */
  update(partialSettings) {
    this.#settings = sanitizeSettings(
      {
        ...this.#settings,
        ...partialSettings
      },
      this.#settings
    )
    this.#save()
    return this.get()
  }
}

export { PreferencesStore }
