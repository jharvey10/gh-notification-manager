import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { SettingsSection } from '../../SettingsSection.jsx'
import { UpdateStatus } from './UpdateStatus.jsx'

function shouldCheckForUpdates(status) {
  return status.state !== 'downloading' && status.state !== 'ready'
}

export function VersionSection({ appVersion }) {
  const [status, setStatus] = useState({ state: 'idle' })

  useEffect(() => {
    const cleanup = globalThis.api.onUpdaterStatus(setStatus)

    globalThis.api.getUpdaterStatus().then((currentStatus) => {
      setStatus(currentStatus)
      if (shouldCheckForUpdates(currentStatus)) {
        globalThis.api.checkForUpdates()
      }
    })

    return cleanup
  }, [])

  const handleDownload = useCallback(() => globalThis.api.downloadUpdate(), [])
  const handleInstall = useCallback(() => globalThis.api.installUpdate(), [])

  return (
    <SettingsSection title="Version" description={appVersion || 'Loading...'}>
      <UpdateStatus status={status} onDownload={handleDownload} onInstall={handleInstall} />
    </SettingsSection>
  )
}

VersionSection.propTypes = {
  appVersion: PropTypes.string.isRequired
}
