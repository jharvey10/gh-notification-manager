import type { IpcContext } from '../types.js'

export function markRead({ store }: IpcContext, ids: string[]) {
  store.upsert(ids.map((id) => [id, { _localData: { isUnread: false } }]))
}
