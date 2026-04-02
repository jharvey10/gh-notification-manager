import { applyTextFilter } from './applyTextFilter.js'
import { applyTagFilter } from './applyTagFilter.js'
import { applyRepoFilter } from './applyRepoFilter.js'
import { applyUnreadFilter } from './applyUnreadFilter.js'

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
 * @param {import('./types.js').FilterSet} filters
 * @returns {any[]}
 */
export function applyFilters(notifications, filters) {
  return Object.values(filters).reduce((result, filter) => {
    const handler = handlers[filter.type]
    return handler ? handler(result, filter.data) : result
  }, notifications)
}
