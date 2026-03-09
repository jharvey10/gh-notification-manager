import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { SettingsSection } from '../SettingsSection'

export function AuthTokenSection({ onChangeToken, onClearToken }) {
  return (
    <SettingsSection
      title="Auth token"
      description="Manage the stored GitHub authentication token used by the app."
      actions={
        <>
          <Button variant="warning" onClick={onChangeToken}>
            Change token
          </Button>
          <Button variant="error" onClick={onClearToken}>
            Clear token
          </Button>
        </>
      }
    >
      <p className="text-sm text-base-content/70">
        Changing or clearing the token removes the current token and opens the token prompt.
      </p>
    </SettingsSection>
  )
}

AuthTokenSection.propTypes = {
  onChangeToken: PropTypes.func.isRequired,
  onClearToken: PropTypes.func.isRequired
}
