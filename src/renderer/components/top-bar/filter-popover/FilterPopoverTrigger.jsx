import React from 'react'
import { Button } from '../../Button'

export function FilterPopoverTrigger({ triggerLabel, activeItemCount, ...buttonProps }) {
  return (
    <Button {...buttonProps}>
      {activeItemCount > 0 ? `${triggerLabel} (${activeItemCount})` : triggerLabel}
    </Button>
  )
}
