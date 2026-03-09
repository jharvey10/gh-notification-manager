import clsx from 'clsx'
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../Button'

const compareValues = (left, right) => left.localeCompare(right)

function toActiveItems(includedItems, excludedItems) {
  const included = [...includedItems]
    .sort(compareValues)
    .map((item) => ({ key: `include:${item}`, label: `+${item}`, value: item, mode: 'include' }))
  const excluded = [...excludedItems]
    .sort(compareValues)
    .map((item) => ({ key: `exclude:${item}`, label: `-${item}`, value: item, mode: 'exclude' }))

  return [...included, ...excluded]
}

export function ActiveFilterList({ includedItems, excludedItems, onToggle, onClear }) {
  const activeItems = toActiveItems(includedItems, excludedItems)

  if (activeItems.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 max-w-80">
      <span className="text-sm text-base-content/70">{activeItems.length} selected</span>
      <Button onClick={onClear} className="btn-xs">
        Clear all
      </Button>

      {activeItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={clsx(
            'btn btn-xs btn-outline justify-start',
            item.mode === 'include' ? 'btn-success' : 'btn-error'
          )}
          onClick={() => onToggle(item.value, item.mode)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

ActiveFilterList.propTypes = {
  includedItems: PropTypes.instanceOf(Set).isRequired,
  excludedItems: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}
