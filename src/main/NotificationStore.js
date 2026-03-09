class NotificationStore {
  #notifications = new Map()
  #onChange

  constructor({ onChange }) {
    console.log('constructed new notification store')
    this.#onChange = onChange
  }

  upsert(entries) {
    console.log('upserting notifications')
    console.log('num deletes', entries.filter(([_, notification]) => notification === null).length)
    console.log('num upserts', entries.filter(([_, notification]) => notification !== null).length)

    for (const [id, notification] of entries) {
      if (notification === null) {
        this.#notifications.delete(id)
      } else {
        this.#notifications.set(id, notification)
      }
    }
    this.#onChange()
  }

  clear() {
    console.log('clearing notification store')

    this.#notifications.clear()
    this.#onChange()
  }

  getAll() {
    return Array.from(this.#notifications.values())
  }

  get(id) {
    return this.#notifications.get(id) ?? null
  }

  has(id) {
    return this.#notifications.has(id)
  }
}

export { NotificationStore }
