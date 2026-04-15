import { shell } from 'electron'

export function openExternal(url: string) {
  const parsed = new URL(url)
  if (parsed.hostname === 'github.com' && parsed.protocol === 'https:') {
    shell.openExternal(url)
  }
}
