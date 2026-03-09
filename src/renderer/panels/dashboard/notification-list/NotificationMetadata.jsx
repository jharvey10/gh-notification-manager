import React from 'react'
import PropTypes from 'prop-types'
import { Badge } from '../../../components/Badge.jsx'
import clsx from 'clsx'

export function NotificationMetadata({ repo, tags, isUnread }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      <Badge className={clsx('badge-sm badge-primary', !isUnread && 'text-primary/70')}>
        {repo}
      </Badge>

      {tags.map((tag) => (
        <Badge key={tag} className={clsx('badge-sm badge-primary', !isUnread && 'text-primary/70')}>
          {tag}
        </Badge>
      ))}
    </div>
  )
}

NotificationMetadata.propTypes = {
  repo: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  isUnread: PropTypes.bool.isRequired
}
