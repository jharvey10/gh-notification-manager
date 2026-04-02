import { clsx } from 'clsx'
import PropTypes from 'prop-types'

export function Badge({ children, onClick = undefined, className = undefined, ...props }) {
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
