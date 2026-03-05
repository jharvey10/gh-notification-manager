import React, { useRef } from 'react'
import SettingsIcon from '../assets/icons/settings.svg?react'

export const TopBar = ({ onChangeToken, onRefresh, onTestNotification }) => {
  const popoverRef = useRef(null)

  const runActionAndClose = (action) => {
    action()
    popoverRef.current?.hidePopover()
  }

  return (
    <div>
      {/* change top-bar-filter-popover and --anchor-1 names. Use unique names for each dropdown */}
      {/* For TSX uncomment the commented types below */}
      <button
        className="btn btn-primary btn-square"
        popoverTarget="top-bar-filter-popover"
        style={{ anchorName: '--top-bar-popover-anchor' }}
      >
        <SettingsIcon className="fill-primary-content size-5" alt="Settings" />
      </button>

      <ul
        className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
        popover="auto"
        id="top-bar-filter-popover"
        ref={popoverRef}
        style={{ positionAnchor: '--top-bar-popover-anchor' }}
      >
        <li>
          <button type="button" onClick={() => runActionAndClose(onChangeToken)}>
            Change token
          </button>
        </li>
        <li>
          <button type="button" onClick={() => runActionAndClose(onRefresh)}>
            Refresh
          </button>
        </li>
        <li>
          <button type="button" onClick={() => runActionAndClose(onTestNotification)}>
            Test notification
          </button>
        </li>
      </ul>
    </div>
  )
}
