import React, { useRef } from 'react'
import { clsx } from 'clsx'

export function PopoverCard({ popoverId, anchorName, trigger, children, className }) {
  const popoverRef = useRef(null)
  const close = () => popoverRef.current?.hidePopover()
  const triggerStyle = trigger.props.style ?? undefined

  return (
    <>
      {React.cloneElement(trigger, {
        popoverTarget: popoverId,
        style: {
          ...triggerStyle,
          anchorName,
        },
      })}

      <div
        className={clsx(
          'dropdown w-96 max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-200 p-3 text-base-content shadow-sm',
          className,
        )}
        popover="auto"
        id={popoverId}
        ref={popoverRef}
        style={{ positionAnchor: anchorName }}
      >
        {typeof children === 'function' ? children({ close }) : children}
      </div>
    </>
  )
}
