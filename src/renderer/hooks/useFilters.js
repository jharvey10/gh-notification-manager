import { useState, useMemo, useCallback, useEffect } from 'react'

const compareValues = (left, right) => left.localeCompare(right)
const FILTER_STORAGE_KEY = 'gh-notification-manager.filters'

const getNotificationRepo = (notification) => notification.optionalList?.nameWithOwner ?? 'unknown'

const createEmptyFilters = () => ({
  text: '',
  includedTags: new Set(),
  excludedTags: new Set(),
  includedRepos: new Set(),
  excludedRepos: new Set(),
  unreadOnly: false
})

const toStoredValues = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []

function readStoredFilters() {
  if (typeof globalThis.localStorage?.getItem !== 'function') {
    return createEmptyFilters()
  }

  try {
    const stored = globalThis.localStorage.getItem(FILTER_STORAGE_KEY)
    if (!stored) {
      return createEmptyFilters()
    }

    const parsed = JSON.parse(stored)

    return {
      text: typeof parsed.text === 'string' ? parsed.text : '',
      includedTags: new Set(toStoredValues(parsed.includedTags)),
      excludedTags: new Set(toStoredValues(parsed.excludedTags)),
      includedRepos: new Set(toStoredValues(parsed.includedRepos)),
      excludedRepos: new Set(toStoredValues(parsed.excludedRepos)),
      unreadOnly: parsed.unreadOnly === true
    }
  } catch (err) {
    console.warn('Failed to restore filters from local storage:', err)
    return createEmptyFilters()
  }
}

function writeStoredFilters(filters) {
  if (typeof globalThis.localStorage?.setItem !== 'function') {
    return
  }

  try {
    globalThis.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        text: filters.text,
        includedTags: [...filters.includedTags].sort(compareValues),
        excludedTags: [...filters.excludedTags].sort(compareValues),
        includedRepos: [...filters.includedRepos].sort(compareValues),
        excludedRepos: [...filters.excludedRepos].sort(compareValues),
        unreadOnly: filters.unreadOnly
      })
    )
  } catch (err) {
    console.warn('Failed to persist filters to local storage:', err)
  }
}

const toggleExclusiveFilter = (setIncluded, setExcluded, value, mode) => {
  if (mode === 'include') {
    setIncluded((prevIncluded) => {
      const nextIncluded = new Set(prevIncluded)
      const shouldDisable = nextIncluded.has(value)

      if (shouldDisable) nextIncluded.delete(value)
      else nextIncluded.add(value)

      setExcluded((prevExcluded) => {
        if (!prevExcluded.has(value)) return prevExcluded

        const nextExcluded = new Set(prevExcluded)
        nextExcluded.delete(value)
        return nextExcluded
      })

      return nextIncluded
    })
  }

  if (mode === 'exclude') {
    setExcluded((prevExcluded) => {
      const nextExcluded = new Set(prevExcluded)
      const shouldDisable = nextExcluded.has(value)

      if (shouldDisable) nextExcluded.delete(value)
      else nextExcluded.add(value)

      setIncluded((prevIncluded) => {
        if (!prevIncluded.has(value)) return prevIncluded

        const nextIncluded = new Set(prevIncluded)
        nextIncluded.delete(value)
        return nextIncluded
      })

      return nextExcluded
    })
  }
}

export function useFilters(notifications) {
  const notificationList = useMemo(() => notifications ?? [], [notifications])
  const [initialFilters] = useState(() => readStoredFilters())
  const [text, setText] = useState(initialFilters.text)
  const [includedTags, setIncludedTags] = useState(initialFilters.includedTags)
  const [excludedTags, setExcludedTags] = useState(initialFilters.excludedTags)
  const [includedRepos, setIncludedRepos] = useState(initialFilters.includedRepos)
  const [excludedRepos, setExcludedRepos] = useState(initialFilters.excludedRepos)
  const [unreadOnly, setUnreadOnly] = useState(initialFilters.unreadOnly)

  useEffect(() => {
    writeStoredFilters({
      text,
      includedTags,
      excludedTags,
      includedRepos,
      excludedRepos,
      unreadOnly
    })
  }, [text, includedTags, excludedTags, includedRepos, excludedRepos, unreadOnly])

  const allTags = useMemo(() => {
    const tagSet = new Set([...includedTags, ...excludedTags])
    for (const n of notificationList) {
      for (const t of n.tags || []) tagSet.add(t)
    }
    return [...tagSet].sort(compareValues)
  }, [notificationList, includedTags, excludedTags])

  const allRepos = useMemo(() => {
    const repoSet = new Set([...includedRepos, ...excludedRepos])
    for (const notification of notificationList) {
      repoSet.add(getNotificationRepo(notification))
    }
    return [...repoSet].sort(compareValues)
  }, [notificationList, includedRepos, excludedRepos])

  const filtered = useMemo(() => {
    const lowerText = text.toLowerCase()
    return notificationList.filter((n) => {
      const repo = getNotificationRepo(n)
      const tags = n.tags || []

      if (unreadOnly && !n.isUnread) return false
      if (lowerText) {
        const author = n.optionalSubject?.author?.login ?? ''
        const haystack = `${n.title} ${repo} ${author}`.toLowerCase()
        if (!haystack.includes(lowerText)) return false
      }
      if (includedTags.size > 0) {
        const hasIncludedTag = tags.some((tag) => includedTags.has(tag))
        if (!hasIncludedTag) return false
      }
      if (excludedTags.size > 0) {
        const hasExcludedTag = tags.some((tag) => excludedTags.has(tag))
        if (hasExcludedTag) return false
      }
      if (includedRepos.size > 0 && !includedRepos.has(repo)) return false
      if (excludedRepos.size > 0 && excludedRepos.has(repo)) return false
      return true
    })
  }, [notificationList, text, includedTags, excludedTags, includedRepos, excludedRepos, unreadOnly])

  const setTextFilter = useCallback((val) => setText(val), [])

  const toggleTagFilter = useCallback((tag, mode) => {
    toggleExclusiveFilter(setIncludedTags, setExcludedTags, tag, mode)
  }, [])

  const toggleRepoFilter = useCallback((repo, mode) => {
    toggleExclusiveFilter(setIncludedRepos, setExcludedRepos, repo, mode)
  }, [])

  const toggleUnreadOnly = useCallback(() => setUnreadOnly((v) => !v), [])
  const clearTagFilters = useCallback(() => {
    setIncludedTags(new Set())
    setExcludedTags(new Set())
  }, [])
  const clearRepoFilters = useCallback(() => {
    setIncludedRepos(new Set())
    setExcludedRepos(new Set())
  }, [])

  return {
    filters: {
      text,
      includedTags,
      excludedTags,
      includedRepos,
      excludedRepos,
      unreadOnly
    },
    setTextFilter,
    toggleTagFilter,
    toggleRepoFilter,
    toggleUnreadOnly,
    clearTagFilters,
    clearRepoFilters,
    allTags,
    allRepos,
    filtered
  }
}
