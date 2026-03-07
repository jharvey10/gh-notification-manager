import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'

export function NotificationTitle({ title, url, isUnread, onOpen }) {
  return (
    <div className="flex min-w-0 flex-1">
      {url && (
        <button
          className={clsx(
            'btn btn-link w-full h-auto p-0 m-0 no-underline hover:underline inline text-left',
            isUnread ? 'text-primary-content' : 'text-gray-400'
          )}
          type="button"
          onClick={onOpen}
        >
          {title}
        </button>
      )}

      {!url && <span className="font-medium text-base-content/80">{title}</span>}
    </div>
  )
}

NotificationTitle.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  isUnread: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired
}
