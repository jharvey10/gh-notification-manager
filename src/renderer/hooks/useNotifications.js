import { useState, useEffect, useCallback } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    globalThis.api
      .getNotifications()
      .then(setNotifications)
      .catch((err) => console.error('Failed to load notifications:', err))

    return globalThis.api.onNotificationsUpdated(setNotifications)
  }, [])

  const refresh = useCallback(() => {
    setNotifications(null)
    globalThis.api.refreshNow()
  }, [])

  return { notifications, refresh }
}
