const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getNotifications: () => ipcRenderer.invoke('notifications:get'),

  onNotificationsUpdated: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('notifications:updated', handler)
    return () => ipcRenderer.removeListener('notifications:updated', handler)
  },

  markAsDone: (threadIds) => ipcRenderer.invoke('notifications:markDone', threadIds),

  markAsRead: (threadIds) => ipcRenderer.invoke('notifications:markRead', threadIds),

  refreshNow: () => ipcRenderer.invoke('notifications:refresh'),

  setToken: (token) => ipcRenderer.invoke('auth:setToken', token),

  hasToken: () => ipcRenderer.invoke('auth:hasToken'),

  clearToken: () => ipcRenderer.invoke('auth:clearToken'),

  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  testOsNotification: () => ipcRenderer.invoke('osnotification:test')
})
