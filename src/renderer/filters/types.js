/**
 * @typedef {'include' | 'exclude'} SelectionState
 *
 * @typedef {Object} FilterSelection
 * @property {string} value
 * @property {SelectionState} state
 *
 * @typedef {Object} TextFilterDef
 * @property {'text'} type
 * @property {string} data
 *
 * @typedef {Object} TagFilterDef
 * @property {'tag'} type
 * @property {FilterSelection[]} data
 *
 * @typedef {Object} RepoFilterDef
 * @property {'repo'} type
 * @property {FilterSelection[]} data
 *
 * @typedef {Object} UnreadFilterDef
 * @property {'unreadOnly'} type
 * @property {boolean} data
 *
 * @typedef {Object} FilterSet
 * @property {TextFilterDef} text
 * @property {TagFilterDef} tag
 * @property {RepoFilterDef} repo
 * @property {UnreadFilterDef} unreadOnly
 */
