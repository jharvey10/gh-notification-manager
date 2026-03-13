import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import { Button } from '../../../components/Button'

export function Action({ icon: Icon, children, onSelect, onActionComplete, className }) {
  const handleClick = () => {
    onSelect()
    onActionComplete?.()
  }

  return (
    <Button
      variant="primary"
      className={clsx('pr-8 justify-start whitespace-nowrap', className)}
      onClick={handleClick}
    >
      {Icon && <Icon className="fill-primary size-4 shrink-0" />}
      {children}
    </Button>
  )
}

Action.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  onActionComplete: PropTypes.func,
  className: PropTypes.string
}
