import { applyTextFilter } from './applyTextFilter'
import { applyTagFilter } from './applyTagFilter'
import { applyRepoFilter } from './applyRepoFilter'
import { applyUnreadFilter } from './applyUnreadFilter'

/** @type {Record<string, (notifications: any[], data: any) => any[]>} */
const handlers = {
  text: applyTextFilter,
  tag: applyTagFilter,
  repo: applyRepoFilter,
  unreadOnly: applyUnreadFilter
}

/**
 * Applies all filters in the set sequentially (AND logic).
 * @param {any[]} notifications
 * @param {import('./types').FilterSet} filters
 * @returns {any[]}
 */
export function applyFilters(notifications, filters) {
  return Object.values(filters).reduce((result, filter) => {
    const handler = handlers[filter.type]
    return handler ? handler(result, filter.data) : result
  }, notifications)
}
