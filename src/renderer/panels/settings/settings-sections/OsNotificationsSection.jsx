import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { OS_NOTIFICATION_RULES } from '../../../../shared/settings.js'
import { SettingsSection } from '../SettingsSection'

export function OsNotificationsSection({
  settings,
  savingOsNotifications,
  dirty,
  onSettingChange,
  onSave,
  onTestNotification
}) {
  return (
    <SettingsSection
      title="OS notifications"
      description="Control which GitHub events trigger desktop notifications."
      actions={
        <>
          <Button disabled={!dirty || savingOsNotifications} onClick={onSave}>
            {savingOsNotifications ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={onTestNotification}>Test notification</Button>
        </>
      }
    >
      <label className="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-3">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={settings.osNotificationsEnabled}
          onChange={(e) => onSettingChange('osNotificationsEnabled', e.target.checked)}
        />
        <span className="label-text font-medium">Enable OS notifications</span>
      </label>

      <div className={`flex flex-col gap-2 pl-2 ${settings.osNotificationsEnabled ? '' : 'pointer-events-none opacity-40'}`}>
        {OS_NOTIFICATION_RULES.map(({ key, label, description }) => (
          <label key={key} className="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={settings[key]}
              disabled={!settings.osNotificationsEnabled}
              onChange={(e) => onSettingChange(key, e.target.checked)}
              aria-label={label}
            />
            <div className="flex flex-col">
              <span className="label-text text-sm">{label}</span>
              <span className="text-xs text-base-content/60">{description}</span>
            </div>
          </label>
        ))}
      </div>
    </SettingsSection>
  )
}

OsNotificationsSection.propTypes = {
  settings: PropTypes.shape({
    osNotificationsEnabled: PropTypes.bool.isRequired,
    osNotifyOnDirectMention: PropTypes.bool.isRequired,
    osNotifyOnDirectReviewRequest: PropTypes.bool.isRequired,
    osNotifyOnDirectAssignment: PropTypes.bool.isRequired,
    osNotifyOnSavedThreadActivity: PropTypes.bool.isRequired,
    osNotifyOnAllNew: PropTypes.bool.isRequired
  }).isRequired,
  savingOsNotifications: PropTypes.bool.isRequired,
  dirty: PropTypes.bool.isRequired,
  onSettingChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTestNotification: PropTypes.func.isRequired
}
