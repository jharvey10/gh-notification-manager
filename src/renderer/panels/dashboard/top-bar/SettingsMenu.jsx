import PropTypes from 'prop-types'
import SettingsIcon from '../../../assets/icons/settings.svg?react'
import { Button } from '../../../components/Button.jsx'

export function SettingsMenu({ onOpenSettings }) {
  return (
    <Button tooltip="Settings" aria-label="Settings" onClick={onOpenSettings}>
      <SettingsIcon className="fill-primary size-5" />
    </Button>
  )
}

SettingsMenu.propTypes = {
  onOpenSettings: PropTypes.func.isRequired
}
