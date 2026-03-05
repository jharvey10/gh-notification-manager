import React from 'react';

export function ActionBar({ selectedCount, onSelectAll, onClearSelection, onMarkRead, onMarkDone }) {
  return (
    <div className="flex gap-2">
      <button className="btn btn-primary btn-sm" type="button" onClick={onSelectAll}>
        Select All
      </button>
      <button className="btn btn-primary btn-sm" type="button" onClick={onClearSelection}>Clear Selection</button>
      <button className="btn btn-primary btn-sm" type="button" onClick={onMarkRead} disabled={selectedCount === 0}>
        Mark Read ({selectedCount})
      </button>
      <button className="btn btn-primary btn-sm" type="button" onClick={onMarkDone} disabled={selectedCount === 0}>
        Mark Done ({selectedCount})
      </button>
    </div>
  );
}
