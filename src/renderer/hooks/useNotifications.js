import { useState, useEffect, useCallback } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await globalThis.api.getNotifications()
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications:', err)
        setNotifications(null)
      } finally {
        setLoading(false)
      }
    }

    const cleanup = globalThis.api.onNotificationsUpdated((data) => {
      setNotifications(data)
      setLoading(false)
    })

    void loadNotifications()

    return cleanup
  }, [])

  const refresh = useCallback(() => {
    globalThis.api.refreshNow()
  }, [])

  return { notifications, loading, refresh }
}
