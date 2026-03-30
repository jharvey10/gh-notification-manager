import { useState, useEffect, useCallback } from 'react'

const MAX_VISIBLE_ERRORS = 3

export function useErrors() {
  const [errors, setErrors] = useState([])

  useEffect(() => {
    return globalThis.api.onMainError(({ source, message }) => {
      const msg = `[main/${source}] ${message}`
      console.error(msg)

      const newErrors = [...errors]
      if (newErrors.includes(msg)) {
        return
      }

      newErrors.push(msg)

      if (newErrors.length > MAX_VISIBLE_ERRORS) {
        newErrors.shift()
      }

      setErrors(newErrors)
    })
  }, [])

  const dismissError = useCallback(
    (message) => {
      setErrors(errors.filter((e) => e !== message))
    },
    [errors]
  )

  return { errors, dismissError }
}
