import React from 'react'
import SettingsIcon from '../../assets/icons/settings.svg?react'
import { Button } from '../Button'
import { PopoverCard } from './PopoverCard'

export function SettingsMenu({ onChangeToken, onRefresh, onTestNotification }) {
  const runActionAndClose = (action, close) => {
    action()
    close()
  }

  return (
    <PopoverCard
      popoverId="top-bar-filter-popover"
      anchorName="--top-bar-popover-anchor"
      className="w-60"
      trigger={
        <Button>
          <SettingsIcon className="fill-indigo-300 size-5" alt="Settings" />
        </Button>
      }
    >
      {({ close }) => (
        <div className="flex flex-col gap-2">
          <Button className="justify-start" onClick={() => runActionAndClose(onChangeToken, close)}>
            Change token
          </Button>
          <Button className="justify-start" onClick={() => runActionAndClose(onRefresh, close)}>
            Refresh
          </Button>
          <Button
            className="justify-start"
            onClick={() => runActionAndClose(onTestNotification, close)}
          >
            Test notification
          </Button>
        </div>
      )}
    </PopoverCard>
  )
}
