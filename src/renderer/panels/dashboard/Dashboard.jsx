import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useFilterState } from '../../hooks/useFilterState'
import { applyFilters } from '../../filters/pipeline'
import { useSettings } from '../../hooks/useSettings'
import { useSelection } from '../../hooks/useSelection'
import { canUnsubscribeNotification } from '../../../shared/notificationSubscription.js'
import { PanelState } from '../../utils/PanelState'
import { BatchActionBar } from './BatchActionBar'
import { TopBar } from './top-bar/TopBar'
import { NotificationListContainer } from './notification-list/NotificationListContainer'

export function Dashboard({ setPanelState, notifications, refresh }) {
  const { settings } = useSettings()
  const notificationList = useMemo(() => notifications ?? [], [notifications])

  const {
    filters,
    setTextFilter,
    setBooleanFilter,
    setTagFilter,
    setRepoFilter,
    clearTagFilter,
    clearRepoFilter
  } = useFilterState()

  const filtered = useMemo(
    () => applyFilters(notificationList, filters),
    [notificationList, filters]
  )

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
    const eligible = notificationList
      .filter((n) => selected.has(n.id) && canUnsubscribeNotification(n))
      .map((n) => n.id)
    if (eligible.length === 0) return
    await globalThis.api.unsubscribe(eligible)
    clearSelection()
  }

  const handleOpenSettings = () => {
    setPanelState(PanelState.SETTINGS)
  }

  const handleRefresh = () => {
    refresh()
    setPanelState(PanelState.LOADING)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-20 flex flex-col gap-4 bg-base-300 p-4 shadow-sm">
        <header>
          <TopBar
            notifications={notificationList}
            filters={filters}
            onTextChange={setTextFilter}
            onBooleanChange={setBooleanFilter}
            onTagChange={setTagFilter}
            onRepoChange={setRepoFilter}
            onClearTags={clearTagFilter}
            onClearRepos={clearRepoFilter}
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

      <NotificationListContainer
        notifications={filtered}
        olderThanDays={settings.olderThanDays}
        selected={selected}
        onToggle={toggle}
        onSelectGroup={addToSelection}
      />
    </div>
  )
}

Dashboard.propTypes = {
  setPanelState: PropTypes.func.isRequired,
  notifications: PropTypes.array.isRequired,
  refresh: PropTypes.func.isRequired
}
