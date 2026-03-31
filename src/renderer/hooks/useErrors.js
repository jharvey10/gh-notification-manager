import { useState, useEffect, useCallback } from 'react'

const MAX_VISIBLE_ERRORS = 3

export function useErrors() {
  const [errors, setErrors] = useState([])

  useEffect(() => {
    return globalThis.api.onMainError(({ source, message }) => {
      const msg = `[main/${source}] ${message}`
      console.error(msg)

      setErrors((prev) => {
        if (prev.includes(msg)) {
          return prev
        }
        const next = [msg, ...prev]
        while (next.length > MAX_VISIBLE_ERRORS) {
          next.pop()
        }

        return next
      })
    })
  }, [])

  const dismissError = useCallback((message) => {
    setErrors((prev) => prev.filter((e) => e !== message))
  }, [])

  return { errors, dismissError }
}
