import PropTypes from 'prop-types'
import { Button } from '../../../components/Button.jsx'
import { SettingsSection } from '../SettingsSection.jsx'

export function ResetDataSection({ resetting, onReset }) {
  const handleClick = () => {
    const confirmed = globalThis.confirm(
      'This will clear all local notification data, re-fetch everything from GitHub, and re-index. This is an expensive operation and may take several minutes. Continue?'
    )
    if (confirmed) {
      onReset()
    }
  }

  return (
    <SettingsSection
      title="Reset All Data"
      description="Clears all local notification data including read/unread state, saved items, and deleted items. Re-fetches and re-indexes everything from GitHub. This is expensive and will take a while."
    >
      <div>
        <Button onClick={handleClick} disabled={resetting}>
          {resetting ? 'Resetting…' : 'Reset All Data'}
        </Button>
      </div>
    </SettingsSection>
  )
}

ResetDataSection.propTypes = {
  resetting: PropTypes.bool.isRequired,
  onReset: PropTypes.func.isRequired
}
