import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { broadcastError } from './broadcastError.js'
import { LocalNotificationData, LocalNotificationDataPatch } from './github/queries/types.js'
import type { Notification } from './pipeline/types.js'

const SAVE_DEBOUNCE_MS = 1000
const STORE_VERSION = 2

export type UpsertData = Omit<Partial<Notification>, '_localData'> & {
  _localData?: LocalNotificationDataPatch
}

class NotificationStore {
  static createLocalData(): LocalNotificationData {
    return { isUnread: true, isSaved: false }
  }

  #notifications: Map<string, Notification> | null = null
  #deletedIds: Set<string> = new Set()
  #initialIndexComplete = false
  readonly #onChange: (store: NotificationStore) => void
  readonly #filePath: string
  #saveTimer: ReturnType<typeof setTimeout> | null = null

  constructor({ onChange }: { onChange: (store: NotificationStore) => void }) {
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
      if (Array.isArray(data.deletedIds)) {
        this.#deletedIds = new Set(data.deletedIds)
      }
      if (typeof data.initialIndexComplete === 'boolean') {
        this.#initialIndexComplete = data.initialIndexComplete
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
      const payload = {
        version: STORE_VERSION,
        notifications,
        deletedIds: [...this.#deletedIds],
        initialIndexComplete: this.#initialIndexComplete
      }
      fs.mkdirSync(path.dirname(this.#filePath), { recursive: true })
      fs.writeFileSync(this.#filePath, JSON.stringify(payload))
    } catch (err) {
      broadcastError('store', `Failed to save notification store: ${err.message}`)
    }
  }

  /**
   * Upsert notification entries. Each entry is [id, data | null].
   * - null deletes the notification (and tracks it in deletedIds).
   * - A full notification is merged with existing data (preserving fields
   *   like _localData that the poller doesn't provide).
   * - A partial patch (e.g. { _localData: { isUnread: false } }) merges
   *   into the existing notification, with _localData deep-merged.
   * - For brand-new notifications, _localData defaults to
   *   { isUnread: true, isSaved: false }.
   */
  upsert(entries: [string, UpsertData | null][]): Notification[] {
    console.log('upserting notifications')
    console.log('num deletes', entries.filter(([_, notification]) => notification === null).length)
    console.log('num upserts', entries.filter(([_, notification]) => notification !== null).length)

    if (entries.length === 0) {
      return []
    }

    if (!this.#notifications) {
      this.#notifications = new Map()
    }

    const merged: Notification[] = []

    for (const [id, data] of entries) {
      if (data === null) {
        this.#notifications.delete(id)
        this.#deletedIds.add(id)
        continue
      }

      const existing = this.#notifications.get(id)

      const result = {
        ...existing,
        ...data,
        _localData: {
          ...NotificationStore.createLocalData(),
          ...existing?._localData,
          ...data._localData
        }
      }

      this.#notifications.set(id, result)
      merged.push(result)
    }

    this.#scheduleSave()
    this.#onChange(this)
    return merged
  }

  /**
   * Mark notification IDs as deleted. Removes from the notifications map
   * and adds to the deletedIds set so they are filtered on future polls.
   */
  markDeleted(ids: string[]) {
    if (!this.#notifications) {
      this.#notifications = new Map()
    }
    for (const id of ids) {
      this.#notifications.delete(id)
      this.#deletedIds.add(id)
    }
    this.#scheduleSave()
    this.#onChange(this)
  }

  isDeleted(id: string): boolean {
    return this.#deletedIds.has(id)
  }

  isInitialIndexComplete(): boolean {
    return this.#initialIndexComplete
  }

  setInitialIndexComplete() {
    this.#initialIndexComplete = true
    this.#scheduleSave()
  }

  /**
   * Hard reset: clears all data including deletedIds and initialIndexComplete.
   * Used by the "Reset All Data" action in Settings.
   */
  hardReset() {
    console.log('hard-resetting notification store')
    this.#notifications = null
    this.#deletedIds = new Set()
    this.#initialIndexComplete = false

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

    this.#onChange(this)
  }

  getAll(): Notification[] | null {
    if (!this.#notifications) {
      return null
    }
    return Array.from(this.#notifications.values())
  }

  get(id: string): Notification | null {
    return this.#notifications?.get(id) ?? null
  }

  has(id: string): boolean {
    return this.#notifications?.has(id) ?? false
  }

  /**
   * Returns the cached updated_at timestamp for a thread, if it exists.
   * Used by SyncEngine for early-stop pagination.
   */
  getUpdatedAt(id: string): string | undefined {
    return this.#notifications?.get(id)?.lastUpdatedAt
  }
}

export { NotificationStore }
