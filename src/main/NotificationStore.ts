import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { broadcastError } from './broadcastError.js'
import { LocalNotificationData, LocalNotificationDataPatch } from './github/queries/types.js'
import type { Notification } from './pipeline/types.js'

const SAVE_DEBOUNCE_MS = 1000
const STORE_VERSION = 3

export type UpsertData = Omit<Partial<Notification>, '_localData'> & {
  _localData?: LocalNotificationDataPatch
}

class NotificationStore {
  static createLocalData(): LocalNotificationData {
    return { isUnread: true, isSaved: false }
  }

  #notifications: Record<string, Notification> | null = null
  #deleted: Record<string, string> = {}
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
    let data: any
    let wasConverted = false

    try {
      const raw = fs.readFileSync(this.#filePath, 'utf8')
      data = JSON.parse(raw)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        broadcastError('store', `Failed to load notification store: ${err.message}`)
      }
      return
    }

    if (data === null) {
      broadcastError('store', `Failed to load notification store: data was of type ${typeof data}`)
      return
    }

    if (data.version > STORE_VERSION) {
      broadcastError(
        'store',
        `Failed to load notification store: data was of version ${data.version} but expected ${STORE_VERSION}`
      )
      return
    }

    if (data.version === 1 /* to 2 */) {
      // Do not populate the store with data from version 1.
      return
    }

    if (data.version === 2 /* to 3 */) {
      data.version = 3
      wasConverted = true
      const now = new Date().toISOString()

      // deletedIds was a flat set persisted as a list. Convert it to a json object
      data.deleted = data.deletedIds.reduce((acc: Record<string, string>, id: string) => {
        acc[id] = now
        return acc
      }, {})
    }

    data.notifications ??= {}
    data.deleted ??= {}

    // After all model upgrades, set vars
    this.#notifications = data.notifications
    this.#deleted = data.deleted

    if (wasConverted) {
      this.#saveToDisk()
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
      const payload = {
        version: STORE_VERSION,
        notifications: this.#notifications ?? {},
        deleted: this.#deleted ?? {}
      }
      fs.mkdirSync(path.dirname(this.#filePath), { recursive: true })
      fs.writeFileSync(this.#filePath, JSON.stringify(payload))
    } catch (err) {
      broadcastError('store', `Failed to save notification store: ${err.message}`)
    }
  }

  /**
   * Upsert notification entries. Each entry is [id, data | null].
   * - null deletes the notification (and tracks it in deleted).
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

    this.#notifications ??= {}

    const merged: Notification[] = []

    const now = new Date().toISOString()

    for (const [id, data] of entries) {
      if (data === null) {
        delete this.#notifications[id]
        this.#deleted[id] = now
        continue
      }

      const existing = this.#notifications[id]

      const result = {
        ...existing,
        ...data,
        _localData: {
          ...NotificationStore.createLocalData(),
          ...existing?._localData,
          ...data._localData
        }
      }

      this.#notifications[id] = result
      merged.push(result)
    }

    this.#scheduleSave()
    this.#onChange(this)
    return merged
  }

  isDeleted(id: string): boolean {
    return id in this.#deleted
  }

  getDeletedAt(id: string): string | undefined {
    return this.#deleted[id]
  }

  /**
   * Remove IDs from the deleted set, allowing them to reappear
   * when they have new activity after being dismissed.
   */
  undelete(ids: string[]) {
    for (const id of ids) {
      delete this.#deleted[id]
    }
    this.#scheduleSave()
  }

  /**
   * Hard reset: clears all data including deleted.
   * Used by the "Reset All Data" action in Settings.
   */
  hardReset() {
    console.log('hard-resetting notification store')
    this.#notifications = null
    this.#deleted = {}

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
    return Object.values(this.#notifications)
  }

  get(id: string): Notification | null {
    return this.#notifications?.[id] ?? null
  }

  has(id: string): boolean {
    return this.#notifications?.[id] != null
  }

  /**
   * Returns the cached updated_at timestamp for a thread, if it exists.
   * Used by SyncEngine for early-stop pagination.
   */
  getUpdatedAt(id: string): string | undefined {
    return this.#notifications?.[id]?.lastUpdatedAt
  }
}

export { NotificationStore }
