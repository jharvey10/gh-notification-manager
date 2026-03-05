import React from 'react'
import { ActionBar } from '../components/ActionBar'
import { FilterBar } from '../components/FilterBar'
import { NotificationList } from '../components/NotificationList'
import { TopBar } from '../components/TopBar'
import { useFilters } from '../hooks/useFilters'
import { useNotifications } from '../hooks/useNotifications'
import { useSelection } from '../hooks/useSelection'
import { PanelState } from '../utils/PanelState'

export function Dashboard({ setPanelState }) {
  const { notifications, loading } = useNotifications()
  const hasData = notifications !== null
  const { filters, setTextFilter, toggleTagFilter, toggleUnreadOnly, allTags, filtered } =
    useFilters(notifications)
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
    <div className="flex flex-col gap-4 m-4">
      <header>
        <TopBar
          onChangeToken={handleClearToken}
          onRefresh={handleRefresh}
          onTestNotification={handleTestNotification}
        />
      </header>
      <FilterBar
        filters={filters}
        allTags={allTags}
        onTextChange={setTextFilter}
        onTagToggle={toggleTagFilter}
        onUnreadToggle={toggleUnreadOnly}
      />
      <ActionBar
        selectedCount={selected.size}
        onSelectAll={() => selectAll(filtered.map((n) => n.id))}
        onClearSelection={clearSelection}
        onMarkRead={handleMarkRead}
        onMarkDone={handleMarkDone}
      />
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
