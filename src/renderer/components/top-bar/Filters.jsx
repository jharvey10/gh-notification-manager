import React, { useState, useDeferredValue, useEffect } from 'react'
import PropTypes from 'prop-types'
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
  const [text, setText] = useState(filters.text)
  const deferredText = useDeferredValue(text)

  useEffect(() => {
    onTextChange(deferredText)
  }, [deferredText, onTextChange])

  useEffect(() => {
    setText(filters.text)
  }, [filters.text])

  return (
    // center items vertically
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Search notifications..."
        value={text}
        onChange={(e) => setText(e.target.value)}
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

Filters.propTypes = {
  filters: PropTypes.shape({
    text: PropTypes.string.isRequired,
    includedTags: PropTypes.instanceOf(Set).isRequired,
    excludedTags: PropTypes.instanceOf(Set).isRequired,
    includedRepos: PropTypes.instanceOf(Set).isRequired,
    excludedRepos: PropTypes.instanceOf(Set).isRequired,
    unreadOnly: PropTypes.bool.isRequired
  }).isRequired,
  allTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  allRepos: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTextChange: PropTypes.func.isRequired,
  onTagToggle: PropTypes.func.isRequired,
  onRepoToggle: PropTypes.func.isRequired,
  onUnreadToggle: PropTypes.func.isRequired,
  onClearTags: PropTypes.func.isRequired,
  onClearRepos: PropTypes.func.isRequired
}
