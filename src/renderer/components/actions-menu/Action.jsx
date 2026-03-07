import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

export function Action({ children, onSelect, onActionComplete, className }) {
  const handleClick = async () => {
    await onSelect()
    onActionComplete?.()
  }

  return (
    <button
      type="button"
      className={clsx(
        'btn btn-primary btn-outline w-full justify-start bg-base-100 text-indigo-300',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

Action.propTypes = {
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  onActionComplete: PropTypes.func,
  className: PropTypes.string
}
