import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

export function Action({ icon: Icon, children, onSelect, onActionComplete, className }) {
  const handleClick = () => {
    onSelect()
    onActionComplete?.()
  }

  return (
    <button
      type="button"
      className={clsx(
        'btn btn-primary btn-outline w-full pr-8 justify-start bg-base-100',
        className
      )}
      onClick={handleClick}
    >
      {Icon && <Icon className="fill-primary size-4 shrink-0" />}
      {children}
    </button>
  )
}

Action.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  onActionComplete: PropTypes.func,
  className: PropTypes.string
}
