import type { IpcContext } from '../types.js'

export function get({ preferencesStore }: IpcContext) {
  return preferencesStore.get()
}
