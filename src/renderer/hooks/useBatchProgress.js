import { useState, useEffect } from 'react'

export function useBatchProgress() {
  const [batchProgress, setBatchProgress] = useState(null)

  useEffect(() => {
    return globalThis.api.onBatchProgress(setBatchProgress)
  }, [])

  return batchProgress
}
