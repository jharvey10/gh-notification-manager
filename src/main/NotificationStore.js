import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { broadcastError } from './broadcastError.js'

const SAVE_DEBOUNCE_MS = 1000
const STORE_VERSION = 1

/** @typedef {import('./github/queries/fetchNotifications.js').GitHubNotificationNode} GitHubNotificationNode */
/** @typedef {import('./github/queries/fetchNotifications.js').LocalNotificationDataPatch} LocalNotificationDataPatch */
/** @typedef {Omit<Partial<GitHubNotificationNode>, '_localData'> & { _localData?: LocalNotificationDataPatch }} UpsertData */

class NotificationStore {
  /** @type {Map<string, GitHubNotificationNode> | null} */
  #notifications = null
  #onChange
  #filePath
  /** @type {ReturnType<typeof setTimeout> | null} */
  #saveTimer = null

  /** @param {{ onChange: () => void }} options */
  constructor({ onChange }) {
    console.log('constructed new notification store')
    this.#onChange = onChange
    this.#filePath = path.join(app.getPath('userData'), 'notifications.json')
    this.#loadFromDisk()
  }

  #loadFromDisk() {
    try {
      const raw = fs.readFileSync(this.#filePath, 'utf8')
      const data = JSON.parse(raw)
      if (data.version !== STORE_VERSION) {
        return
      }

      if (data.notifications && typeof data.notifications === 'object') {
        this.#notifications = new Map(Object.entries(data.notifications))
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        broadcastError('store', `Failed to load notification store: ${err.message}`)
      }
    }
  }

  #scheduleSave() {
    if (this.#saveTimer) {
      return
    }
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null
      this.#saveToDisk()
    }, SAVE_DEBOUNCE_MS)
  }

  #saveToDisk() {
    try {
      const notifications = this.#notifications ? Object.fromEntries(this.#notifications) : {}
      const payload = { version: STORE_VERSION, notifications }
      fs.mkdirSync(path.dirname(this.#filePath), { recursive: true })
      fs.writeFileSync(this.#filePath, JSON.stringify(payload))
    } catch (err) {
      broadcastError('store', `Failed to save notification store: ${err.message}`)
    }
  }

  #createLocalData() {
    return { isUnread: true, isSaved: false }
  }

  /**
   * Upsert notification entries. Each entry is [id, data | null].
   * - null deletes the notification.
   * - A full notification is merged with existing data (preserving fields
   *   like _localData that the poller doesn't provide).
   * - A partial patch (e.g. { _localData: { isUnread: false } }) merges
   *   into the existing notification, with _localData deep-merged.
   * - For brand-new notifications, _localData defaults to
   *   { isUnread: true, isSaved: false }.
   */
  /** @param {[string, UpsertData | null][]} entries */
  upsert(entries) {
    console.log('upserting notifications')
    console.log('num deletes', entries.filter(([_, notification]) => notification === null).length)
    console.log('num upserts', entries.filter(([_, notification]) => notification !== null).length)

    if (entries.length === 0) {
      return
    }

    if (!this.#notifications) {
      this.#notifications = new Map()
    }

    for (const [id, data] of entries) {
      if (data === null) {
        this.#notifications.delete(id)
      } else {
        const existing = this.#notifications.get(id)
        if (existing) {
          this.#notifications.set(
            id,
            /** @type {GitHubNotificationNode} */ ({
              ...existing,
              ...data,
              _localData: { ...existing._localData, ...data._localData }
            })
          )
        } else {
          this.#notifications.set(
            id,
            /** @type {GitHubNotificationNode} */ ({
              ...data,
              _localData: this.#createLocalData()
            })
          )
        }
      }
    }

    this.#scheduleSave()
    this.#onChange()
  }

  clear() {
    console.log('clearing notification store')
    this.#notifications = null

    try {
      if (fs.existsSync(this.#filePath)) {
        fs.unlinkSync(this.#filePath)
      }
    } catch (err) {
      broadcastError('store', `Failed to delete notification store file: ${err.message}`)
    }

    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer)
      this.#saveTimer = null
    }

    this.#onChange()
  }

  /** @returns {import('./github/queries/fetchNotifications.js').GitHubNotificationNode[] | null} */
  getAll() {
    if (!this.#notifications) {
      return null
    }
    return Array.from(this.#notifications.values())
  }

  /** @param {string} id @returns {GitHubNotificationNode | null} */
  get(id) {
    return this.#notifications?.get(id) ?? null
  }

  /** @param {string} id @returns {boolean} */
  has(id) {
    return this.#notifications?.has(id) ?? false
  }
}

export { NotificationStore }
