import PropTypes from 'prop-types'
import { Button } from '../../../../components/Button.jsx'

export function UpdateStatus({ status, onDownload, onInstall }) {
  switch (status.state) {
    case 'available':
      return (
        <div role="alert" className="alert alert-info alert-soft flex">
          <div className="flex-1">A new version ({status.version}) is available.</div>
          <Button className="btn-sm" variant="info" onClick={onDownload}>
            Update
          </Button>
        </div>
      )

    case 'downloading':
      return (
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <span className="loading loading-spinner loading-xs" />
          <span>Downloading update…</span>
        </div>
      )

    case 'ready':
      return (
        <div role="alert" className="alert alert-success alert-soft flex">
          <div className="flex-1">Update installed. Restart to finish updating.</div>
          <Button className="btn-sm" variant="success" onClick={onInstall}>
            Restart Now
          </Button>
        </div>
      )

    default:
      return null
  }
}

UpdateStatus.propTypes = {
  status: PropTypes.shape({
    state: PropTypes.string.isRequired,
    version: PropTypes.string
  }).isRequired,
  onDownload: PropTypes.func.isRequired,
  onInstall: PropTypes.func.isRequired
}
