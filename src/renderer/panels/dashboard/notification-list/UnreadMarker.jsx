import PropTypes from 'prop-types'
import { clsx } from 'clsx'

export function UnreadMarker({ isUnread }) {
  return <span className={clsx('status', isUnread && 'status-warning', !isUnread && 'invisible')} />
}

UnreadMarker.propTypes = {
  isUnread: PropTypes.bool.isRequired
}
