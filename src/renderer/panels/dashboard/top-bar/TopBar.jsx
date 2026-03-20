import React from 'react'
import PropTypes from 'prop-types'
import RenewIcon from '../../../assets/icons/renew.svg?react'
import { Button } from '../../../components/Button'
import { Filters } from './Filters'
import { SettingsMenu } from './SettingsMenu'

export const TopBar = ({
  notifications,
  filters,
  onTextChange,
  onBooleanChange,
  onTagChange,
  onRepoChange,
  onClearTags,
  onClearRepos,
  onRefresh,
  onOpenSettings
}) => {
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-3">
      <Filters
        notifications={notifications}
        filters={filters}
        onTextChange={onTextChange}
        onBooleanChange={onBooleanChange}
        onTagChange={onTagChange}
        onRepoChange={onRepoChange}
        onClearTags={onClearTags}
        onClearRepos={onClearRepos}
      />
      <div className="flex items-center gap-2">
        <Button tooltip="Refresh" aria-label="Refresh" onClick={onRefresh}>
          <RenewIcon className="fill-primary size-5" alt="Refresh" />
        </Button>
        <SettingsMenu onOpenSettings={onOpenSettings} />
      </div>
    </div>
  )
}

TopBar.propTypes = {
  notifications: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onBooleanChange: PropTypes.func.isRequired,
  onTagChange: PropTypes.func.isRequired,
  onRepoChange: PropTypes.func.isRequired,
  onClearTags: PropTypes.func.isRequired,
  onClearRepos: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired
}
