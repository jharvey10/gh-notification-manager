import PropTypes from 'prop-types'
import { NotificationItem } from './NotificationItem.jsx'

export function NotificationList({ items, selected, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          isSelected={selected.has(n.id)}
          onToggle={() => onToggle(n.id)}
        />
      ))}
    </div>
  )
}

NotificationList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.shape({
    has: PropTypes.func.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired
}
