import type { ChatMessage, Conversation, TeamMember } from '~/types'

// ── Singleton state ────────────────────────────────────────────────────────────
const conversations = ref<Conversation[]>([])
const activeConversationId = ref<string | null>(null)
const messages = ref<ChatMessage[]>([])
const totalUnread = ref(0)
const typingMap = ref<Map<string, { userId: string; userName: string; timer: ReturnType<typeof setTimeout> }>>(new Map())

let socketListenersRegistered = false

export function useChat() {
  const { chatApi } = useApi()
  const { user } = useAuth()
  const { on, emit: socketEmit, joinRoom } = useSocket()
  const toast = useToast()

  // ── Computed ──────────────────────────────────────────────────────────────

  const activeConversation = computed(() =>
    conversations.value.find((c) => c._id === activeConversationId.value) ?? null,
  )

  /** Names of users currently typing in the active conversation (excluding self) */
  const typingUsers = computed<string[]>(() => {
    if (!activeConversationId.value) return []
    const entry = typingMap.value.get(activeConversationId.value)
    if (!entry || entry.userId === user.value?.id) return []
    return [entry.userName]
  })

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Merge a partial patch into a single conversation by id */
  function patchConversation(id: string, patch: Partial<Conversation>) {
    conversations.value = conversations.value.map((c) =>
      c._id === id ? { ...c, ...patch } : c,
    ) as Conversation[]
  }

  /** Remove a conversation from the list and clear active state if needed */
  function dropConversation(id: string) {
    conversations.value = conversations.value.filter((c) => c._id !== id)
    if (activeConversationId.value === id) {
      activeConversationId.value = null
      messages.value = []
    }
  }

  /** Build a lastMessage snapshot object from a message */
  function toLastMessageSnapshot(msg: ChatMessage) {
    return {
      messageId: msg._id,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
    }
  }

  function recalcUnread() {
    totalUnread.value = conversations.value.filter(
      (c) => c.lastMessage && c.lastMessage.senderId !== user.value?.id,
    ).length
  }

  // ── Public helpers ────────────────────────────────────────────────────────

  function conversationName(conversation: Conversation): string {
    return conversation.name ?? 'Chat'
  }

  function conversationInitials(conversation: Conversation): string {
    const name = conversationName(conversation)
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
    return name.charAt(0).toUpperCase()
  }

  function isMyMessage(msg: ChatMessage): boolean {
    return msg.senderId === user.value?.id
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return d.toLocaleDateString([], { weekday: 'long' })
    return d.toLocaleDateString()
  }

  function lastMessagePreview(conversation: Conversation): string {
    if (!conversation.lastMessage) return 'No messages yet'
    if (!conversation.lastMessage.content) return 'Message deleted'
    const { content } = conversation.lastMessage
    return content.length > 40 ? content.slice(0, 40) + '…' : content
  }

  function lastMessageTime(conversation: Conversation): string {
    if (!conversation.lastMessage) return ''
    const diff = Date.now() - new Date(conversation.lastMessage.createdAt).getTime()
    const min = Math.floor(diff / 60_000)
    const hr = Math.floor(diff / 3_600_000)
    const day = Math.floor(diff / 86_400_000)
    if (min < 1) return 'now'
    if (min < 60) return `${min}m`
    if (hr < 24) return `${hr}h`
    if (day < 7) return `${day}d`
    return new Date(conversation.lastMessage.createdAt).toLocaleDateString()
  }

  // ── Conversations ─────────────────────────────────────────────────────────

  async function loadConversations(teamMembers?: TeamMember[]) {
    const data = await chatApi.getConversations()

    if (teamMembers && user.value) {
      const memberMap = new Map(teamMembers.map((m) => [m._id, m]))
      conversations.value = data.map((item) => {
        if (item.type !== 'private') return item
        const otherId = item.participants.find((p) => p !== user.value!.id)
        const other = otherId ? memberMap.get(otherId) : undefined
        return { ...item, name: other?.name ?? 'Unknown User' }
      })
    } else {
      conversations.value = data
    }

    recalcUnread()
  }

  async function selectConversation(id: string) {
    if (activeConversationId.value && activeConversationId.value !== id) {
      socketEmit('leaveConversationRoom', { conversationId: activeConversationId.value })
    }

    activeConversationId.value = id
    messages.value = []
    await loadMessages(id)

    socketEmit('joinConversationRoom', { conversationId: id })

    const selected = conversations.value.find((c) => c._id === id)
    if (selected?.lastMessage) {
      chatApi.markAsRead(id, selected.lastMessage.messageId).catch(() => { })
      patchConversation(id, { _unread: 0 } as Partial<Conversation>)
      recalcUnread()
    }
  }

  async function loadMessages(conversationId: string, page = 1) {
    const { data } = await chatApi.getMessages(conversationId, page)
    messages.value = [...data].reverse()
  }

  async function createPrivateConversation(participantId: string, participantName: string): Promise<string | null> {
    const created = await chatApi.createConversation({ type: 'private', participants: [participantId] })
    if (!created) return null
    if (!conversations.value.find((c) => c._id === created._id))
      conversations.value = [{ ...created, name: participantName }, ...conversations.value]
    return created._id
  }

  async function createGroupConversation(name: string, participantIds: string[]): Promise<string | null> {
    const created = await chatApi.createConversation({ type: 'group', participants: participantIds, name })
    if (!created) return null
    if (!conversations.value.find((c) => c._id === created._id))
      conversations.value = [created, ...conversations.value]
    return created._id
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async function sendMessage(content: string, files: File[] = [], replyTo?: string): Promise<boolean> {
    if (!activeConversationId.value) return false
    if (!content.trim() && files.length === 0) return false
    sendTyping(false)

    const msg = await chatApi.sendMessage(activeConversationId.value, content.trim(), replyTo, files)
    if (!msg) return false

    messages.value = [...messages.value, msg]
    patchConversation(activeConversationId.value, { lastMessage: toLastMessageSnapshot(msg) })
    return true
  }

  async function deleteMessage(messageId: string) {
    const ok = await chatApi.deleteMessage(messageId)
    if (ok) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
      )
    }
  }

  // ── Typing indicator ──────────────────────────────────────────────────────

  let typingTimeout: ReturnType<typeof setTimeout> | null = null
  let isCurrentlyTyping = false

  function sendTyping(isTyping: boolean) {
    const conversationId = activeConversationId.value
    if (!conversationId) return

    if (isTyping) {
      if (!isCurrentlyTyping) {
        isCurrentlyTyping = true
        socketEmit('chat:typing', { conversationId, isTyping: true })
      }
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        isCurrentlyTyping = false
        socketEmit('chat:typing', { conversationId, isTyping: false })
      }, 3000)
    } else {
      if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null }
      if (isCurrentlyTyping) {
        isCurrentlyTyping = false
        socketEmit('chat:typing', { conversationId, isTyping: false })
      }
    }
  }

  // ── Member management ─────────────────────────────────────────────────────

  async function leaveGroup(conversationId: string): Promise<boolean> {
    const ok = await chatApi.leaveGroup(conversationId)
    if (ok !== null) dropConversation(conversationId)
    return ok !== null
  }

  async function removeMember(conversationId: string, userId: string): Promise<boolean> {
    const updated = await chatApi.removeMember(conversationId, userId)
    if (updated) patchConversation(conversationId, { participants: updated.participants })
    return !!updated
  }

  async function blockMember(conversationId: string, userId: string): Promise<boolean> {
    const updated = await chatApi.blockMember(conversationId, userId)
    if (updated) patchConversation(conversationId, { blockedMembers: updated.blockedMembers })
    return !!updated
  }

  async function unblockMember(conversationId: string, userId: string): Promise<boolean> {
    const updated = await chatApi.unblockMember(conversationId, userId)
    if (updated) patchConversation(conversationId, { blockedMembers: updated.blockedMembers })
    return !!updated
  }

  // ── Socket event handlers ─────────────────────────────────────────────────

  function onNewMessage(msg: ChatMessage) {
    if (msg.conversationId === activeConversationId.value) {
      messages.value = [...messages.value, msg]
      chatApi.markAsRead(msg.conversationId, msg._id).catch(() => { })
    } else {
      const found = conversations.value.find((c) => c._id === msg.conversationId)
      const name = found ? conversationName(found) : 'Chat'
      const preview = msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content
      toast.info(`💬 ${name}: ${preview}`)
      totalUnread.value++
    }
    patchConversation(msg.conversationId, { lastMessage: toLastMessageSnapshot(msg) })
  }

  function onMessageDeleted({ messageId, conversationId }: { messageId: string; conversationId: string }) {
    if (conversationId !== activeConversationId.value) return
    messages.value = messages.value.map((m) =>
      m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
    )
  }

  function onConversationNew(incoming: Conversation) {
    if (conversations.value.find((c) => c._id === incoming._id)) return
    conversations.value = [incoming, ...conversations.value]
    toast.info(`💬 You've been added to a new conversation`)
  }

  function onMemberAdded({ conversationId, userIds }: { conversationId: string; userIds: string[] }) {
    const target = conversations.value.find((c) => c._id === conversationId)
    if (!target) return
    const merged = [...new Set([...target.participants, ...userIds])]
    patchConversation(conversationId, { participants: merged })
  }

  function onMemberLeft({ conversationId, userId }: { conversationId: string; userId: string }) {
    const target = conversations.value.find((c) => c._id === conversationId)
    if (!target) return
    patchConversation(conversationId, { participants: target.participants.filter((p) => p !== userId) })
  }

  function onMemberRemoved({ conversationId, userId }: { conversationId: string; userId: string }) {
    if (userId === user.value?.id) {
      dropConversation(conversationId)
      toast.info('You were removed from the group.')
    } else {
      onMemberLeft({ conversationId, userId })
    }
  }

  function onMemberBlocked({ conversationId, userId }: { conversationId: string; userId: string }) {
    const target = conversations.value.find((c) => c._id === conversationId)
    if (!target) return
    patchConversation(conversationId, { blockedMembers: [...(target.blockedMembers ?? []), userId] })
  }

  function onMemberUnblocked({ conversationId, userId }: { conversationId: string; userId: string }) {
    const target = conversations.value.find((c) => c._id === conversationId)
    if (!target) return
    patchConversation(conversationId, { blockedMembers: target.blockedMembers.filter((b) => b !== userId) })
  }

  function onTyping({ userId, userName, isTyping, conversationId }: {
    userId: string; userName: string; isTyping: boolean; conversationId: string
  }) {
    if (userId === user.value?.id) return
    const current = new Map(typingMap.value)
    const existing = current.get(conversationId)
    if (existing) clearTimeout(existing.timer)
    if (isTyping) {
      const timer = setTimeout(() => {
        const m = new Map(typingMap.value)
        m.delete(conversationId)
        typingMap.value = m
      }, 4000)
      current.set(conversationId, { userId, userName, timer })
    } else {
      current.delete(conversationId)
    }
    typingMap.value = current
  }

  function startListening() {
    if (socketListenersRegistered || !user.value?.id) return
    socketListenersRegistered = true
    joinRoom(`user:${user.value.id}`)

    on('chat:message:new', onNewMessage)
    on('chat:message:deleted', onMessageDeleted)
    on('chat:conversation:new', onConversationNew)
    on('chat:member:added', onMemberAdded)
    on('chat:member:left', onMemberLeft)
    on('chat:member:removed', onMemberRemoved)
    on('chat:member:blocked', onMemberBlocked)
    on('chat:member:unblocked', onMemberUnblocked)
    on('chat:typing', onTyping)
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // State
    conversations: readonly(conversations),
    activeConversationId: readonly(activeConversationId),
    activeConversation,
    messages: readonly(messages),
    totalUnread: readonly(totalUnread),
    typingUsers,

    // Conversation actions
    loadConversations,
    selectConversation,
    createPrivateConversation,
    createGroupConversation,

    // Message actions
    sendMessage,
    sendTyping,
    deleteMessage,

    // Member actions
    leaveGroup,
    removeMember,
    blockMember,
    unblockMember,

    // Real-time
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
