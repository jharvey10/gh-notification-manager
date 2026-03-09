import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { SettingsSection } from '../SettingsSection'

export function OsNotificationsSection({
  osNotificationsEnabled,
  savingOsNotifications,
  onOsNotificationsEnabledChange,
  onSave,
  onTestNotification
}) {
  return (
    <SettingsSection
      title="OS notifications"
      description="Control whether desktop notifications are shown for qualifying GitHub notifications."
      actions={
        <>
          <Button disabled={savingOsNotifications} onClick={onSave}>
            {savingOsNotifications ? 'Saving...' : 'Save OS notifications'}
          </Button>
          <Button onClick={onTestNotification}>Test notification</Button>
        </>
      }
    >
      <label className="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-3">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={osNotificationsEnabled}
          onChange={(event) => onOsNotificationsEnabledChange(event.target.checked)}
        />
        <span className="label-text">Enable OS notifications</span>
      </label>
    </SettingsSection>
  )
}

OsNotificationsSection.propTypes = {
  osNotificationsEnabled: PropTypes.bool.isRequired,
  savingOsNotifications: PropTypes.bool.isRequired,
  onOsNotificationsEnabledChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTestNotification: PropTypes.func.isRequired
}
