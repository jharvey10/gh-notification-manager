import type { IpcContext } from '../types.js'

export function markUnread({ store }: IpcContext, ids: string[]) {
  store.upsert(ids.map((id) => [id, { _localData: { isUnread: true } }]))
}
