import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../../../components/Button'
import { SettingsSection } from '../SettingsSection'

const GITHUB_LATEST_RELEASE_API_URL =
  'https://api.github.com/repos/jharvey10/gh-notification-manager/releases/latest'
const GITHUB_RELEASES_URL = 'https://github.com/jharvey10/gh-notification-manager/releases'

export function VersionSection({ appVersion }) {
  const [latestVersion, setLatestVersion] = useState('')
  const [hasNewerVersion, setHasNewerVersion] = useState(false)

  useEffect(() => {
    if (!latestVersion || !appVersion) {
      return
    }

    setHasNewerVersion(latestVersion !== appVersion)
  }, [latestVersion, appVersion])

  useEffect(() => {
    if (!appVersion) {
      return undefined
    }

    const abortController = new AbortController()

    const loadLatestRelease = async () => {
      try {
        const response = await fetch(GITHUB_LATEST_RELEASE_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: abortController.signal
        })

        if (!response.ok) {
          return
        }

        const release = await response.json()
        if (release?.tag_name !== appVersion) {
          setLatestVersion(release.tag_name.replace('v', ''))
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        console.error('Failed to load latest release:', err)
      }
    }

    void loadLatestRelease()

    return () => {
      abortController.abort()
    }
  }, [appVersion])

  const handleDownloadLatest = () => {
    if (!latestVersion) {
      return
    }

    globalThis.api.openExternal(GITHUB_RELEASES_URL)
  }

  return (
    <SettingsSection title="Version" description={appVersion ? `${appVersion}` : 'Loading...'}>
      {hasNewerVersion && (
        <div role="alert" className="alert alert-info alert-soft flex">
          <div className="flex-1">🎉 New version ({latestVersion}) available on GitHub.</div>
          <Button className="btn-sm" variant="info" onClick={handleDownloadLatest}>
            Download
          </Button>
        </div>
      )}
    </SettingsSection>
  )
}

VersionSection.propTypes = {
  appVersion: PropTypes.string.isRequired
}
