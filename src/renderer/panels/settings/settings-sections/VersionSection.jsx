import React from 'react'
import PropTypes from 'prop-types'
import { SettingsSection } from '../SettingsSection'

export function VersionSection({ appVersion }) {
  return (
    <SettingsSection title="Version" description={appVersion ? `v${appVersion}` : 'Loading...'} />
  )
}

VersionSection.propTypes = {
  appVersion: PropTypes.string.isRequired
}
