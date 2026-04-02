import { useState, useDeferredValue, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTagOptions } from '../../../hooks/useTagOptions'
import { useRepoOptions } from '../../../hooks/useRepoOptions'
import { FilterPopover } from './filter-popover/FilterPopover'

export function Filters({
  notifications,
  filters,
  onTextChange,
  onBooleanChange,
  onTagChange,
  onRepoChange,
  onClearTags,
  onClearRepos
}) {
  const [text, setText] = useState(filters.text.data)
  const deferredText = useDeferredValue(text)

  useEffect(() => {
    onTextChange(deferredText)
  }, [deferredText, onTextChange])

  useEffect(() => {
    setText(filters.text.data)
  }, [filters.text.data])

  const tags = useTagOptions(notifications, filters.tag.data)
  const repos = useRepoOptions(notifications, filters.repo.data)

  return (
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
          checked={filters.unreadOnly.data}
          onChange={(e) => onBooleanChange(e.target.checked)}
        />
        <span className="label-text">Unread only</span>
      </label>

      {tags.items.length > 0 && (
        <FilterPopover
          popoverId="tag-filter-popover"
          anchorName="--tag-filter-popover-anchor"
          triggerLabel="Tags"
          title="Tag filters"
          description="Use + to include or - to exclude a tag."
          items={tags.items}
          itemCounts={tags.counts}
          selections={filters.tag.data}
          onChange={onTagChange}
          onClear={onClearTags}
        />
      )}

      {repos.items.length > 0 && (
        <FilterPopover
          popoverId="repo-filter-popover"
          anchorName="--repo-filter-popover-anchor"
          triggerLabel="Repositories"
          title="Repository filters"
          description="Use + to include or - to exclude a repository."
          items={repos.items}
          itemCounts={repos.counts}
          selections={filters.repo.data}
          onChange={onRepoChange}
          onClear={onClearRepos}
        />
      )}
    </div>
  )
}

Filters.propTypes = {
  notifications: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onBooleanChange: PropTypes.func.isRequired,
  onTagChange: PropTypes.func.isRequired,
  onRepoChange: PropTypes.func.isRequired,
  onClearTags: PropTypes.func.isRequired,
  onClearRepos: PropTypes.func.isRequired
}
