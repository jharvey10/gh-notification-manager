import { clsx } from 'clsx'
import React from 'react'
import PropTypes from 'prop-types'

export function Badge({ children, onClick, className, ...props }) {
  return (
    <button
      className={clsx('badge badge-soft', onClick && 'cursor-pointer', className)}
      type="button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string
}
