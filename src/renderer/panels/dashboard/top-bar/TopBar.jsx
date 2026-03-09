import React from 'react'
import PropTypes from 'prop-types'
import RenewIcon from '../../../assets/icons/renew.svg?react'
import { Button } from '../../../components/Button'
import { Filters } from './Filters'
import { SettingsMenu } from './SettingsMenu'

export const TopBar = ({
  filters,
  allTags,
  allRepos,
  onTextChange,
  onTagToggle,
  onRepoToggle,
  onUnreadToggle,
  onClearTags,
  onClearRepos,
  onRefresh,
  onOpenSettings
}) => {
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-3">
      <Filters
        filters={filters}
        allTags={allTags}
        allRepos={allRepos}
        onTextChange={onTextChange}
        onTagToggle={onTagToggle}
        onRepoToggle={onRepoToggle}
        onUnreadToggle={onUnreadToggle}
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
  filters: PropTypes.shape({
    text: PropTypes.string.isRequired,
    unreadOnly: PropTypes.bool.isRequired,
    includedTags: PropTypes.instanceOf(Set).isRequired,
    excludedTags: PropTypes.instanceOf(Set).isRequired,
    includedRepos: PropTypes.instanceOf(Set).isRequired,
    excludedRepos: PropTypes.instanceOf(Set).isRequired
  }).isRequired,
  allTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  allRepos: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTextChange: PropTypes.func.isRequired,
  onTagToggle: PropTypes.func.isRequired,
  onRepoToggle: PropTypes.func.isRequired,
  onUnreadToggle: PropTypes.func.isRequired,
  onClearTags: PropTypes.func.isRequired,
  onClearRepos: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired
}
