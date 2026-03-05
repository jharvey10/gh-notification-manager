const { ipcMain, shell, Notification } = require('electron')
const store = require('./store')
const auth = require('./auth')
const { markThreadsAsDone, markThreadsAsRead } = require('./github/mutations')
const { start, stop, poll } = require('./poller')
const { resetClients } = require('./github/client')

function registerIpcHandlers({ onNotificationsChanged }) {
  ipcMain.handle('shell:openExternal', (_event, url) => {
    const parsed = new URL(url)
    if (parsed.hostname === 'github.com' && parsed.protocol === 'https:') {
      shell.openExternal(url)
    }
  })

  ipcMain.handle('notifications:get', () => {
    return store.getAll() // array or null
  })

  ipcMain.handle('notifications:markDone', async (_event, ids) => {
    await markThreadsAsDone(ids, (batch) => {
      for (const id of batch) store.remove(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:markRead', async (_event, ids) => {
    await markThreadsAsRead(ids, (batch) => {
      for (const id of batch) store.markRead(id)
      onNotificationsChanged()
    })
  })

  ipcMain.handle('notifications:refresh', async () => {
    stop()
    store.clear()
    onNotificationsChanged()
    await poll({ shouldNotify: false, onPollComplete: onNotificationsChanged })
    start({ onPollComplete: onNotificationsChanged })
  })

  ipcMain.handle('auth:hasToken', () => {
    return auth.hasToken()
  })

  ipcMain.handle('auth:setToken', (_event, token) => {
    auth.saveToken(token)
    resetClients()
  })

  ipcMain.handle('auth:clearToken', () => {
    auth.clearToken()
    store.clear()
    resetClients()
    onNotificationsChanged()
  })

  ipcMain.handle('osnotification:test', () => {
    new Notification({
      title: 'GH Notification Manager',
      body: 'This is a test notification from gh-notification-manager.'
    }).show()
  })
}

module.exports = { registerIpcHandlers }
