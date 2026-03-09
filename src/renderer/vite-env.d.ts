/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare global {
  var api: {
    getNotifications: () => Promise<unknown[]>
    onNotificationsUpdated: (callback: (data: unknown[]) => void) => () => void
    markAsDone: (threadIds: string[]) => Promise<void>
    markAsRead: (threadIds: string[]) => Promise<void>
    markAsUnread: (threadIds: string[]) => Promise<void>
    unsubscribe: (threadIds: string[]) => Promise<void>
    saveThread: (threadId: string) => Promise<void>
    unsaveThread: (threadId: string) => Promise<void>
    refreshNow: () => Promise<void>
    getSettings: () => Promise<Record<string, unknown>>
    updateSettings: (settings: Record<string, unknown>) => Promise<Record<string, unknown>>
    setToken: (token: string) => Promise<void>
    hasToken: () => Promise<boolean>
    clearToken: () => Promise<void>
    openExternal: (url: string) => Promise<void>
    testOsNotification: () => Promise<void>
  }
}

export {}
