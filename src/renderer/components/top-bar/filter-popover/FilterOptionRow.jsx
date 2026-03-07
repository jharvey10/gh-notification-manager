import React from 'react'
import { Button } from '../../Button'

export function FilterOptionRow({ item, isIncluded, isExcluded, onToggle }) {
  return (
    <div className="join min-w-40">
      <Button
        className="join-item"
        outline={!isExcluded}
        aria-pressed={isExcluded}
        aria-label={`${isExcluded ? 'Remove' : 'Exclude'} ${item} filter`}
        onClick={() => onToggle(item, 'exclude')}
      >
        -
      </Button>
      <div
        className="join-item px-4 border border-primary truncate flex-1 text-sm flex items-center justify-center text-indigo-300"
        title={item}
      >
        {item}
      </div>
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
