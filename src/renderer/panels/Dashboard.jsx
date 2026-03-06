import React from 'react'
import { ActionBar } from '../components/ActionBar'
import { NotificationList } from '../components/NotificationList'
import { useFilters } from '../hooks/useFilters'
import { useNotifications } from '../hooks/useNotifications'
import { useSelection } from '../hooks/useSelection'
import { PanelState } from '../utils/PanelState'
import { TopBar } from '../components/top-bar/TopBar'

export function Dashboard({ setPanelState }) {
  const { notifications, loading } = useNotifications()
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

  const handleRefresh = () => {
    setPanelState(PanelState.LOADING)
  }

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

  const handleClearToken = async () => {
    await globalThis.api.clearToken()
    setPanelState(PanelState.TOKEN_PROMPT)
  }

  const handleTestNotification = () => {
    globalThis.api.testOsNotification()
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
            onChangeToken={handleClearToken}
            onRefresh={handleRefresh}
            onTestNotification={handleTestNotification}
          />
        </header>

        <ActionBar
          selectedCount={selected.size}
          onSelectAll={() => selectAll(filtered.map((n) => n.id))}
          onClearSelection={clearSelection}
          onMarkRead={handleMarkRead}
          onMarkDone={handleMarkDone}
        />
      </div>

      {(loading || !hasData) && <p>Loading...</p>}

      {!loading && hasData && (
        <NotificationList
          notifications={filtered}
          selected={selected}
          onToggle={toggle}
          onSelectRepo={addToSelection}
        />
      )}
    </div>
  )
}
