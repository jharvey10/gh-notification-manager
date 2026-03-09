import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../../components/Button'

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
        className="join-item flex flex-1 items-center justify-center truncate border border-primary px-4 text-sm text-primary"
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

FilterOptionRow.propTypes = {
  item: PropTypes.string.isRequired,
  isIncluded: PropTypes.bool.isRequired,
  isExcluded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
}
