import React from 'react'
import { Button } from './Button'

export function ActionBar({
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
