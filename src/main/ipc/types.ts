import type { NotificationStore } from '../NotificationStore.js'
import type { PreferencesStore } from '../PreferencesStore.js'

export type IpcContext = {
  store: NotificationStore
  preferencesStore: PreferencesStore
}
