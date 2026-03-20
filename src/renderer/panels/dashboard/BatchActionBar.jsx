import React from 'react'
import PropTypes from 'prop-types'
import { clsx } from 'clsx'
import { Button } from '../../components/Button.jsx'
import { Action } from './actions-menu/Action.jsx'
import { ActionsMenu } from './actions-menu/ActionsMenu.jsx'
import CheckmarkIcon from '../../assets/icons/checkmark.svg?react'
import EmailIcon from '../../assets/icons/email.svg?react'
import EmailNewIcon from '../../assets/icons/email-new.svg?react'
import NotificationOffIcon from '../../assets/icons/notification-off.svg?react'

export function BatchActionBar({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onMarkRead,
  onMarkUnread,
  onUnsubscribe,
  onMarkDone
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      <div
        className={clsx(
          'flex items-center whitespace-nowrap text-sm',
          selectedCount > 0 ? 'text-base-content/70' : 'text-base-content/40'
        )}
      >
        {selectedCount} selected
      </div>

      <Button onClick={onSelectAll}>Select all</Button>

      <Button onClick={onClearSelection} disabled={selectedCount === 0} variant="secondary">
        Unselect all
      </Button>

      <Button
        onClick={onMarkDone}
        aria-label={`Mark all selected notifications as done`}
        tooltip="Mark done"
        disabled={selectedCount === 0}
      >
        <CheckmarkIcon className="size-4 shrink-0 fill-current" />
      </Button>

      <Button
        onClick={onUnsubscribe}
        aria-label={`Unsubscribe from all selected notifications`}
        tooltip="Unsubscribe"
        disabled={selectedCount === 0}
      >
        <NotificationOffIcon className="size-4 shrink-0 fill-current" />
      </Button>

      <ActionsMenu
        popoverId="batch-actions-menu"
        anchorName="--batch-actions-menu-anchor"
        trigger={
          <Button disabled={selectedCount === 0} tooltip="Actions">
            ⋯
          </Button>
        }
      >
        <Action icon={EmailIcon} onSelect={onMarkRead}>
          Mark read
        </Action>
        <Action icon={EmailNewIcon} onSelect={onMarkUnread}>
          Mark unread
        </Action>
      </ActionsMenu>
    </div>
  )
}

BatchActionBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  onMarkRead: PropTypes.func.isRequired,
  onMarkUnread: PropTypes.func.isRequired,
  onUnsubscribe: PropTypes.func.isRequired,
  onMarkDone: PropTypes.func.isRequired
}
