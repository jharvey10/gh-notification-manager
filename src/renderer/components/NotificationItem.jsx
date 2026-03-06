import React from 'react'
import { TagBadge } from './TagBadge'
import { clsx } from 'clsx'
import { formatNotificationType } from '../../shared/formatNotificationType.js'

export function NotificationItem({ notification, isSelected, onToggle }) {
  const { id, title, url, tags, lastUpdatedAt, isUnread, optionalList } = notification
  const repo = optionalList?.nameWithOwner ?? 'unknown'
  const time = new Date(lastUpdatedAt).toLocaleString()

  const handleOpen = () => {
    globalThis.api.openExternal(url)
    if (isUnread) globalThis.api.markAsRead([id])
  }

  return (
    <tr>
      <td className="w-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={isSelected}
          onChange={onToggle}
        />
      </td>

      <td className="w-full">
        <span className={clsx('status', isUnread && 'status-warning', !isUnread && 'invisible')} />
        {url && (
          <button
            className={clsx(
              'btn btn-link text-left font-normal',
              isUnread ? 'text-primary' : 'text-gray-400'
            )}
            type="button"
            onClick={handleOpen}
          >
            {title}
          </button>
        )}
        {!url && <span>{title}</span>}
        <br />
        <small>{formatNotificationType(notification)}</small>
      </td>

      <td className="w-40">
        <small>{repo}</small>
      </td>

      <td className="w-full">
        {tags.map((tag) => (
          <TagBadge key={tag} tag={tag} active />
        ))}
      </td>

      <td className="w-40">
        <small>{time}</small>
      </td>
    </tr>
  )
}
