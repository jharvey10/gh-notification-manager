import React from 'react';
import { TagBadge } from './TagBadge';

export function FilterBar({ filters, allTags, onTextChange, onTagToggle, onUnreadToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Search notifications..."
        value={filters.text}
        onChange={(e) => onTextChange(e.target.value)}
        className="input input-bordered"
      />
      <label>
        <input
          type="checkbox"
          checked={filters.unreadOnly}
          onChange={onUnreadToggle}
        />
        {' '}Unread only
      </label>
      {allTags.length > 0 &&
        allTags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            active={filters.tags.has(tag)}
            onClick={() => onTagToggle(tag)}
          />
        ))
      }
    </div>
  );
}
