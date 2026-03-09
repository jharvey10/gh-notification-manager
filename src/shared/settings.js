const DEFAULT_SETTINGS = Object.freeze({
  osNotificationsEnabled: true,
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

function sanitizeSettings(settings = {}, fallbackSettings = DEFAULT_SETTINGS) {
  return {
    osNotificationsEnabled:
      typeof settings.osNotificationsEnabled === 'boolean'
        ? settings.osNotificationsEnabled
        : fallbackSettings.osNotificationsEnabled,
    autoMarkDoneEnabled:
      typeof settings.autoMarkDoneEnabled === 'boolean'
        ? settings.autoMarkDoneEnabled
        : fallbackSettings.autoMarkDoneEnabled,
    autoMarkDoneDays: sanitizeDayCount(settings.autoMarkDoneDays, fallbackSettings.autoMarkDoneDays),
    olderThanDays: sanitizeDayCount(settings.olderThanDays, fallbackSettings.olderThanDays)
  }
}

export { DEFAULT_SETTINGS, SETTINGS_LIMITS, sanitizeSettings }
