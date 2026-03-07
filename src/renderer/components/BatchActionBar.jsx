import React from 'react'
import PropTypes from 'prop-types'
import { Button } from './Button'

export function BatchActionBar({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onMarkRead,
  onMarkDone
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      <Button onClick={onSelectAll}>Select All</Button>
      <Button onClick={onClearSelection}>Clear Selection</Button>
      <Button onClick={onMarkRead} disabled={selectedCount === 0}>
        Mark Read ({selectedCount})
      </Button>
      <Button onClick={onMarkDone} disabled={selectedCount === 0}>
        Mark Done ({selectedCount})
      </Button>
    </div>
  )
}

BatchActionBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  onMarkRead: PropTypes.func.isRequired,
  onMarkDone: PropTypes.func.isRequired
}
