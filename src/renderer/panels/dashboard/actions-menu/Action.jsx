import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import { Button } from '../../../components/Button.jsx'

export function Action({
  icon: Icon,
  children,
  onSelect,
  onActionComplete = undefined,
  className = undefined,
  variant = 'primary',
  disabled = false
}) {
  const handleClick = () => {
    onSelect()
    onActionComplete?.()
  }

  return (
    <Button
      variant={variant}
      className={clsx('justify-start whitespace-nowrap pr-8', className)}
      onClick={handleClick}
      disabled={disabled}
    >
      {Icon && <Icon className="fill-current size-4 shrink-0" />}
      {children}
    </Button>
  )
}

Action.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  onActionComplete: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'accent',
    'info',
    'success',
    'warning',
    'error'
  ]),
  disabled: PropTypes.bool
}
