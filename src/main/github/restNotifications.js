import { getRest } from './client.js'

const MAX_NOTIFICATIONS = 1000
const PER_PAGE = 50

/**
 * @typedef {{
 *   threadId: string,
 *   owner: string,
 *   repo: string,
 *   subjectType: string,
 *   subjectNumber: number | null,
 *   subjectUrl: string | null,
 *   title: string,
 *   reason: string,
 *   updatedAt: string,
 *   webUrl: string
 * }} RestNotificationThread
 *
 * @typedef {{
 *   threads: RestNotificationThread[],
 *   pollInterval: number,
 *   notModified: boolean
 * }} FetchResult
 */

let lastModified = null

function parseSubjectRef(subject) {
  const type = subject.type
  const apiUrl = subject.url || null
  let number = null

  if (apiUrl && (type === 'PullRequest' || type === 'Issue' || type === 'Discussion')) {
    const match = apiUrl.match(/\/(\d+)$/)
    if (match) {
      number = Number.parseInt(match[1], 10)
    }
  }

  return { type, apiUrl, number }
}

function buildWebUrl(repoFullName, subjectType, subjectNumber) {
  const base = `https://github.com/${repoFullName}`
  switch (subjectType) {
    case 'PullRequest':
      return subjectNumber ? `${base}/pull/${subjectNumber}` : base
    case 'Issue':
      return subjectNumber ? `${base}/issues/${subjectNumber}` : base
    case 'Discussion':
      return subjectNumber ? `${base}/discussions/${subjectNumber}` : base
    case 'Release':
      return `${base}/releases`
    case 'CheckSuite':
      return `${base}/actions`
    default:
      return base
  }
}

function mapThread(raw) {
  const repoFullName = raw.repository.full_name
  const [owner, repo] = repoFullName.split('/')
  const { type, apiUrl, number } = parseSubjectRef(raw.subject)

  return {
    threadId: String(raw.id),
    owner,
    repo,
    subjectType: type,
    subjectNumber: number,
    subjectUrl: apiUrl,
    title: raw.subject.title,
    reason: raw.reason,
    updatedAt: raw.updated_at,
    webUrl: buildWebUrl(repoFullName, type, number)
  }
}

/**
 * Fetch notification threads via REST with If-Modified-Since / 304 support.
 * @param {{ fullRefresh?: boolean }} options
 * @returns {Promise<FetchResult>}
 */
async function fetchNotificationThreads({ fullRefresh = false } = {}) {
  const octokit = getRest()
  const headers = {}
  if (lastModified && !fullRefresh) {
    headers['if-modified-since'] = lastModified
  }

  let response
  try {
    const t0 = performance.now()
    response = await octokit.request('GET /notifications', {
      all: false,
      per_page: PER_PAGE,
      headers
    })
    console.debug(`[timing] REST GET /notifications: ${(performance.now() - t0).toFixed(0)}ms`)
  } catch (err) {
    if (err.status === 304) {
      return {
        threads: [],
        pollInterval: parsePollInterval(err.response?.headers),
        notModified: true
      }
    }
    throw err
  }

  const pollInterval = parsePollInterval(response.headers)

  if (response.headers['last-modified']) {
    lastModified = response.headers['last-modified']
  }

  const threads = response.data.map(mapThread)

  if (!fullRefresh) {
    return { threads, pollInterval, notModified: false }
  }

  let nextUrl = parseLinkNext(response.headers.link)
  let page = 2
  while (nextUrl && threads.length < MAX_NOTIFICATIONS) {
    const tp = performance.now()
    const next = await octokit.request(nextUrl)
    console.debug(
      `[timing] REST GET /notifications (page ${page}): ${(performance.now() - tp).toFixed(0)}ms`
    )
    for (const raw of next.data) {
      threads.push(mapThread(raw))
    }
    if (next.headers['last-modified']) {
      lastModified = next.headers['last-modified']
    }
    nextUrl = parseLinkNext(next.headers.link)
    page++
  }

  return { threads, pollInterval, notModified: false }
}

/**
 * Fetch node_ids for subjects that can't be queried by number (Release, CheckSuite).
 * Fetches each subject.url via REST in parallel to obtain node_id.
 * @param {RestNotificationThread[]} threads
 * @returns {Promise<Map<string, string>>} threadId -> node_id
 */
async function fetchSubjectNodeIds(threads) {
  const needsNodeId = threads.filter(
    (t) => t.subjectUrl && (t.subjectType === 'Release' || t.subjectType === 'CheckSuite')
  )

  if (needsNodeId.length === 0) {
    return new Map()
  }

  const octokit = getRest()
  const results = new Map()

  const t0 = performance.now()
  const fetches = needsNodeId.map(async (thread) => {
    try {
      const t1 = performance.now()
      const resp = await octokit.request(`GET ${new URL(thread.subjectUrl).pathname}`)
      console.debug(
        `[timing] REST GET node_id (thread ${thread.threadId}): ${(performance.now() - t1).toFixed(0)}ms`
      )
      if (resp.data?.node_id) {
        results.set(thread.threadId, resp.data.node_id)
      }
    } catch (err) {
      console.warn(`Failed to fetch node_id for thread ${thread.threadId}: ${err.message}`)
    }
  })

  await Promise.all(fetches)
  console.debug(
    `[timing] REST fetchSubjectNodeIds (${needsNodeId.length} threads): ${(performance.now() - t0).toFixed(0)}ms total`
  )
  return results
}

function resetLastModified() {
  lastModified = null
}

function parsePollInterval(headers) {
  const raw = headers?.['x-poll-interval']
  if (raw) {
    const val = Number.parseInt(raw, 10)
    if (Number.isFinite(val) && val > 0) {
      return val * 1000
    }
  }
  return 60_000
}

function parseLinkNext(linkHeader) {
  if (!linkHeader) {
    return null
  }
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
  return match ? match[1] : null
}

export { fetchNotificationThreads, fetchSubjectNodeIds, resetLastModified }
