import { useState, useMemo, useCallback } from 'react';

export function useFilters(notifications) {
  const notificationList = useMemo(() => notifications ?? [], [notifications])
  const [text, setText] = useState('');
  const [activeTags, setActiveTags] = useState(new Set());
  const [unreadOnly, setUnreadOnly] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set(activeTags);
    for (const n of notificationList) {
      for (const t of n.tags || []) tagSet.add(t);
    }
    return [...tagSet].sort();
  }, [notificationList, activeTags]);

  const filtered = useMemo(() => {
    const lowerText = text.toLowerCase();
    return notificationList.filter((n) => {
      if (unreadOnly && !n.isUnread) return false;
      if (lowerText) {
        const haystack =
          `${n.title} ${n.optionalList?.nameWithOwner ?? ''}`.toLowerCase();
        if (!haystack.includes(lowerText)) return false;
      }
      if (activeTags.size > 0) {
        const hasTags = (n.tags || []).some((t) => activeTags.has(t));
        if (!hasTags) return false;
      }
      return true;
    });
  }, [notificationList, text, activeTags, unreadOnly]);

  const setTextFilter = useCallback((val) => setText(val), []);

  const toggleTagFilter = useCallback((tag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const toggleUnreadOnly = useCallback(() => setUnreadOnly((v) => !v), []);

  return {
    filters: { text, tags: activeTags, unreadOnly },
    setTextFilter,
    toggleTagFilter,
    toggleUnreadOnly,
    allTags,
    filtered,
  };
}
