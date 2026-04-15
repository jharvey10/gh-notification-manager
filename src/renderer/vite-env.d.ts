/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface UpdaterStatus {
  state: string
  version?: string
  error?: string
}

declare global {
  var api: {
    getNotifications: () => Promise<unknown[]>

    onNotificationsUpdated: (callback: (data: unknown[]) => void) => () => void

    onMainError: (callback: (data: { source: string; message: string }) => void) => () => void

    onBatchProgress: (
      callback: (data: { completed: number; total: number; reason: string } | null) => void
    ) => () => void

    markAsDone: (threadIds: string[]) => Promise<void>
    markAsRead: (threadIds: string[]) => Promise<void>
    markAsUnread: (threadIds: string[]) => Promise<void>
    unsubscribe: (threadIds: string[]) => Promise<void>
    saveThread: (threadId: string) => Promise<void>
    unsaveThread: (threadId: string) => Promise<void>

    resetAllData: () => Promise<void>

    getSettings: () => Promise<any>
    updateSettings: (settings: Record<string, unknown>) => Promise<any>

    getVersion: () => Promise<string>

    setToken: (token: string) => Promise<void>
    hasToken: () => Promise<boolean>
    hasValidToken: () => Promise<boolean>
    clearToken: () => Promise<void>

    openExternal: (url: string) => Promise<void>

    testOsNotification: () => Promise<void>

    signalReady: () => void

    onUpdaterStatus: (callback: (data: UpdaterStatus) => void) => () => void
    getUpdaterStatus: () => Promise<UpdaterStatus>
    checkForUpdates: () => Promise<void>
    downloadUpdate: () => Promise<void>
    installUpdate: () => Promise<void>
  }
}

export {}
