import React from 'react'
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
  onChangeToken,
  onRefresh,
  onTestNotification
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
      <SettingsMenu
        onChangeToken={onChangeToken}
        onRefresh={onRefresh}
        onTestNotification={onTestNotification}
      />
    </div>
  )
}
