import { useMemo } from 'react'
import { compareValues } from '../utils/notifications'

export function useTagOptions(notifications, selections) {
  return useMemo(() => {
    const counts = new Map()
    const tagSet = new Set(selections.map((s) => s.value))
    for (const n of notifications) {
      for (const t of n.tags || []) {
        tagSet.add(t)
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return { items: [...tagSet].sort(compareValues), counts }
  }, [notifications, selections])
}
