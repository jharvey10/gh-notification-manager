import React from 'react'
import { FilterPopover } from './filter-popover/FilterPopover'

export function Filters({
  filters,
  allTags,
  allRepos,
  onTextChange,
  onTagToggle,
  onRepoToggle,
  onUnreadToggle,
  onClearTags,
  onClearRepos
}) {
  return (
    // center items vertically
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Search notifications..."
        value={filters.text}
        onChange={(e) => onTextChange(e.target.value)}
        className="input input-primary"
      />

      <label className="label cursor-pointer gap-2 rounded-box">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={filters.unreadOnly}
          onChange={onUnreadToggle}
        />
        <span className="label-text">Unread only</span>
      </label>

      {allTags.length > 0 && (
        <FilterPopover
          popoverId="tag-filter-popover"
          anchorName="--tag-filter-popover-anchor"
          triggerLabel="Tags"
          title="Tag filters"
          description="Use + to include or - to exclude a tag."
          items={allTags}
          includedItems={filters.includedTags}
          excludedItems={filters.excludedTags}
          onToggle={onTagToggle}
          onClear={onClearTags}
        />
      )}

      {allRepos.length > 0 && (
        <FilterPopover
          popoverId="repo-filter-popover"
          anchorName="--repo-filter-popover-anchor"
          triggerLabel="Repositories"
          title="Repository filters"
          description="Use + to include or - to exclude a repository."
          items={allRepos}
          includedItems={filters.includedRepos}
          excludedItems={filters.excludedRepos}
          onToggle={onRepoToggle}
          onClear={onClearRepos}
        />
      )}
    </div>
  )
}
