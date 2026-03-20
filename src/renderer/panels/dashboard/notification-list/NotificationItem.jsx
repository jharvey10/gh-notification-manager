import React from 'react'
import PropTypes from 'prop-types'
import { Action } from '../actions-menu/Action.jsx'
import { ActionsMenu } from '../actions-menu/ActionsMenu.jsx'
import { UnreadMarker } from './UnreadMarker.jsx'
import { NotificationDetailsDialog } from './NotificationDetailsDialog.jsx'
import { NotificationTitle } from './NotificationTitle.jsx'
import { NotificationTags } from './NotificationTags.jsx'
import { Button } from '../../../components/Button.jsx'
import CheckmarkIcon from '../../../assets/icons/checkmark.svg?react'
import EmailIcon from '../../../assets/icons/email.svg?react'
import EmailNewIcon from '../../../assets/icons/email-new.svg?react'
import NotificationOffIcon from '../../../assets/icons/notification-off.svg?react'
import BookmarkAddIcon from '../../../assets/icons/bookmark-add.svg?react'
import BookmarkFilledIcon from '../../../assets/icons/bookmark-filled.svg?react'
import InformationSquareIcon from '../../../assets/icons/information-square.svg?react'
import { canUnsubscribeNotification } from '../../../../shared/notificationSubscription.js'
import { formatTimeAgo } from '../../../../shared/formatTimeAgo.js'
import { formatNotificationReference } from '../../../../shared/formatNotificationReference.js'
import { NotificationEventDetails } from './NotificationEventDetails.jsx'
import { getEventActor } from '../../../utils/notifications.js'

function buildMenuId(id) {
  return id.replaceAll(/[^a-zA-Z0-9_-]/g, '-')
}

export function NotificationItem({ notification, isSelected, onToggle }) {
  const { id, title, url, tags, activityLabel, lastUpdatedAt, isUnread, isSaved, optionalList } =
    notification
  const repo = optionalList?.nameWithOwner ?? 'unknown'
  const { label: timeLabel, tooltip: timeTooltip } = formatTimeAgo(lastUpdatedAt)
  const menuId = buildMenuId(id)
  const detailsDialogRef = React.useRef(null)
  const eventActor = getEventActor(notification)
  const canUnsubscribe = canUnsubscribeNotification(notification)
  const subjectRef = formatNotificationReference(notification)

  const handleOpen = (e) => {
    e.preventDefault()

    globalThis.api.openExternal(url)
    if (isUnread) {
      globalThis.api.markAsRead([id])
    }
  }

  const handleMarkRead = () => globalThis.api.markAsRead([id])
  const handleMarkUnread = () => globalThis.api.markAsUnread([id])
  const handleMarkDone = () => globalThis.api.markAsDone([id])
  const handleUnsubscribe = () => globalThis.api.unsubscribe([id])
  const handleSave = () => globalThis.api.saveThread(id)
  const handleUnsave = () => globalThis.api.unsaveThread(id)
  const handleShowDetails = () => detailsDialogRef.current?.showModal()

  return (
    <>
      <div className="flex flex-row items-center gap-4 rounded-xl border border-gray-700/30 p-2 pb-3">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={isSelected}
            onChange={onToggle}
          />

          <UnreadMarker isUnread={isUnread} />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <NotificationTitle
            title={title}
            url={url}
            isUnread={isUnread}
            isSaved={isSaved}
            onOpen={handleOpen}
            subjectRef={subjectRef}
          />
          <NotificationTags repo={repo} tags={tags} isUnread={isUnread} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NotificationEventDetails
            subjectRef={subjectRef}
            activityLabel={activityLabel}
            eventActor={eventActor}
          />

          <div
            className="tooltip tooltip-bottom whitespace-nowrap text-xs text-base-content/60"
            data-tip={timeTooltip}
          >
            {timeLabel}
          </div>

          <Button onClick={handleMarkDone} aria-label={`Mark ${title} done`} tooltip="Mark done">
            <CheckmarkIcon className="size-4 shrink-0 fill-current" />
          </Button>

          <Button
            onClick={handleUnsubscribe}
            aria-label={`Unsubscribe from ${title}`}
            tooltip="Unsubscribe"
            disabled={!canUnsubscribe}
          >
            <NotificationOffIcon className="size-4 shrink-0 fill-current" />
          </Button>

          <ActionsMenu
            popoverId={`notification-menu-${menuId}`}
            anchorName={`--notification-menu-anchor-${menuId}`}
            trigger={<Button tooltip="Actions">⋯</Button>}
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
    activityLabel: PropTypes.string,
    lastUpdatedAt: PropTypes.string.isRequired,
    isUnread: PropTypes.bool.isRequired,
    isSaved: PropTypes.bool,
    _latestEvents: PropTypes.shape({
      curr: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          actor: PropTypes.string,
          timestamp: PropTypes.string.isRequired
        })
      )
    }),
    optionalSubject: PropTypes.shape({
      id: PropTypes.string,
      viewerSubscription: PropTypes.string,
      number: PropTypes.number,
      commit: PropTypes.shape({
        id: PropTypes.string,
        viewerSubscription: PropTypes.string
      }),
      tagName: PropTypes.string,
      tagCommit: PropTypes.shape({
        id: PropTypes.string,
        viewerSubscription: PropTypes.string
      })
    }),
    optionalList: PropTypes.shape({
      nameWithOwner: PropTypes.string
    })
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
}
