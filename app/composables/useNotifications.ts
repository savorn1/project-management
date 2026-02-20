import type { AppNotification } from '~/types'

// Shared state — singleton across all components
const notifications = ref<AppNotification[]>([])
const unreadCount = ref(0)
let listening = false

export function useNotifications() {
  const { notificationsApi } = useApi()
  const { user } = useAuth()
  const { joinRoom, on } = useSocket()
  const toast = useToast()

  async function loadNotifications() {
    const data = await notificationsApi.getAll()
    notifications.value = data
    unreadCount.value = data.filter(n => !n.isRead).length
  }

  function startListening() {
    if (listening || !user.value?.id) return
    listening = true

    // Join personal room to receive targeted notifications
    joinRoom(`user:${user.value.id}`)

    on<AppNotification>('notification:new', (incoming) => {
      notifications.value = [incoming, ...notifications.value]
      unreadCount.value++

      const icon = incoming.type === 'mentioned' ? '💬' : '📌'
      toast.info(`${icon} ${incoming.message}`)
    })
  }

  async function markRead(id: string) {
    await notificationsApi.markRead(id)
    const found = notifications.value.find(n => n._id === id)
    if (found && !found.isRead) {
      found.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    notifications.value.forEach(n => { n.isRead = true })
    unreadCount.value = 0
  }

  return {
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    loadNotifications,
    startListening,
    markRead,
    markAllRead,
  }
}
