import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../Button'
import { NotificationList } from './NotificationList'

const OLDER_THAN_DAYS = 7 // TODO: change back to 14 days

function splitByAge(notifications) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - OLDER_THAN_DAYS)

  const current = []
  const older = []

  for (const notification of notifications) {
    const updatedAt = new Date(notification.lastUpdatedAt)
    if (updatedAt < cutoff) {
      older.push(notification)
    } else {
      current.push(notification)
    }
  }

  return { current, older }
}

export function NotificationListContainer({ notifications, selected, onToggle, onSelectGroup }) {
  if (notifications.length === 0) return <p>No notifications.</p>

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt)
  )
  const { current, older } = splitByAge(sorted)

  return (
    <div className="flex flex-col gap-4 m-1 mb-4">
      <section className="bg-base-100">
        <div className="flex items-center gap-2 p-4">
          <span className="font-medium">Notifications ({current.length})</span>
          <Button
            onClick={() => {
              onSelectGroup(current.map((n) => n.id))
            }}
          >
            Select all
          </Button>
        </div>
        <NotificationList items={current} selected={selected} onToggle={onToggle} />
      </section>

      {older.length > 0 && (
        <details className="collapse collapse-arrow border border-gray-700 bg-base-100">
          <summary className="collapse-title flex gap-2 items-center">
            <span>
              Older than {OLDER_THAN_DAYS} days ({older.length})
            </span>
            <Button
              onClick={() => {
                onSelectGroup(older.map((n) => n.id))
              }}
            >
              Select all
            </Button>
          </summary>
          <div className="collapse-content">
            <NotificationList items={older} selected={selected} onToggle={onToggle} />
          </div>
        </details>
      )}
    </div>
  )
}

NotificationListContainer.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.shape({
    has: PropTypes.func.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelectGroup: PropTypes.func.isRequired
}
