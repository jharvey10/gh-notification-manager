import type { IpcContext } from '../types.js'

export function unsave({ store }: IpcContext, id: string) {
  store.upsert([[id, { _localData: { isSaved: false } }]])
}
