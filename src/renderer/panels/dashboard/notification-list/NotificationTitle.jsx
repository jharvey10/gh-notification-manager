import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import BookmarkIcon from '../../../assets/icons/bookmark.svg?react'

export function NotificationTitle({ title, url, isUnread, isSaved, onOpen, subjectRef }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      {isSaved && <BookmarkIcon className="fill-secondary size-4 relative top-px shrink-0" />}

      <div>
        {url && (
          <a
            className={clsx(
              'no-underline hover:underline text-sm',
              !isUnread && 'text-base-content/50'
            )}
            type="button"
            href={url}
            onClick={onOpen}
          >
            {title}
          </a>
        )}

        {!url && (
          <span className={clsx('font-medium', !isUnread && 'text-base-content/50')}>{title}</span>
        )}

        {subjectRef && <span className="ml-2 text-base-content/50 text-sm">{subjectRef}</span>}
      </div>
    </div>
  )
}

NotificationTitle.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  isUnread: PropTypes.bool.isRequired,
  isSaved: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  subjectRef: PropTypes.string
}
