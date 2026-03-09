import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS } from '../../shared/settings.js'

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        const nextSettings = await globalThis.api.getSettings()
        if (mounted) {
          setSettings(nextSettings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }

    void loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  const updateSettings = async (partialSettings) => {
    const nextSettings = await globalThis.api.updateSettings(partialSettings)
    setSettings(nextSettings)
    return nextSettings
  }

  return { settings, updateSettings }
}
