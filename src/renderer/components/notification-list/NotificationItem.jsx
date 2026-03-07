import React from 'react'
import PropTypes from 'prop-types'
import { formatNotificationType } from '../../../shared/formatNotificationType.js'
import { Action } from '../actions-menu/Action.jsx'
import { ActionsMenu } from '../actions-menu/ActionsMenu.jsx'
import { UnreadMarker } from './UnreadMarker.jsx'
import { NotificationTitle } from './NotificationTitle.jsx'
import { NotificationMetadata } from './NotificationMetadata.jsx'
import { Button } from '../Button.jsx'

const STUB_ACTION = () => {}

function buildMenuId(id) {
  return id.replaceAll(/[^a-zA-Z0-9_-]/g, '-')
}

export function NotificationItem({ notification, isSelected, onToggle }) {
  const { id, title, url, tags, lastUpdatedAt, isUnread, optionalList } = notification
  const repo = optionalList?.nameWithOwner ?? 'unknown'
  const time = new Date(lastUpdatedAt).toLocaleString()
  const typeLabel = formatNotificationType(notification)
  const menuId = buildMenuId(id)

  const handleOpen = () => {
    globalThis.api.openExternal(url)
    if (isUnread) globalThis.api.markAsRead([id])
  }

  return (
    <div className="flex flex-row gap-4 p-2 pb-3 border border-gray-700/30 rounded-xl items-center">
      {/* Left */}
      <div className="flex gap-4 items-center">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={isSelected}
          onChange={onToggle}
        />

        <UnreadMarker isUnread={isUnread} />
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col gap-2">
        <NotificationTitle title={title} url={url} isUnread={isUnread} onOpen={handleOpen} />
        <NotificationMetadata typeLabel={typeLabel} repo={repo} tags={tags} isUnread={isUnread} />
      </div>

      {/* Right */}
      <div className="shrink-0 flex gap-4 items-center">
        <div className="whitespace-nowrap text-xs text-base-content/60">{time}</div>

        <ActionsMenu
          popoverId={`notification-menu-${menuId}`}
          anchorName={`--notification-menu-anchor-${menuId}`}
          trigger={<Button>Actions</Button>}
        >
          <Action onSelect={STUB_ACTION}>Mark read</Action>
          <Action onSelect={STUB_ACTION}>Mark unread</Action>
          <Action onSelect={STUB_ACTION}>Unsubscribe</Action>
          <Action onSelect={STUB_ACTION}>Star</Action>
          <Action onSelect={STUB_ACTION}>Details</Action>
        </ActionsMenu>
      </div>
    </div>
  )
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    lastUpdatedAt: PropTypes.string.isRequired,
    isUnread: PropTypes.bool.isRequired,
    optionalList: PropTypes.shape({
      nameWithOwner: PropTypes.string
    })
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
}
