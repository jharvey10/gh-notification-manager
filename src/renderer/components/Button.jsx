import React from 'react'
import { clsx } from 'clsx'

export function Button({
  className,
  type = 'button',
  outline = true,
  disabled = false,
  ...buttonProps
}) {
  return (
    <button
      type={type}
      className={clsx(
        'btn btn-primary btn-sm',
        outline && 'btn-outline bg-base-100',
        !disabled && 'text-indigo-300',
        disabled && 'btn-disabled bg-base-content/1 border-base-content/10',
        className
      )}
      disabled={disabled}
      {...buttonProps}
    />
  )
}
