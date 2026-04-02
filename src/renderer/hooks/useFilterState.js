import { useState, useCallback, useEffect } from 'react'
import { createDefaultFilters } from '../filters/createDefaultFilters.js'

const FILTER_STORAGE_KEY = 'gh-notification-manager.filters'

/**
 * @param {import('../filters/types.js').FilterSelection[]} data
 * @returns {boolean}
 */
const isValidSelectionsArray = (data) =>
  Array.isArray(data) &&
  data.every(
    (s) => typeof s?.value === 'string' && (s.state === 'include' || s.state === 'exclude')
  )

/** @returns {import('../filters/types.js').FilterSet} */
function readStoredFilters() {
  if (typeof globalThis.localStorage?.getItem !== 'function') {
    return createDefaultFilters()
  }

  try {
    const stored = globalThis.localStorage.getItem(FILTER_STORAGE_KEY)
    if (!stored) {
      return createDefaultFilters()
    }

    const parsed = JSON.parse(stored)
    const defaults = createDefaultFilters()

    return {
      text: {
        type: 'text',
        data: typeof parsed?.text?.data === 'string' ? parsed.text.data : defaults.text.data
      },
      tag: {
        type: 'tag',
        data: isValidSelectionsArray(parsed?.tag?.data) ? parsed.tag.data : defaults.tag.data
      },
      repo: {
        type: 'repo',
        data: isValidSelectionsArray(parsed?.repo?.data) ? parsed.repo.data : defaults.repo.data
      },
      unreadOnly: {
        type: 'unreadOnly',
        data:
          typeof parsed?.unreadOnly?.data === 'boolean'
            ? parsed.unreadOnly.data
            : defaults.unreadOnly.data
      }
    }
  } catch (err) {
    console.warn('Failed to restore filters from local storage:', err)
    return createDefaultFilters()
  }
}

/** @param {import('../filters/types.js').FilterSet} filters */
function writeStoredFilters(filters) {
  if (typeof globalThis.localStorage?.setItem !== 'function') {
    return
  }

  try {
    globalThis.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  } catch (err) {
    console.warn('Failed to persist filters to local storage:', err)
  }
}

/**
 * Manages filter state and persistence.
 * Does not execute filtering — use applyFilters from the pipeline for that.
 */
export function useFilterState() {
  const [filters, setFilters] = useState(readStoredFilters)

  useEffect(() => {
    writeStoredFilters(filters)
  }, [filters])

  const setTextFilter = useCallback(
    /** @param {string} value */
    (value) => setFilters((prev) => ({ ...prev, text: { ...prev.text, data: value } })),
    []
  )

  const setBooleanFilter = useCallback(
    /** @param {boolean} value */
    (value) =>
      setFilters((prev) => ({
        ...prev,
        unreadOnly: { ...prev.unreadOnly, data: value }
      })),
    []
  )

  const setTagFilter = useCallback(
    /**
     * @param {string} value
     * @param {'include' | 'exclude' | null} state - null to remove
     */
    (value, state) =>
      setFilters((prev) => {
        const without = prev.tag.data.filter((s) => s.value !== value)
        const data = state ? [...without, { value, state }] : without
        return { ...prev, tag: { ...prev.tag, data } }
      }),
    []
  )

  const setRepoFilter = useCallback(
    /**
     * @param {string} value
     * @param {'include' | 'exclude' | null} state - null to remove
     */
    (value, state) =>
      setFilters((prev) => {
        const without = prev.repo.data.filter((s) => s.value !== value)
        const data = state ? [...without, { value, state }] : without
        return { ...prev, repo: { ...prev.repo, data } }
      }),
    []
  )

  const clearTagFilter = useCallback(
    () => setFilters((prev) => ({ ...prev, tag: { ...prev.tag, data: [] } })),
    []
  )

  const clearRepoFilter = useCallback(
    () => setFilters((prev) => ({ ...prev, repo: { ...prev.repo, data: [] } })),
    []
  )

  return {
    filters,
    setTextFilter,
    setBooleanFilter,
    setTagFilter,
    setRepoFilter,
    clearTagFilter,
    clearRepoFilter
  }
}
