import type { IpcContext } from '../types.js'

export function update({ preferencesStore }: IpcContext, partialSettings: Record<string, unknown>) {
  return preferencesStore.update(partialSettings)
}
