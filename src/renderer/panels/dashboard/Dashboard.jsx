import React from 'react'
import PropTypes from 'prop-types'
import { useFilters } from '../../hooks/useFilters'
import { useNotifications } from '../../hooks/useNotifications'
import { useSettings } from '../../hooks/useSettings'
import { useSelection } from '../../hooks/useSelection'
import { PanelState } from '../../utils/PanelState'
import { BatchActionBar } from './BatchActionBar'
import { TopBar } from './top-bar/TopBar'
import { NotificationListContainer } from './notification-list/NotificationListContainer'

export function Dashboard({ setPanelState }) {
  const { notifications, loading } = useNotifications()
  const { settings } = useSettings()
  const hasData = notifications !== null
  const {
    filters,
    setTextFilter,
    toggleTagFilter,
    toggleRepoFilter,
    toggleUnreadOnly,
    clearTagFilters,
    clearRepoFilters,
    allTags,
    allRepos,
    filtered
  } = useFilters(notifications)
  const { selected, toggle, selectAll, addToSelection, clearSelection } =
    useSelection(notifications)

  const handleMarkDone = async () => {
    if (selected.size === 0) return
    await globalThis.api.markAsDone([...selected])
    clearSelection()
  }

  const handleMarkRead = async () => {
    if (selected.size === 0) return
    await globalThis.api.markAsRead([...selected])
    clearSelection()
  }

  const handleMarkUnread = async () => {
    if (selected.size === 0) return
    await globalThis.api.markAsUnread([...selected])
    clearSelection()
  }

  const handleUnsubscribe = async () => {
    if (selected.size === 0) return
    await globalThis.api.unsubscribe([...selected])
    clearSelection()
  }

  const handleOpenSettings = () => {
    setPanelState(PanelState.SETTINGS)
  }

  const handleRefresh = () => {
    setPanelState(PanelState.LOADING)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-20 flex flex-col gap-4 bg-base-300 p-4 shadow-sm">
        <header>
          <TopBar
            filters={filters}
            allTags={allTags}
            allRepos={allRepos}
            onTextChange={setTextFilter}
            onTagToggle={toggleTagFilter}
            onRepoToggle={toggleRepoFilter}
            onUnreadToggle={toggleUnreadOnly}
            onClearTags={clearTagFilters}
            onClearRepos={clearRepoFilters}
            onRefresh={handleRefresh}
            onOpenSettings={handleOpenSettings}
          />
        </header>

        <BatchActionBar
          selectedCount={selected.size}
          onSelectAll={() => selectAll(filtered.map((n) => n.id))}
          onClearSelection={clearSelection}
          onMarkRead={handleMarkRead}
          onMarkUnread={handleMarkUnread}
          onUnsubscribe={handleUnsubscribe}
          onMarkDone={handleMarkDone}
        />
      </div>

      {(loading || !hasData) && <p>Loading...</p>}

      {!loading && hasData && (
        <NotificationListContainer
          notifications={filtered}
          olderThanDays={settings.olderThanDays}
          selected={selected}
          onToggle={toggle}
          onSelectGroup={addToSelection}
        />
      )}
    </div>
  )
}

Dashboard.propTypes = {
  setPanelState: PropTypes.func.isRequired
}
