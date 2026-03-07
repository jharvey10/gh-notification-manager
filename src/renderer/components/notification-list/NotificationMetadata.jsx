import React from 'react'
import PropTypes from 'prop-types'
import { Badge } from '../Badge.jsx'
import clsx from 'clsx'

export function NotificationMetadata({ typeLabel, repo, tags, isUnread }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      <Badge className={clsx('badge-sm badge-primary', !isUnread && 'text-gray-400')}>{repo}</Badge>

      <Badge className={clsx('badge-sm badge-primary', !isUnread && 'text-gray-400')}>
        {typeLabel}
      </Badge>

      {tags.map((tag) => (
        <Badge key={tag} className={clsx('badge-sm badge-primary', !isUnread && 'text-gray-400')}>
          {tag}
        </Badge>
      ))}
    </div>
  )
}

NotificationMetadata.propTypes = {
  typeLabel: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  isUnread: PropTypes.bool.isRequired
}
