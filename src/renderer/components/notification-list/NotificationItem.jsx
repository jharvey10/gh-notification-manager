import React from 'react'
import PropTypes from 'prop-types'
import { formatNotificationType } from '../../../shared/formatNotificationType.js'
import { Action } from '../actions-menu/Action.jsx'
import { ActionsMenu } from '../actions-menu/ActionsMenu.jsx'
import { UnreadMarker } from './UnreadMarker.jsx'
import { NotificationDetailsDialog } from './NotificationDetailsDialog.jsx'
import { NotificationTitle } from './NotificationTitle.jsx'
import { NotificationMetadata } from './NotificationMetadata.jsx'
import { Button } from '../Button.jsx'
import CheckmarkIcon from '../../assets/icons/checkmark.svg?react'
import EmailIcon from '../../assets/icons/email.svg?react'
import EmailNewIcon from '../../assets/icons/email-new.svg?react'
import NotificationOffIcon from '../../assets/icons/notification-off.svg?react'
import BookmarkAddIcon from '../../assets/icons/bookmark-add.svg?react'
import BookmarkFilledIcon from '../../assets/icons/bookmark-filled.svg?react'
import InformationSquareIcon from '../../assets/icons/information-square.svg?react'

function buildMenuId(id) {
  return id.replaceAll(/[^a-zA-Z0-9_-]/g, '-')
}

export function NotificationItem({ notification, isSelected, onToggle }) {
  const { id, title, url, tags, lastUpdatedAt, isUnread, isSaved, optionalList, optionalSubject } =
    notification
  const repo = optionalList?.nameWithOwner ?? 'unknown'
  const time = new Date(lastUpdatedAt).toLocaleString()
  const typeLabel = formatNotificationType(notification)
  const menuId = buildMenuId(id)
  const detailsDialogRef = React.useRef(null)
  const openerLogin = optionalSubject?.author?.login

  const handleOpen = () => {
    globalThis.api.openExternal(url)
    if (isUnread) globalThis.api.markAsRead([id])
  }

  const handleMarkRead = () => globalThis.api.markAsRead([id])
  const handleMarkUnread = () => globalThis.api.markAsUnread([id])
  const handleMarkDone = () => globalThis.api.markAsDone([id])
  const handleUnsubscribe = () => globalThis.api.unsubscribe([id])
  const handleSave = () => globalThis.api.saveThreads([id])
  const handleUnsave = () => globalThis.api.unsaveThreads([id])
  const handleShowDetails = () => detailsDialogRef.current?.showModal()

  return (
    <>
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
          <NotificationTitle
            title={title}
            url={url}
            isUnread={isUnread}
            isSaved={isSaved}
            onOpen={handleOpen}
          />
          <NotificationMetadata typeLabel={typeLabel} repo={repo} tags={tags} isUnread={isUnread} />
        </div>

        {/* Right */}
        <div className="shrink-0 flex gap-4 items-center">
          {openerLogin && (
            <div className="badge badge-info badge-sm badge-soft whitespace-nowrap">
              @{openerLogin}
            </div>
          )}
          <div className="whitespace-nowrap text-xs text-base-content/60">{time}</div>

          <Button onClick={handleMarkDone} aria-label={`Mark ${title} done`} title="Mark done">
            <CheckmarkIcon className="size-4 shrink-0 fill-current" />
          </Button>

          <ActionsMenu
            popoverId={`notification-menu-${menuId}`}
            anchorName={`--notification-menu-anchor-${menuId}`}
            trigger={<Button>⋯</Button>}
          >
            {isUnread && (
              <Action icon={EmailIcon} onSelect={handleMarkRead}>
                Mark read
              </Action>
            )}
            {!isUnread && (
              <Action icon={EmailNewIcon} onSelect={handleMarkUnread}>
                Mark unread
              </Action>
            )}

            <Action icon={NotificationOffIcon} onSelect={handleUnsubscribe}>
              Unsubscribe
            </Action>

            {isSaved && (
              <Action icon={BookmarkFilledIcon} onSelect={handleUnsave}>
                Unsave
              </Action>
            )}
            {!isSaved && (
              <Action icon={BookmarkAddIcon} onSelect={handleSave}>
                Save
              </Action>
            )}

            <Action icon={InformationSquareIcon} onSelect={handleShowDetails}>
              Details
            </Action>
          </ActionsMenu>
        </div>
      </div>

      <NotificationDetailsDialog
        dialogRef={detailsDialogRef}
        title={title}
        notification={notification}
      />
    </>
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
    isSaved: PropTypes.bool,
    optionalSubject: PropTypes.shape({
      author: PropTypes.shape({
        login: PropTypes.string
      })
    }),
    optionalList: PropTypes.shape({
      nameWithOwner: PropTypes.string
    })
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
}
