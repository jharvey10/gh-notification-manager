import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import BookmarkIcon from '../../../assets/icons/bookmark.svg?react'

export function NotificationTitle({ title, url, isUnread, isSaved, onOpen }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      {isSaved && <BookmarkIcon className="fill-primary size-4 shrink-0" />}

      {url && (
        <button
          className={clsx(
            'btn btn-link inline h-auto w-full p-0 m-0 text-left no-underline hover:underline',
            isUnread ? 'text-base-content' : 'text-base-content/50'
          )}
          type="button"
          onClick={onOpen}
        >
          {title}
        </button>
      )}

      {!url && <span className="font-medium text-base-content/70">{title}</span>}
    </div>
  )
}

NotificationTitle.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  isUnread: PropTypes.bool.isRequired,
  isSaved: PropTypes.bool,
  onOpen: PropTypes.func.isRequired
}
