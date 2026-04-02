import PropTypes from 'prop-types'
import { Button } from '../../../components/Button.jsx'
import { SettingsSection } from '../SettingsSection.jsx'

export function AuthTokenSection({ onClearToken }) {
  return (
    <SettingsSection
      title="Auth token"
      description="Manage the stored GitHub authentication token used by the app."
      actions={
        <Button variant="error" onClick={onClearToken}>
          Clear token
        </Button>
      }
    >
      <p className="text-sm text-base-content/70">
        Clearing the token removes the current token and opens the token prompt.
      </p>
    </SettingsSection>
  )
}

AuthTokenSection.propTypes = {
  onClearToken: PropTypes.func.isRequired
}
