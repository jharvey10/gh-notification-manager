import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '../../../../components/Button'

export function UpdateStatus({ status, onCheck, onDownload, onInstall }) {
  switch (status.state) {
    case 'checking':
      return (
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-xs" />
          <span>Checking for updates…</span>
        </div>
      )

    case 'available':
      return (
        <div role="alert" className="alert alert-info alert-soft flex">
          <div className="flex-1">🎉 New version ({status.version}) is available!</div>
          <Button className="btn-sm" variant="info" onClick={onDownload}>
            Update
          </Button>
        </div>
      )

    case 'downloading':
      return (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-base-content/70">
            Downloading update… {Math.round(status.percent || 0)}%
          </div>
          <progress
            className="progress progress-primary w-full"
            value={status.percent || 0}
            max={100}
          />
        </div>
      )

    case 'downloaded':
      return (
        <div role="alert" className="alert alert-success alert-soft flex">
          <div className="flex-1">🚀 Version {status.version} is ready to install.</div>
          <Button className="btn-sm" variant="success" onClick={onInstall}>
            Restart Now
          </Button>
        </div>
      )

    case 'not-available':
      return null

    case 'error':
      return (
        <div role="alert" className="alert alert-error alert-soft flex">
          <div className="flex-1 text-sm">Update check failed: {status.message}</div>
          <Button className="btn-sm" variant="error" onClick={onCheck}>
            Retry
          </Button>
        </div>
      )

    default:
      return (
        <Button className="btn-sm" onClick={onCheck}>
          Check for Updates
        </Button>
      )
  }
}
UpdateStatus.propTypes = {
  status: PropTypes.shape({
    state: PropTypes.string.isRequired,
    version: PropTypes.string,
    percent: PropTypes.number,
    message: PropTypes.string
  }).isRequired,
  onCheck: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInstall: PropTypes.func.isRequired
}
