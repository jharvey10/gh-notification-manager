import React from 'react'
import { Button } from '../../Button'

export function FilterOptionRow({ item, isIncluded, isExcluded, onToggle }) {
  return (
    <div className="join">
      <Button
        className="join-item"
        outline={!isExcluded}
        aria-pressed={isExcluded}
        aria-label={`${isExcluded ? 'Remove' : 'Exclude'} ${item} filter`}
        onClick={() => onToggle(item, 'exclude')}
      >
        -
      </Button>
      <span
        className="join-item border border-primary truncate flex-1 text-sm flex items-center justify-center text-indigo-300"
        title={item}
      >
        {item}
      </span>
      <Button
        className="join-item"
        outline={!isIncluded}
        aria-pressed={isIncluded}
        aria-label={`${isIncluded ? 'Remove' : 'Include'} ${item} filter`}
        onClick={() => onToggle(item, 'include')}
      >
        +
      </Button>
    </div>
  )
}
