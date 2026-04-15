import type { NotificationStore } from '../NotificationStore.js'
import { GitHubGraphQLService } from '../github/GitHubGraphQLService.js'
import { GitHubRESTService } from '../github/GitHubRESTService.js'
import type {
  GitHubNotificationSubject,
  GitHubRepositoryList,
  LocalNotificationData
} from '../github/queries/types.js'

export interface LatestEvent {
  type: string
  actor: string | null
  timestamp: string
  detail: string | null
}

export interface Notification {
  id: string
  title: string
  threadType: string
  url: string
  reason: string | null
  lastUpdatedAt: string
  optionalSubject: GitHubNotificationSubject | null
  optionalList: GitHubRepositoryList | null
  _localData: LocalNotificationData
  _nodeId?: string
  _latestEvents?: LatestEvent[]
  tags: string[]
  activityLabel?: string | null

  // REST metadata used by enrichers
  owner: string
  repo: string
  subjectNumber: number | null
  subjectUrl: string | null
}

export interface EnrichmentTarget {
  threadId: string
  owner: string
  repo: string
  subjectType: string
  subjectNumber: number | null
  subjectUrl?: string | null
  nodeId?: string
}

export interface PipelineContext {
  store: NotificationStore
  settings: Record<string, any>
  viewerLogin: string | null
  shouldNotify: boolean
  graphqlService: GitHubGraphQLService
  restService: GitHubRESTService
}

export interface BatchProcessor {
  process(batch: Notification[], context: PipelineContext): Promise<Notification[]>
}
