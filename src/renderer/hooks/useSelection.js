import { useState, useCallback, useEffect, useMemo } from 'react'

export function useSelection(notifications) {
  const notificationList = useMemo(() => notifications ?? [], [notifications])
  const [selected, setSelected] = useState(new Set())

  useEffect(() => {
    const currentIds = new Set(notificationList.map((n) => n.id))
    setSelected((prev) => {
      const pruned = new Set([...prev].filter((id) => currentIds.has(id)))
      if (pruned.size === prev.size) {
        return prev
      }
      return pruned
    })
  }, [notificationList])

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids) => {
    setSelected(new Set(ids))
  }, [])

  const addToSelection = useCallback((ids) => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  return { selected, toggle, selectAll, addToSelection, clearSelection }
}
