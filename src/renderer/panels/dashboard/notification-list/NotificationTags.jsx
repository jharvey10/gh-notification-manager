import PropTypes from 'prop-types'
import { Badge } from '../../../components/Badge.jsx'
import clsx from 'clsx'

export function NotificationTags({ repo, tags, isUnread }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      {repo && (
        <Badge className={clsx('badge-sm badge-primary', !isUnread && 'text-primary/70')}>
          {repo}
        </Badge>
      )}

      {tags?.map((tag) => (
        <Badge key={tag} className={clsx('badge-sm badge-primary', !isUnread && 'text-primary/70')}>
          {tag}
        </Badge>
      ))}
    </div>
  )
}

NotificationTags.propTypes = {
  repo: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  isUnread: PropTypes.bool.isRequired
}
