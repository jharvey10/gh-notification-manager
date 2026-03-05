import React from 'react';
import { NotificationItem } from './NotificationItem';

const RECENT_COUNT = 10;

function groupByRepo(notifications) {
  const groups = new Map();
  for (const n of notifications) {
    const repo = n.optionalList?.nameWithOwner ?? 'unknown';
    if (!groups.has(repo)) groups.set(repo, []);
    groups.get(repo).push(n);
  }
  return groups;
}

function NotificationTable({ items, selected, onToggle }) {
  return (
    <table className="table table-zebra table-sm">
      <thead>
        <tr>
          <th></th>
          <th>Title</th>
          <th>Repo</th>
          <th>Tags</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {items.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            isSelected={selected.has(n.id)}
            onToggle={() => onToggle(n.id)}
          />
        ))}
      </tbody>
    </table>
  );
}

export function NotificationList({ notifications, selected, onToggle, onSelectRepo }) {
  if (notifications.length === 0) return <p>No notifications.</p>;

  const sorted = notifications.sort(
    (a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt)
  );
  const recent = sorted.slice(0, RECENT_COUNT);
  const rest = sorted.slice(RECENT_COUNT);
  const grouped = groupByRepo(rest);

  return (
    <div className="join join-vertical">
      <details key="newest" open className="join-item collapse collapse-arrow border border-base-300">
        <summary className="collapse-title flex gap-2 items-center">
          <span>Newest ({recent.length})</span>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSelectRepo(recent.map((n) => n.id));
            }}
          >
            Select All
          </button>
        </summary>
        <div className="collapse-content">
          <NotificationTable items={recent} selected={selected} onToggle={onToggle} />
        </div>
      </details>
      {[...grouped.entries()].map(([repo, items]) => (
        <details key={repo} open className="join-item collapse collapse-arrow border border-base-300">
          <summary className="collapse-title flex gap-2 items-center">
            <span>{repo} ({items.length})</span>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectRepo(items.map((n) => n.id));
              }}
            >
              Select All
            </button>
          </summary>
          <div className="collapse-content">
            <NotificationTable items={items} selected={selected} onToggle={onToggle} />
          </div>
        </details>
      ))}
    </div>
  );
}
