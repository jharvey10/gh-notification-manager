import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import { PopoverCard } from '../top-bar/PopoverCard.jsx'

export function ActionsMenu({ popoverId, anchorName, trigger, children, className }) {
  return (
    <PopoverCard
      popoverId={popoverId}
      anchorName={anchorName}
      trigger={trigger}
      className={clsx('w-44 p-2', className)}
    >
      {({ close }) => (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child

            return React.cloneElement(child, {
              onActionComplete: close
            })
          })}
        </div>
      )}
    </PopoverCard>
  )
}

ActionsMenu.propTypes = {
  popoverId: PropTypes.string.isRequired,
  anchorName: PropTypes.string.isRequired,
  trigger: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
