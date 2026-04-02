import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { SETTINGS_LIMITS } from '../../../../shared/settings.js'
import { SettingsSection } from '../SettingsSection'

export function AutoDoneSection({
  autoMarkDoneEnabled,
  autoMarkDoneDays,
  savingAutoMarkDone,
  dirty,
  onAutoMarkDoneEnabledChange,
  onAutoMarkDoneDaysChange,
  onSave
}) {
  return (
    <SettingsSection
      title="Auto-done"
      description={
        <span>
          Automatically mark unsaved notifications as <strong>Done</strong> if they are older than
          the threshold.
        </span>
      }
      actions={
        <Button disabled={!dirty || savingAutoMarkDone} onClick={onSave}>
          {savingAutoMarkDone ? 'Saving...' : 'Save'}
        </Button>
      }
    >
      <label className="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-3">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={autoMarkDoneEnabled}
          onChange={(event) => onAutoMarkDoneEnabledChange(event.target.checked)}
        />
        <span className="label-text">Enable auto-done</span>
      </label>

      <label className="form-control flex flex-col gap-2">
        <span className="text-sm font-medium">Age threshold (days)</span>
        <input
          type="number"
          min={SETTINGS_LIMITS.minDays}
          max={SETTINGS_LIMITS.maxDays}
          className="input input-bordered w-full max-w-xs"
          disabled={!autoMarkDoneEnabled}
          value={autoMarkDoneDays}
          onChange={(event) => onAutoMarkDoneDaysChange(event.target.value)}
        />
      </label>
    </SettingsSection>
  )
}

AutoDoneSection.propTypes = {
  autoMarkDoneEnabled: PropTypes.bool.isRequired,
  autoMarkDoneDays: PropTypes.string.isRequired,
  savingAutoMarkDone: PropTypes.bool.isRequired,
  dirty: PropTypes.bool.isRequired,
  onAutoMarkDoneEnabledChange: PropTypes.func.isRequired,
  onAutoMarkDoneDaysChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}
