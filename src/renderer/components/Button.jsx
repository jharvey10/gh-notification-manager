import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

const VARIANT_CLASSES = {
  neutral: 'btn-neutral',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  info: 'btn-info',
  success: 'btn-success',
  warning: 'btn-warning',
  error: 'btn-error'
}

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  outline = true,
  disabled = false,
  tooltip,
  ...buttonProps
}) {
  const variantClass = VARIANT_CLASSES[variant]
  const outlineClass = outline ? 'btn-outline bg-base-100' : ''
  const disabledClass = disabled ? 'btn-disabled bg-base-content/1 border-base-content/10' : ''
  const textClass = disabled ? '' : 'text-primary'
  const classes = clsx(
    'btn',
    variantClass,
    tooltip && 'relative tooltip tooltip-bottom hover:z-60 focus:z-60 before:z-60 after:z-60',
    outlineClass,
    disabledClass,
    textClass,
    className
  )
  return (
    <button type={type} className={classes} disabled={disabled} data-tip={tooltip} {...buttonProps}>
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(Object.keys(VARIANT_CLASSES)),
  outline: PropTypes.bool,
  disabled: PropTypes.bool,
  tooltip: PropTypes.string
}
