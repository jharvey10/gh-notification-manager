import { getRest } from './client.js'

const MAX_NOTIFICATIONS = 1000
export const PER_PAGE = 50
const DELETE_BATCH_SIZE = 20

export interface RestNotificationThread {
  threadId: string
  owner: string
  repo: string
  subjectType: string
  subjectNumber: number | null
  subjectUrl: string | null
  title: string
  reason: string
  updatedAt: string
  webUrl: string
}

export interface FetchResult {
  threads: RestNotificationThread[]
  pollInterval: number
}

function parseSubjectRef(subject: { type: string; url: string | null }) {
  const type = subject.type
  const apiUrl = subject.url || null
  let number: number | null = null

  if (apiUrl && (type === 'PullRequest' || type === 'Issue' || type === 'Discussion')) {
    const match = new RegExp(/\/(\d+)$/).exec(apiUrl)
    if (match) {
      number = Number.parseInt(match[1], 10)
    }
  }

  return { type, apiUrl, number }
}

function buildWebUrl(repoFullName: string, subjectType: string, subjectNumber: number | null) {
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

function mapThread(raw: any): RestNotificationThread {
  const repoFullName: string = raw.repository.full_name
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

function parsePollInterval(headers: Record<string, string> | undefined) {
  const raw = headers?.['x-poll-interval']
  if (raw) {
    const val = Number.parseInt(raw, 10)
    if (Number.isFinite(val) && val > 0) {
      return val * 1000
    }
  }
  return 60_000
}

function parseLinkNext(linkHeader: string | undefined | null): string | null {
  if (!linkHeader) {
    return null
  }
  const match = new RegExp(/<([^>]+)>;\s*rel="next"/).exec(linkHeader)
  return match ? match[1] : null
}

class GitHubRESTService {
  #lastModified: string | null = null

  /**
   * Fetch all notification threads updated since the given date.
   * Uses If-Modified-Since for 304 support across poll cycles.
   */
  async fetchNotifications({ since }: { since: string }): Promise<FetchResult> {
    const octokit = getRest()
    const headers: Record<string, string> = {}
    if (this.#lastModified) {
      headers['if-modified-since'] = this.#lastModified
    }

    let response
    try {
      const t0 = performance.now()
      response = await octokit.request('GET /notifications', {
        all: true,
        since,
        per_page: PER_PAGE,
        headers
      })
      console.debug(`[timing] REST GET /notifications: ${(performance.now() - t0).toFixed(0)}ms`)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 304) {
        const errWithResponse = err as { response?: { headers?: Record<string, string> } }
        return {
          threads: [],
          pollInterval: parsePollInterval(errWithResponse.response?.headers)
        }
      }
      throw err
    }

    const pollInterval = parsePollInterval(response.headers as Record<string, string>)

    if (response.headers['last-modified']) {
      this.#lastModified = response.headers['last-modified'] as string
    }

    const threads: RestNotificationThread[] = response.data.map(mapThread)

    let nextUrl = parseLinkNext(response.headers.link as string | undefined)
    let page = 2
    while (nextUrl && threads.length < MAX_NOTIFICATIONS) {
      const tp = performance.now()
      const next = await octokit.request(nextUrl)
      console.debug(
        `[timing] REST GET /notifications (page ${page}): ${(performance.now() - tp).toFixed(0)}ms`
      )
      if (next.headers['last-modified']) {
        this.#lastModified = next.headers['last-modified'] as string
      }

      for (const raw of next.data as unknown[]) {
        threads.push(mapThread(raw))
      }

      nextUrl = parseLinkNext(next.headers.link as string | undefined)
      page++
    }

    return { threads, pollInterval }
  }

  async deleteThreads(
    threadIds: string[],
    options?: {
      batchSize?: number
      onBatchDone?: (batch: string[]) => Promise<void> | void
    }
  ): Promise<void> {
    const octokit = getRest()
    const batchSize = options?.batchSize ?? DELETE_BATCH_SIZE

    for (let i = 0; i < threadIds.length; i += batchSize) {
      const batch = threadIds.slice(i, i + batchSize)
      const t0 = performance.now()
      await Promise.all(
        batch.map((id) =>
          octokit.request('DELETE /notifications/threads/{thread_id}', {
            thread_id: Number.parseInt(id, 10)
          })
        )
      )
      console.debug(
        `[timing] REST DELETE /notifications/threads (batch ${Math.floor(i / batchSize) + 1}, ${batch.length} threads): ${(performance.now() - t0).toFixed(0)}ms`
      )
      if (options?.onBatchDone) {
        await options.onBatchDone(batch)
      }
    }
  }

  resetLastModified(): void {
    this.#lastModified = null
  }
}

export { GitHubRESTService }
