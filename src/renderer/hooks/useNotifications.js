import { useState, useEffect } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    globalThis.api
      .getNotifications()
      .then(setNotifications)
      .catch((err) => console.error('Failed to load notifications:', err))

    return globalThis.api.onNotificationsUpdated((n) => {
      setNotifications(n)
    })
  }, [])

  return { notifications }
}
