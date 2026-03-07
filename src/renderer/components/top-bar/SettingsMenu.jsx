import React from 'react'
import PropTypes from 'prop-types'
import SettingsIcon from '../../assets/icons/settings.svg?react'
import { Button } from '../Button'
import { Action } from '../actions-menu/Action.jsx'
import { ActionsMenu } from '../actions-menu/ActionsMenu.jsx'

export function SettingsMenu({ onChangeToken, onRefresh, onTestNotification }) {
  return (
    <ActionsMenu
      popoverId="top-bar-filter-popover"
      anchorName="--top-bar-popover-anchor"
      className="w-60"
      trigger={
        <Button>
          <SettingsIcon className="fill-indigo-300 size-5" alt="Settings" />
        </Button>
      }
    >
      <Action onSelect={onChangeToken}>
        Change token
      </Action>
      <Action onSelect={onRefresh}>
        Refresh
      </Action>
      <Action onSelect={onTestNotification}>
        Test notification
      </Action>
    </ActionsMenu>
  )
}

SettingsMenu.propTypes = {
  onChangeToken: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onTestNotification: PropTypes.func.isRequired
}
