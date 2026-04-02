import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { SETTINGS_LIMITS } from '../../../../shared/settings.js'
import { SettingsSection } from '../SettingsSection'

export function OlderSectionSettings({
  olderThanDays,
  savingOlderWindow,
  dirty,
  onOlderThanDaysChange,
  onSave
}) {
  return (
    <SettingsSection
      title="Older notifications"
      description={
        <span>
          Choose when notifications move into the collapsible <strong>Older</strong> section.
        </span>
      }
      actions={
        <Button disabled={!dirty || savingOlderWindow} onClick={onSave}>
          {savingOlderWindow ? 'Saving...' : 'Save'}
        </Button>
      }
    >
      <label className="form-control flex flex-col gap-2">
        <span className="text-sm font-medium">Age threshold (days)</span>
        <input
          type="number"
          min={SETTINGS_LIMITS.minDays}
          max={SETTINGS_LIMITS.maxDays}
          className="input input-bordered w-full max-w-xs"
          value={olderThanDays}
          onChange={(event) => onOlderThanDaysChange(event.target.value)}
        />
      </label>
    </SettingsSection>
  )
}

OlderSectionSettings.propTypes = {
  olderThanDays: PropTypes.string.isRequired,
  savingOlderWindow: PropTypes.bool.isRequired,
  dirty: PropTypes.bool.isRequired,
  onOlderThanDaysChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}
