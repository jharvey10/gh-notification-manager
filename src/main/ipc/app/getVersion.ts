import { app } from 'electron'

export function getVersion() {
  return globalThis.__payloadVersion || app.getVersion()
}
