import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

const BUTTON_VARIANTS = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'info',
  'success',
  'warning',
  'error'
]

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  outline = true,
  disabled = false,
  ...buttonProps
}) {
  return (
    <button
      type={type}
      className={clsx(
        'btn',
        `btn-${variant}`,
        outline && 'btn-outline bg-base-100',
        !disabled && 'text-indigo-300',
        disabled && 'btn-disabled bg-base-content/1 border-base-content/10',
        className
      )}
      disabled={disabled}
      {...buttonProps}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(BUTTON_VARIANTS),
  outline: PropTypes.bool,
  disabled: PropTypes.bool
}
