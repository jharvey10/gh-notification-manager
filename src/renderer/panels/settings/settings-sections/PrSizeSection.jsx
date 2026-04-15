import PropTypes from 'prop-types'
import { Button } from '../../../components/Button.jsx'
import { SETTINGS_LIMITS } from '../../../../shared/settings.js'
import { SettingsSection } from '../SettingsSection.jsx'

export function PrSizeSection({
  prSizeSmallMax,
  prSizeLargeMin,
  saving,
  dirty,
  onSmallMaxChange,
  onLargeMinChange,
  onSave
}) {
  return (
    <SettingsSection
      title="PR size labels"
      description="Configure the line-count thresholds for small, (medium), and large PR tags."
      actions={
        <Button disabled={!dirty || saving} onClick={onSave}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      }
    >
      <label className="form-control flex flex-col gap-2">
        <span className="text-sm font-medium">Small PR max (lines changed)</span>
        <input
          type="number"
          min={SETTINGS_LIMITS.minPrSize}
          max={SETTINGS_LIMITS.maxPrSize}
          className="input input-bordered w-full max-w-xs"
          value={prSizeSmallMax}
          onChange={(event) => onSmallMaxChange(event.target.value)}
        />
      </label>
      <label className="form-control flex flex-col gap-2">
        <span className="text-sm font-medium">Large PR min (lines changed)</span>
        <input
          type="number"
          min={SETTINGS_LIMITS.minPrSize}
          max={SETTINGS_LIMITS.maxPrSize}
          className="input input-bordered w-full max-w-xs"
          value={prSizeLargeMin}
          onChange={(event) => onLargeMinChange(event.target.value)}
        />
      </label>
    </SettingsSection>
  )
}

PrSizeSection.propTypes = {
  prSizeSmallMax: PropTypes.string.isRequired,
  prSizeLargeMin: PropTypes.string.isRequired,
  saving: PropTypes.bool.isRequired,
  dirty: PropTypes.bool.isRequired,
  onSmallMaxChange: PropTypes.func.isRequired,
  onLargeMinChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}
