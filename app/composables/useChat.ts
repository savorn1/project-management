import type { ChatMessage, Conversation, TeamMember } from '~/types'

// ── Shared singleton state ────────────────────────────────────────────────────
const conversations = ref<Conversation[]>([])
const activeConversationId = ref<string | null>(null)
const messages = ref<ChatMessage[]>([])
const totalUnread = ref(0)

// typing: conversationId → { userId, userName, timer }
const typingMap = ref<Map<string, { userId: string; userName: string; timer: ReturnType<typeof setTimeout> }>>(new Map())

let socketListenersRegistered = false

export function useChat() {
  const { chatApi, teamApi } = useApi()
  const { user } = useAuth()
  const { on, emit: socketEmit, joinRoom } = useSocket()
  const toast = useToast()

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeConversation = computed(() =>
    conversations.value.find((c) => c._id === activeConversationId.value) ?? null,
  )

  /** Users currently typing in the active conversation (excluding self) */
  const typingUsers = computed<string[]>(() => {
    if (!activeConversationId.value) return []
    const entry = typingMap.value.get(activeConversationId.value)
    if (!entry) return []
    if (entry.userId === user.value?.id) return []
    return [entry.userName]
  })

  function conversationName(conv: Conversation): string {
    return conv.name ?? 'Chat'
  }

  function conversationInitials(conv: Conversation): string {
    const name = conversationName(conv)
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
    return name.charAt(0).toUpperCase()
  }

  // ── Load conversations ─────────────────────────────────────────────────────

  async function loadConversations(teamMembers?: TeamMember[]) {
    const data = await chatApi.getConversations()

    if (teamMembers && user.value) {
      const memberMap = new Map(teamMembers.map((m) => [m._id, m]))
      conversations.value = data.map((conv) => {
        if (conv.type === 'private') {
          const otherId = conv.participants.find((p) => p !== user.value!.id)
          const other = otherId ? memberMap.get(otherId) : undefined
          return { ...conv, name: other?.name ?? 'Unknown User' }
        }
        return conv
      })
    } else {
      conversations.value = data
    }

    recalcUnread()
  }

  function recalcUnread() {
    // Sum unread from conversations where lastMessage sender is not me
    totalUnread.value = conversations.value.filter(
      (c) => c.lastMessage && c.lastMessage.senderId !== user.value?.id,
    ).length
  }

  // ── Select conversation ────────────────────────────────────────────────────

  async function selectConversation(id: string) {
    // Leave previous conversation room
    if (activeConversationId.value && activeConversationId.value !== id) {
      socketEmit('leaveConversationRoom', { conversationId: activeConversationId.value })
    }

    activeConversationId.value = id
    messages.value = []
    await loadMessages(id)

    // Join conversation room for typing indicators
    socketEmit('joinConversationRoom', { conversationId: id })

    // Mark last message as read
    const conv = conversations.value.find((c) => c._id === id)
    if (conv?.lastMessage) {
      chatApi.markAsRead(id, conv.lastMessage.messageId).catch(() => {})
      // Reset unread state for this conversation locally
      conversations.value = conversations.value.map((c) =>
        c._id === id ? { ...c, _unread: 0 } : c,
      ) as Conversation[]
      recalcUnread()
    }
  }

  // ── Load messages ─────────────────────────────────────────────────────────

  async function loadMessages(conversationId: string, page = 1) {
    const { data } = await chatApi.getMessages(conversationId, page)
    messages.value = [...data].reverse()
  }

  // ── Send message ──────────────────────────────────────────────────────────

  async function sendMessage(content: string, replyTo?: string): Promise<boolean> {
    if (!activeConversationId.value || !content.trim()) return false

    // Stop typing indicator immediately
    sendTyping(false)

    const msg = await chatApi.sendMessage(activeConversationId.value, content.trim(), replyTo)
    if (msg) {
      messages.value = [...messages.value, msg]
      conversations.value = conversations.value.map((c) =>
        c._id === activeConversationId.value
          ? {
              ...c,
              lastMessage: {
                messageId: msg._id,
                senderId: msg.senderId,
                content: msg.content,
                createdAt: msg.createdAt,
              },
            }
          : c,
      )
      return true
    }
    return false
  }

  // ── Typing indicator ──────────────────────────────────────────────────────

  let typingTimeout: ReturnType<typeof setTimeout> | null = null
  let isCurrentlyTyping = false

  function sendTyping(isTyping: boolean) {
    if (!activeConversationId.value) return

    if (isTyping) {
      if (!isCurrentlyTyping) {
        isCurrentlyTyping = true
        socketEmit('chat:typing', { conversationId: activeConversationId.value, isTyping: true })
      }
      // Auto stop after 3s of no keystrokes
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        isCurrentlyTyping = false
        socketEmit('chat:typing', { conversationId: activeConversationId.value, isTyping: false })
      }, 3000)
    } else {
      if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null }
      if (isCurrentlyTyping) {
        isCurrentlyTyping = false
        socketEmit('chat:typing', { conversationId: activeConversationId.value, isTyping: false })
      }
    }
  }

  // ── Create conversation ────────────────────────────────────────────────────

  async function createPrivateConversation(participantId: string, participantName: string): Promise<string | null> {
    const conv = await chatApi.createConversation({ type: 'private', participants: [participantId] })
    if (!conv) return null
    const annotated = { ...conv, name: participantName }
    const exists = conversations.value.find((c) => c._id === conv._id)
    if (!exists) conversations.value = [annotated, ...conversations.value]
    return conv._id
  }

  async function createGroupConversation(name: string, participantIds: string[]): Promise<string | null> {
    const conv = await chatApi.createConversation({ type: 'group', participants: participantIds, name })
    if (!conv) return null
    const exists = conversations.value.find((c) => c._id === conv._id)
    if (!exists) conversations.value = [conv, ...conversations.value]
    return conv._id
  }

  // ── Delete message ────────────────────────────────────────────────────────

  async function deleteMessage(messageId: string) {
    const ok = await chatApi.deleteMessage(messageId)
    if (ok) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
      )
    }
  }

  // ── Real-time socket listeners ─────────────────────────────────────────────

  function startListening() {
    if (socketListenersRegistered || !user.value?.id) return
    socketListenersRegistered = true

    joinRoom(`user:${user.value.id}`)

    // ── New message from another participant ───────────────────────────────
    on<ChatMessage>('chat:message:new', (msg) => {
      const isActiveConv = msg.conversationId === activeConversationId.value

      if (isActiveConv) {
        // Append to open conversation and mark as read
        messages.value = [...messages.value, msg]
        chatApi.markAsRead(msg.conversationId, msg._id).catch(() => {})
      } else {
        // Toast notification for inactive conversations
        const conv = conversations.value.find((c) => c._id === msg.conversationId)
        const convName = conv ? conversationName(conv) : 'Chat'
        toast.info(`💬 ${convName}: ${msg.content.slice(0, 60)}${msg.content.length > 60 ? '…' : ''}`)
        totalUnread.value++
      }

      // Update lastMessage snapshot on conversation list
      conversations.value = conversations.value.map((c) =>
        c._id === msg.conversationId
          ? {
              ...c,
              lastMessage: {
                messageId: msg._id,
                senderId: msg.senderId,
                content: msg.content,
                createdAt: msg.createdAt,
              },
            }
          : c,
      )
    })

    // ── Message deleted ────────────────────────────────────────────────────
    on<{ messageId: string; conversationId: string }>('chat:message:deleted', ({ messageId, conversationId }) => {
      if (conversationId === activeConversationId.value) {
        messages.value = messages.value.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
        )
      }
    })

    // ── New conversation created by another user ───────────────────────────
    on<Conversation>('chat:conversation:new', (conv) => {
      const exists = conversations.value.find((c) => c._id === conv._id)
      if (!exists) {
        conversations.value = [conv, ...conversations.value]
        toast.info(`💬 You've been added to a new conversation`)
      }
    })

    // ── Typing indicator ───────────────────────────────────────────────────
    on<{ userId: string; userName: string; isTyping: boolean; conversationId: string }>(
      'chat:typing',
      ({ userId, userName, isTyping, conversationId }) => {
        if (userId === user.value?.id) return // ignore self

        const current = new Map(typingMap.value)
        if (isTyping) {
          // Clear previous timer for this user in this conv
          const existing = current.get(conversationId)
          if (existing) clearTimeout(existing.timer)

          const timer = setTimeout(() => {
            const m = new Map(typingMap.value)
            m.delete(conversationId)
            typingMap.value = m
          }, 4000)

          current.set(conversationId, { userId, userName, timer })
        } else {
          const existing = current.get(conversationId)
          if (existing) clearTimeout(existing.timer)
          current.delete(conversationId)
        }
        typingMap.value = current
      },
    )
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function isMyMessage(msg: ChatMessage): boolean {
    return msg.senderId === user.value?.id
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return d.toLocaleDateString([], { weekday: 'long' })
    return d.toLocaleDateString()
  }

  function lastMessagePreview(conv: Conversation): string {
    if (!conv.lastMessage) return 'No messages yet'
    if (conv.lastMessage.content === '') return 'Message deleted'
    return conv.lastMessage.content.length > 40
      ? conv.lastMessage.content.slice(0, 40) + '…'
      : conv.lastMessage.content
  }

  function lastMessageTime(conv: Conversation): string {
    if (!conv.lastMessage) return ''
    const diff = Date.now() - new Date(conv.lastMessage.createdAt).getTime()
    const min = Math.floor(diff / 60000)
    const hr = Math.floor(diff / 3600000)
    const day = Math.floor(diff / 86400000)
    if (min < 1) return 'now'
    if (min < 60) return `${min}m`
    if (hr < 24) return `${hr}h`
    if (day < 7) return `${day}d`
    return new Date(conv.lastMessage.createdAt).toLocaleDateString()
  }

  return {
    // State
    conversations: readonly(conversations),
    activeConversationId: readonly(activeConversationId),
    activeConversation,
    messages: readonly(messages),
    totalUnread: readonly(totalUnread),
    typingUsers,

    // Actions
    loadConversations,
    selectConversation,
    sendMessage,
    sendTyping,
    deleteMessage,
    createPrivateConversation,
    createGroupConversation,
    startListening,

    // Helpers
    conversationName,
    conversationInitials,
    isMyMessage,
    formatTime,
    formatDate,
    lastMessagePreview,
    lastMessageTime,
  }
}
