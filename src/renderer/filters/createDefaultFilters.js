/** @returns {import('./types.js').FilterSet} */
export function createDefaultFilters() {
  return {
    text: { type: 'text', data: '' },
    tag: { type: 'tag', data: [] },
    repo: { type: 'repo', data: [] },
    unreadOnly: { type: 'unreadOnly', data: false }
  }
}
