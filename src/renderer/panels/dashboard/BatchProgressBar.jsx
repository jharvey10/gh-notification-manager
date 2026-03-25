import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

export function BatchProgressBar({ batchProgress }) {
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)

  // Batch started — show the bar and reset
  useEffect(() => {
    if (batchProgress === null) {
      return
    }
    setVisible(true)
    setPercent(Math.max((batchProgress.completed / batchProgress.total) * 100, 1))
  }, [batchProgress])

  // Batch finished — snap to 100% and fade out after 1s
  useEffect(() => {
    if (batchProgress !== null) {
      return
    }
    if (!visible) {
      return
    }
    setPercent(100)
    const timer = setTimeout(() => setVisible(false), 1000)
    return () => clearTimeout(timer)
  }, [batchProgress])

  // Fake creep while visible
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setPercent((prev) => (prev < 99 ? prev + 0.5 : prev))
    }, 250)
    return () => clearInterval(id)
  }, [visible])

  return (
    <div
      className={clsx(
        'ml-auto flex w-56 items-center gap-3 text-sm text-base-content/70 transition-all duration-300',
        visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
      )}
    >
      <progress className="progress progress-primary flex-1" value={percent} max={100} />
      <span className="tabular-nums whitespace-nowrap">{Math.round(percent)}%</span>
    </div>
  )
}

BatchProgressBar.propTypes = {
  batchProgress: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  })
}
