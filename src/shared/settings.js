const OS_NOTIFICATION_RULES = Object.freeze([
  {
    key: 'osNotifyOnDirectMention',
    label: 'Direct mentions',
    description: 'Notify when you are @mentioned',
    defaultValue: true
  },
  {
    key: 'osNotifyOnDirectReviewRequest',
    label: 'Review requests',
    description: 'Notify when you are requested as a reviewer',
    defaultValue: true
  },
  {
    key: 'osNotifyOnDirectAssignment',
    label: 'Assignments',
    description: 'Notify when you are assigned',
    defaultValue: true
  },
  {
    key: 'osNotifyOnSavedThreadActivity',
    label: 'Saved threads',
    description: 'Notify on any update to threads you have saved',
    defaultValue: false
  },
  {
    key: 'osNotifyOnAllNew',
    label: 'All activity',
    description: 'Notify on every new or updated notification',
    defaultValue: false
  }
])

const OS_NOTIFICATION_KEYS = Object.freeze([
  'osNotificationsEnabled',
  ...OS_NOTIFICATION_RULES.map((r) => r.key)
])

const DEFAULT_SETTINGS = Object.freeze({
  osNotificationsEnabled: true,
  ...Object.fromEntries(OS_NOTIFICATION_RULES.map((r) => [r.key, r.defaultValue])),
  autoMarkDoneEnabled: false,
  autoMarkDoneDays: 30,
  olderThanDays: 7
})

const SETTINGS_LIMITS = Object.freeze({
  minDays: 1,
  maxDays: 365
})

function sanitizeDayCount(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(SETTINGS_LIMITS.maxDays, Math.max(SETTINGS_LIMITS.minDays, parsed))
}

function sanitizeBool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

/** @returns {typeof DEFAULT_SETTINGS} */
function sanitizeSettings(settings = {}, fallbackSettings = DEFAULT_SETTINGS) {
  const sanitized = /** @type {any} */ ({ ...fallbackSettings })

  for (const key of OS_NOTIFICATION_KEYS) {
    sanitized[key] = sanitizeBool(settings[key], fallbackSettings[key])
  }

  sanitized.autoMarkDoneEnabled = sanitizeBool(
    settings.autoMarkDoneEnabled,
    fallbackSettings.autoMarkDoneEnabled
  )
  sanitized.autoMarkDoneDays = sanitizeDayCount(
    settings.autoMarkDoneDays,
    fallbackSettings.autoMarkDoneDays
  )
  sanitized.olderThanDays = sanitizeDayCount(settings.olderThanDays, fallbackSettings.olderThanDays)

  return sanitized
}

function pickOSSettings(source) {
  const result = {}
  for (const key of OS_NOTIFICATION_KEYS) {
    result[key] = source[key]
  }
  return result
}

export {
  DEFAULT_SETTINGS,
  SETTINGS_LIMITS,
  OS_NOTIFICATION_RULES,
  OS_NOTIFICATION_KEYS,
  sanitizeSettings,
  pickOSSettings
}
