import { clsx } from 'clsx'
import React from 'react'

export function TagBadge({ tag, active, onClick }) {
  return (
    <button
      className={clsx(
        'badge badge-soft',
        active ? 'badge-primary' : 'badge-neutral',
        onClick && 'cursor-pointer'
      )}
      type="button"
      onClick={onClick}
    >
      {tag}
    </button>
  )
}
