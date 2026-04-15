import type { IpcContext } from '../types.js'

export function save({ store }: IpcContext, id: string) {
  store.upsert([[id, { _localData: { isSaved: true } }]])
}
