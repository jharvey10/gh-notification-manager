import { useMemo } from 'react'
import { getNotificationRepo, compareValues } from '../utils/notifications'

export function useRepoOptions(notifications, selections) {
  return useMemo(() => {
    const counts = new Map()
    const repoSet = new Set(selections.map((s) => s.value))
    for (const n of notifications) {
      const repo = getNotificationRepo(n)
      repoSet.add(repo)
      counts.set(repo, (counts.get(repo) ?? 0) + 1)
    }
    return { items: [...repoSet].sort(compareValues), counts }
  }, [notifications, selections])
}
