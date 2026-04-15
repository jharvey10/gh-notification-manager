import type { IpcContext } from '../types.js'

export function get({ store }: IpcContext) {
  return store.getAll()
}
