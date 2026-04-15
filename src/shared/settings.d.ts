export interface Settings {
  osNotificationsEnabled: boolean
  osNotifyOnDirectMention: boolean
  osNotifyOnDirectReviewRequest: boolean
  osNotifyOnDirectAssignment: boolean
  osNotifyOnSavedThreadActivity: boolean
  osNotifyOnAllNew: boolean
  autoMarkDoneEnabled: boolean
  autoMarkDoneDays: number
  olderThanDays: number
  prSizeSmallMax: number
  prSizeLargeMin: number
}

export const DEFAULT_SETTINGS: Readonly<Settings>
export const SETTINGS_LIMITS: Readonly<{
  minDays: number
  maxDays: number
  minPrSize: number
  maxPrSize: number
}>
export const OS_NOTIFICATION_RULES: ReadonlyArray<{
  key: string
  label: string
  description: string
  defaultValue: boolean
}>
export const OS_NOTIFICATION_KEYS: readonly string[]
export function sanitizeSettings(settings?: Partial<Settings>, fallbackSettings?: Settings): Settings
export function pickOSSettings(source: Settings): Partial<Settings>
