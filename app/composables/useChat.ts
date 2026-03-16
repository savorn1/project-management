import type { ChatMessage, Conversation, MessageReminder, SavedReply, ScheduledMessage } from '~/types'
import type { ConversationUpdatedEvent } from '~/types/socketEvents'

// ── Singleton state ────────────────────────────────────────────────────────────
const conversations = ref<Conversation[]>([])
const activeConversationId = ref<string | null>(null)
const messages = ref<ChatMessage[]>([])
const totalUnread = ref(0)
const onlineUsers = ref<Set<string>>(new Set())
const lastSeenMap = ref<Map<string, number>>(new Map()) // userId → unix ms when they went offline
// Flat map keyed by `${conversationId}:${userId}` — avoids nested Map reactivity issues
const typingMap = ref<Map<string, { userName: string; timer: ReturnType<typeof setTimeout> }>>(new Map())
// First unread message ID when a conversation is opened (cleared on conversation switch)
const unreadSeparatorId = ref<string | null>(null)
// Starred message IDs for the active conversation
const starredIds = ref<Set<string>>(new Set())

// Custom user statuses — userId → { emoji, text }
const customStatusMap = ref<Map<string, { emoji: string; text: string }>>(new Map())

// Offline message queue — holds text-only messages sent while navigator.onLine === false
interface QueuedMessage { conversationId: string; content: string; replyTo?: string }
const offlineQueue = ref<QueuedMessage[]>([])
const networkOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

// Pagination state
const messagePage = ref(1)
const messageTotal = ref(0)
const messageHasMore = ref(false)
const messageLoadingMore = ref(false)

// When messages were loaded via an “around message” jump, we disable infinite-scroll pagination.
// (Pagination expects page-based “newest first” API, whereas “around” is a context window.)
const messageWindowMode = ref<'paged' | 'around'>('paged')

// Bidirectional cursors for “around” mode
const hasOlderMessages = ref(false)
const hasNewerMessages = ref(false)
const messageLoadingOlder = ref(false)
const messageLoadingNewer = ref(false)

// ── Scheduled messages, reminders, saved replies ───────────────────────────────
const scheduledMessages = ref<ScheduledMessage[]>([])
const reminders = ref<MessageReminder[]>([])
const savedReplies = ref<SavedReply[]>([])

let socketListenersRegistered = false

// Module-level set so deduplication works across all useChat() call sites
const joinedConversationRooms = new Set<string>()

export function useChat() {
  const { chatApi } = useApi()
  const { user } = useAuth()
  const { on, emit: socketEmit, joinRoom } = useSocket()
  const toast = useToast()

  // Join the conversation member room so the socket receives chat:message:new broadcasts.
  // Uses joinRoom() (tracked in pendingRooms) so rooms are automatically re-joined on reconnect.
  function joinConversationMemberRoom(conversationId: string) {
    if (!conversationId || joinedConversationRooms.has(conversationId)) return
    joinedConversationRooms.add(conversationId)
    joinRoom(`conversation:${conversationId}`)
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  const activeConversation = computed(() =>
    conversations.value.find((c) => c._id === activeConversationId.value) ?? null,
  )

  /** Names of users currently typing in the active conversation (excluding self) */
  const typingUsers = computed<string[]>(() => {
    if (!activeConversationId.value) return []
    const prefix = `${activeConversationId.value}:`
    const result: string[] = []
    for (const [key, entry] of typingMap.value) {
      if (key.startsWith(prefix)) {
        const userId = key.slice(prefix.length)
        if (userId !== user.value?.id) result.push(entry.userName)
      }
    }
    return result
  })

  /** Set of conversationIds where at least one other user is currently typing */
  const typingConvIds = computed<Set<string>>(() => {
    const result = new Set<string>()
    for (const key of typingMap.value.keys()) {
      const idx = key.indexOf(':')
      if (idx > 0) result.add(key.slice(0, idx))
    }
    return result
  })

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Merge a partial patch into a single conversation by id */
  function patchConversation(id: string, patch: Partial<Conversation>) {
    conversations.value = conversations.value.map((c) =>
      c._id === id ? { ...c, ...patch } : c,
    ) as Conversation[]
  }

  /**
   * Re-resolve private conversation display names using a fresh name map.
   * Call this after each incremental team page load to fix any "Unknown User" entries.
   */
  function resolvePrivateNames(nameMap: Map<string, string>, currentUserId: string) {
    conversations.value = conversations.value.map((conv) => {
      if (conv.type !== 'private') return conv
      const otherId = conv.participants.find((p) => p !== currentUserId)
      if (!otherId) return conv
      const name = nameMap.get(otherId)
      if (!name || conv.name === name) return conv
      return { ...conv, name }
    }) as Conversation[]
  }

  /** Sort conversations by most recent lastMessage, falling back to updatedAt */
  function sortConversations() {
    conversations.value = [...conversations.value].sort((a, b) => {
      const ta = a.lastMessage?.createdAt ?? a.updatedAt
      const tb = b.lastMessage?.createdAt ?? b.updatedAt
      return new Date(tb).getTime() - new Date(ta).getTime()
    })
  }

  /** Move a conversation to the top of the list (after new message) */
  function bumpConversation(id: string) {
    const idx = conversations.value.findIndex((c) => c._id === id)
    if (idx > 0) {
      const conv = conversations.value[idx]!
      conversations.value = [conv, ...conversations.value.filter((_, i) => i !== idx)]
    }
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
      type: msg.type,
      attachmentsCount: msg.attachments?.length ?? 0,
    }
  }

  /** Build a human-readable preview string from message fields */
  function buildPreview(
    type: string | undefined,
    content: string,
    attachmentsCount = 0,
  ): string {

    if (type === 'image') {
      if (attachmentsCount > 1) return `📷 ${attachmentsCount} Photos`
      return '📷 Photo'
    }
    if (type === 'file') {
      if (attachmentsCount > 1) return `📎 ${attachmentsCount} files already sent`
      return '📎 File already sent'
    }

    if (!content) return 'Message deleted'
    // Strip mention syntax: @[everyone] → @everyone, @[name](id) → @name
    // Strip markdown: ```block``` → block, `code` → code, **bold** → bold, *italic* → italic
    const plain = content
      .replace(/@\[everyone\]/g, '@everyone')
      .replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1')
      .replace(/```[\s\S]*?```/g, (m) => m.slice(3, -3).trim())
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')

    return plain.length > 40 ? plain.slice(0, 40) + '…' : plain
  }

  function recalculateUnreadCount() {
    totalUnread.value = conversations.value.reduce((sum, c) => sum + (c._unread ?? 0), 0)
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
    const { type, content, attachmentsCount } = conversation.lastMessage
    return buildPreview(type, content, attachmentsCount)
  }

  function isUnread(conversation: Conversation): boolean {
    return (conversation._unread ?? 0) > 0
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

  async function loadConversations() {
    const { teamApi } = useApi()
    const data = await chatApi.getConversations()

    // Seed _unread from the API-persisted unreadCount
    const seeded = data.map((item) => ({ ...item, _unread: item.unreadCount ?? 0 }))

    // Collect all unique participant IDs across private conversations
    // that don't already have a name resolved
    const currentId = user.value?.id
    if (currentId) {
      const unknownIds = new Set<string>()
      for (const conv of seeded) {
        if (conv.type !== 'private') continue
        const otherId = conv.participants.find((p) => p !== currentId)
        if (otherId) unknownIds.add(otherId)
      }

      if (unknownIds.size > 0) {
        const users = await teamApi.getByIds([...unknownIds])
        const nameMap = new Map(users.map((u) => [u._id, u.name]))
        conversations.value = seeded.map((item) => {
          if (item.type !== 'private') return item
          const otherId = item.participants.find((p) => p !== currentId)
          const name = otherId ? nameMap.get(otherId) : undefined
          return { ...item, name: name ?? item.name ?? 'Unknown User' }
        })
      } else {
        conversations.value = seeded
      }
    } else {
      conversations.value = seeded
    }

    sortConversations()
    recalculateUnreadCount()

    // Join conversation member rooms for scalable broadcasts
    for (const c of conversations.value) {
      joinConversationMemberRoom(c._id)
    }

    // Seed online users from presence endpoint
    const onlineIds = await chatApi.getPresence()
    onlineUsers.value = new Set(onlineIds)
  }

  async function selectConversation(id: string) {
    if (activeConversationId.value && activeConversationId.value !== id) {
      socketEmit('leaveConversationRoom', { conversationId: activeConversationId.value })
    }

    activeConversationId.value = id
    messages.value = []
    messagePage.value = 1
    messageTotal.value = 0
    messageHasMore.value = false
    messageLoadingMore.value = false
    messageWindowMode.value = 'paged'
    unreadSeparatorId.value = null
    starredIds.value = new Set()
    await loadMessages(id)

    socketEmit('joinConversationRoom', { conversationId: id })

    const selected = conversations.value.find((c) => c._id === id)

    // Set unread separator to the first message the user hasn't seen yet
    if (selected && (selected._unread ?? 0) > 0 && messages.value.length > 0) {
      const lastReadId = selected.lastReadMessageId
      if (lastReadId) {
        const lastReadIdx = messages.value.findIndex((m) => m._id === lastReadId)
        const firstUnread = lastReadIdx >= 0 ? messages.value[lastReadIdx + 1] : messages.value[0]
        unreadSeparatorId.value = firstUnread?._id ?? null
      } else {
        unreadSeparatorId.value = messages.value[0]?._id ?? null
      }
    }

    // Seed starred IDs for this conversation (fire-and-forget)
    chatApi.getStarredMessages().then((starred) => {
      starredIds.value = new Set(starred.filter((s) => s.conversationId === id).map((s) => s.message._id))
    }).catch(() => { })

    if (selected?.lastMessage) {
      chatApi.markAsRead(id, selected.lastMessage.messageId).catch(() => { })
      patchConversation(id, { _unread: 0 })
      recalculateUnreadCount()
    }
  }

  async function loadMessages(conversationId: string, page = 1) {
    const { data, total } = await chatApi.getMessages(conversationId, page)
    messages.value = [...data].reverse()
    messagePage.value = 1
    messageTotal.value = total
    messageHasMore.value = messages.value.length < total
    messageWindowMode.value = 'paged'
  }

  /** Load a message context window around a specific messageId (for search → jump). */
  async function loadMessagesAround(conversationId: string, messageId: string, limit = 50): Promise<boolean> {
    const res = await chatApi.getMessagesAround(conversationId, messageId, limit)
    if (!res) return false
    messages.value = res.data
    messageTotal.value = res.total
    messageHasMore.value = false
    messageLoadingMore.value = false
    messageWindowMode.value = 'around'
    hasOlderMessages.value = res.hasOlder
    hasNewerMessages.value = res.hasNewer
    return true
  }

  /** Prepend older messages when scrolling up in "around" mode. */
  async function loadOlderMessages(): Promise<void> {
    if (!activeConversationId.value || !hasOlderMessages.value || messageLoadingOlder.value) return
    const oldest = messages.value[0]
    if (!oldest?.createdAt) return
    messageLoadingOlder.value = true
    try {
      const res = await chatApi.getMessages(activeConversationId.value, 1, 30, String(oldest.createdAt))
      if (res.data.length > 0) {
        messages.value = [...res.data, ...messages.value]
        hasOlderMessages.value = res.data.length >= 30
      } else {
        hasOlderMessages.value = false
      }
    } finally {
      messageLoadingOlder.value = false
    }
  }

  /** Append newer messages when scrolling down in "around" mode. */
  async function loadNewerMessages(): Promise<void> {
    if (!activeConversationId.value || !hasNewerMessages.value || messageLoadingNewer.value) return
    const newest = messages.value[messages.value.length - 1]
    if (!newest?.createdAt) return
    messageLoadingNewer.value = true
    try {
      const res = await chatApi.getMessages(activeConversationId.value, 1, 30, undefined, String(newest.createdAt))
      if (res.data.length > 0) {
        messages.value = [...messages.value, ...res.data]
        hasNewerMessages.value = res.data.length >= 30
      } else {
        hasNewerMessages.value = false
      }
      // Caught up to the latest messages — resume normal paged mode
      if (!hasNewerMessages.value) {
        messageWindowMode.value = 'paged'
        messagePage.value = 1
        messageHasMore.value = messages.value.length < messageTotal.value
      }
    } finally {
      messageLoadingNewer.value = false
    }
  }

  async function loadMoreMessages(): Promise<void> {
    if (!activeConversationId.value || !messageHasMore.value || messageLoadingMore.value) return
    if (messageWindowMode.value !== 'paged') return
    messageLoadingMore.value = true
    try {
      const nextPage = messagePage.value + 1
      const { data } = await chatApi.getMessages(activeConversationId.value, nextPage)
      if (data.length > 0) {
        messages.value = [...[...data].reverse(), ...messages.value]
        messagePage.value = nextPage
        messageHasMore.value = messages.value.length < messageTotal.value
      } else {
        messageHasMore.value = false
      }
    } finally {
      messageLoadingMore.value = false
    }
  }

  async function createPrivateConversation(participantId: string, participantName: string): Promise<string | null> {
    const created = await chatApi.createConversation({ type: 'private', participants: [participantId] })
    if (!created) return null
    if (!conversations.value.find((c) => c._id === created._id))
      conversations.value = [{ ...created, name: participantName }, ...conversations.value]
    joinConversationMemberRoom(created._id)
    return created._id
  }

  async function createGroupConversation(name: string, participantIds: string[]): Promise<string | null> {
    const created = await chatApi.createConversation({ type: 'group', participants: participantIds, name })
    if (!created) return null
    if (!conversations.value.find((c) => c._id === created._id))
      conversations.value = [created, ...conversations.value]
    joinConversationMemberRoom(created._id)
    return created._id
  }

  async function createBroadcastConversation(name: string, participantIds: string[]): Promise<string | null> {
    const created = await chatApi.createConversation({ type: 'broadcast', participants: participantIds, name })
    if (!created) return null
    if (!conversations.value.find((c) => c._id === created._id))
      conversations.value = [created, ...conversations.value]
    joinConversationMemberRoom(created._id)
    return created._id
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async function flushQueue() {
    if (!networkOnline.value || offlineQueue.value.length === 0) return
    const pending = [...offlineQueue.value]
    offlineQueue.value = []
    for (const item of pending) {
      await sendMessage(item.content, [], item.replyTo, item.conversationId)
    }
  }

  async function sendMessage(content: string, files: File[] = [], replyTo?: string, conversationId?: string): Promise<boolean> {
    const convId = conversationId ?? activeConversationId.value
    if (!convId) return false
    if (!content.trim() && files.length === 0) return false

    // Queue text-only messages when offline
    if (!networkOnline.value && files.length === 0 && content.trim()) {
      offlineQueue.value = [
        ...offlineQueue.value,
        { conversationId: convId, content: content.trim(), replyTo },
      ]
      toast.warning('You are offline — message queued and will send when reconnected.')
      return true
    }

    sendTyping(false)
    const tempId = `temp_${Date.now()}`
    const tempMsg: ChatMessage = {
      _id: tempId,
      conversationId: convId,
      senderId: user.value?.id ?? '',
      content: content.trim(),
      type: files.length > 0 ? (files[0]!.type.startsWith('image/') ? 'image' : 'file') : 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      readBy: [],
      reactions: [],
      isDeleted: false,
      _status: 'sending',
    }
    messages.value = [...messages.value, tempMsg]

    const msg = await chatApi.sendMessage(convId, content.trim(), replyTo, files)
    if (!msg) {
      messages.value = messages.value.filter((m) => m._id !== tempId)
      return false
    }

    messages.value = messages.value.map((m) =>
      m._id === tempId ? { ...msg, _status: 'sent' as const } : m,
    )
    patchConversation(convId, { lastMessage: toLastMessageSnapshot(msg) })
    return true
  }

  async function editMessage(messageId: string, content: string) {
    const updated = await chatApi.editMessage(messageId, content)
    if (updated) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, content: updated.content, editedAt: updated.editedAt } : m,
      )
    }
  }

  async function deleteMessage(messageId: string) {
    const ok = await chatApi.deleteMessage(messageId)
    if (ok) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
      )
      // Patch lastMessage snapshot so the conversation list preview updates immediately
      if (activeConversationId.value) {
        const conv = conversations.value.find((c) => c._id === activeConversationId.value)
        if (conv?.lastMessage?.messageId === messageId) {
          patchConversation(activeConversationId.value, {
            lastMessage: { ...conv.lastMessage, content: '', type: undefined },
          })
        }
      }
    }
  }

  async function toggleReaction(messageId: string, emoji: string) {
    const updated = await chatApi.toggleReaction(messageId, emoji)
    if (updated) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, reactions: updated.reactions ?? [] } : m,
      )
    }
  }

  async function pinMessage(conversationId: string, messageId: string) {
    await chatApi.pinMessage(conversationId, messageId)
  }

  async function unpinMessage(conversationId: string, messageId: string) {
    const updated = await chatApi.unpinMessage(conversationId, messageId)
    if (updated) {
      patchConversation(conversationId, { pinnedMessages: updated.pinnedMessages ?? [] })
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

  async function muteConversation(conversationId: string, mute: boolean): Promise<void> {
    await chatApi.muteConversation(conversationId, mute)
    patchConversation(conversationId, { muted: mute })
  }

  /** Manually flag a conversation as unread (sets _unread to at least 1) */
  function markConversationUnread(conversationId: string): void {
    const conv = conversations.value.find((c) => c._id === conversationId)
    if (!conv) return
    patchConversation(conversationId, { _unread: Math.max(1, conv._unread ?? 0) })
    recalculateUnreadCount()
  }

  /** Clear unread counts for all conversations (calls markAsRead for each with unread) */
  async function markAllConversationsRead(): Promise<void> {
    const toMark = conversations.value.filter((c) => (c._unread ?? 0) > 0)
    for (const conv of toMark) {
      if (conv.lastMessage?.messageId) {
        chatApi.markAsRead(conv._id, conv.lastMessage.messageId).catch(() => { })
      }
      patchConversation(conv._id, { _unread: 0 })
    }
    totalUnread.value = 0
  }

  async function setDisappearingMessages(conversationId: string, enabled: boolean, ttl: number) {
    await chatApi.setDisappearingMessages(conversationId, enabled, ttl)
    // optimistic — socket will also fire and confirm
    conversations.value = conversations.value.map((c) =>
      c._id === conversationId ? { ...c, disappearingMessages: { enabled, ttl } } : c,
    ) as Conversation[]
  }

  async function updateGroupAvatar(conversationId: string, avatar: string): Promise<boolean> {
    const updated = await chatApi.updateGroup(conversationId, { avatar })
    if (updated) patchConversation(conversationId, { avatar: updated.avatar })
    return !!updated
  }

  async function setSlowMode(conversationId: string, enabled: boolean, delay: number): Promise<void> {
    await chatApi.setSlowMode(conversationId, enabled, delay)
    patchConversation(conversationId, { slowMode: { enabled, delay } })
  }

  const archivedConversations = ref<Conversation[]>([])

  async function loadArchivedConversations() {
    archivedConversations.value = await chatApi.getArchivedConversations() as unknown as Conversation[]
  }

  async function archiveConversation(conversationId: string, archive: boolean) {
    await chatApi.archiveConversation(conversationId, archive)
    if (archive) {
      // Remove from active list
      const conv = conversations.value.find((c) => c._id === conversationId)
      conversations.value = conversations.value.filter((c) => c._id !== conversationId)
      if (conv) archivedConversations.value = [{ ...conv, archived: true }, ...archivedConversations.value]
      if (activeConversationId.value === conversationId) activeConversationId.value = null
    } else {
      // Move back to active list
      const conv = archivedConversations.value.find((c) => c._id === conversationId)
      archivedConversations.value = archivedConversations.value.filter((c) => c._id !== conversationId)
      if (conv) conversations.value = [{ ...conv, archived: false }, ...conversations.value]
    }
  }

  async function votePoll(messageId: string, optionIndexes: number[]) {
    const updated = await chatApi.votePoll(messageId, optionIndexes)
    if (updated?.poll) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, poll: updated.poll } : m,
      ) as ChatMessage[]
    }
  }

  function setMyStatus(emoji: string, text: string) {
    socketEmit('user:setStatus', { emoji, text })
    // Optimistic local update
    if (user.value?.id) {
      const next = new Map(customStatusMap.value)
      next.set(user.value.id, { emoji, text })
      customStatusMap.value = next
    }
  }

  async function starMessage(messageId: string): Promise<void> {
    await chatApi.starMessage(messageId)
    starredIds.value = new Set([...starredIds.value, messageId])
  }

  async function unstarMessage(messageId: string): Promise<void> {
    await chatApi.unstarMessage(messageId)
    const next = new Set(starredIds.value)
    next.delete(messageId)
    starredIds.value = next
  }

  async function loadMentions(limit = 50) {
    return chatApi.getMentions(limit)
  }

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
    const isActive = msg.conversationId === activeConversationId.value
    const isFromSelf = msg.senderId === user.value?.id
    const found = conversations.value.find((c) => c._id === msg.conversationId)
    const convName = found ? conversationName(found) : 'Chat'
    const isMuted = found?.muted ?? false

    if (isActive) {
      // When switching to room-based fanout, the sender will also receive their own message.
      // Deduplicate so we don't double-insert (temp message already exists).
      const exists = messages.value.some((m) => m._id === msg._id)
      messages.value = exists ? messages.value : [...messages.value, msg]
      // Delivery ack: as soon as we receive the message on this client, mark it delivered.
      // (Skip own messages.)
      if (!isFromSelf) {
        chatApi.markAsDelivered(msg.conversationId, msg._id).catch(() => { })
      }
      chatApi.markAsRead(msg.conversationId, msg._id).catch(() => { })
    } else {
      const preview = buildPreview(msg.type, msg.content, msg.attachments?.length)
      if (!isMuted) {
        // When the tab is hidden, use a browser OS notification (avoids a duplicate toast on return).
        // When the tab is visible, fall back to an in-app toast.
        if (!isFromSelf && document.hidden && Notification.permission === 'granted') {
          const n = new Notification(convName, { body: preview, icon: '/favicon.ico' })
          n.onclick = () => { window.focus(); n.close() }
        } else {
          toast.info(`💬 ${convName}: ${preview}`)
        }
      }
      totalUnread.value++
      patchConversation(msg.conversationId, { _unread: (found?._unread ?? 0) + 1 })
    }

    // Notification sound — plays for all incoming (non-self, non-muted) messages
    if (!isFromSelf && !isMuted) {
      try {
        const AudioCtx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.35)
        setTimeout(() => ctx.close(), 1000)
      } catch { /* AudioContext unavailable or user hasn't interacted yet */ }
    }

    patchConversation(msg.conversationId, { lastMessage: toLastMessageSnapshot(msg) })
    bumpConversation(msg.conversationId)

    // @mention notification (skip if muted, and only when tab is visible or active conv)
    const userName = user.value?.name ?? ''
    const isMentioned =
      msg.content.includes('@[everyone]') ||
      (userName && msg.content.includes(`@[${userName}]`))
    if (isMentioned && !isFromSelf && !isMuted && Notification.permission === 'granted' && (isActive || !document.hidden)) {
      const n = new Notification(`Mentioned in ${convName}`, {
        body: msg.content.replace(/@\[([^\]]+)\]\([^)]*\)/g, '@$1').replace(/@\[([^\]]+)\]/g, '@$1').slice(0, 100),
        icon: '/favicon.ico',
      })
      n.onclick = () => { window.focus(); n.close() }
    }
  }

  function onMessageEdited({ messageId, content, editedAt, editHistory }: { messageId: string; content: string; editedAt: string; editHistory?: { content: string; editedAt: string }[] }) {
    messages.value = messages.value.map((m) =>
      m._id === messageId ? { ...m, content, editedAt, editHistory } : m,
    )
  }

  function onMessageReadBy({ messageId, userId, readAt }: { conversationId: string; messageId: string; userId: string; readAt: string }) {
    messages.value = messages.value.map((m) => {
      if (m._id !== messageId) return m
      const already = (m.readBy ?? []).some((r) => r.userId === userId)
      if (already) return m
      return { ...m, readBy: [...(m.readBy ?? []), { userId, readAt }] }
    })
  }

  function onMessageDelivered({ messageId, userId, deliveredAt }: { conversationId: string; messageId: string; userId: string; deliveredAt: string }) {
    messages.value = messages.value.map((m) => {
      if (m._id !== messageId) return m
      const already = (m.deliveredTo ?? []).some((r) => r.userId === userId)
      if (already) return m
      return { ...m, deliveredTo: [...(m.deliveredTo ?? []), { userId, deliveredAt }] }
    })
  }

  function onMessageReaction({ messageId, reactions }: { messageId: string; reactions: import('~/types').MessageReaction[] }) {
    messages.value = messages.value.map((m) =>
      m._id === messageId ? { ...m, reactions } : m,
    )
  }

  function onMessagePinned({ conversationId, pinnedMessage }: { conversationId: string; pinnedMessage: import('~/types').PinnedMessage }) {
    const conv = conversations.value.find((c) => c._id === conversationId)
    if (!conv) return
    patchConversation(conversationId, {
      pinnedMessages: [...(conv.pinnedMessages ?? []), pinnedMessage],
    })
  }

  function onMessageUnpinned({ conversationId, messageId }: { conversationId: string; messageId: string }) {
    const conv = conversations.value.find((c) => c._id === conversationId)
    if (!conv) return
    patchConversation(conversationId, {
      pinnedMessages: (conv.pinnedMessages ?? []).filter((p) => p.messageId !== messageId),
    })
  }

  function onMessageDeleted({ messageId, conversationId }: { messageId: string; conversationId: string }) {
    // Update messages array only for the active conversation
    if (conversationId === activeConversationId.value) {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, content: '' } : m,
      )
    }
    // Always patch the conversation's lastMessage snapshot so the preview updates
    const conv = conversations.value.find((c) => c._id === conversationId)
    if (conv?.lastMessage?.messageId === messageId) {
      patchConversation(conversationId, {
        lastMessage: { ...conv.lastMessage, content: '', type: undefined },
      })
    }
  }

  function onConversationNew(incoming: Conversation) {
    if (conversations.value.find((c) => c._id === incoming._id)) return
    conversations.value = [incoming, ...conversations.value]
    joinConversationMemberRoom(incoming._id)
    toast.info(`💬 You've been added to a new conversation`)
  }

  function onConversationUpdated(data: ConversationUpdatedEvent) {
    patchConversation(data.conversationId, {
      name: data.name ?? undefined,
      avatar: data.avatar ?? undefined,
      admins: data.admins,
      updatedAt: data.updatedAt,
    })
    sortConversations()
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
    const key = `${conversationId}:${userId}`
    const current = new Map(typingMap.value)
    const existing = current.get(key)
    if (existing) clearTimeout(existing.timer)
    if (isTyping) {
      const timer = setTimeout(() => {
        const m = new Map(typingMap.value)
        m.delete(key)
        typingMap.value = m
      }, 4000)
      current.set(key, { userName, timer })
    } else {
      current.delete(key)
    }
    typingMap.value = current
  }

  function isOnline(userId: string): boolean {
    return onlineUsers.value.has(userId)
  }

  function getLastSeen(userId: string): string {
    if (onlineUsers.value.has(userId)) return 'Online'
    const ts = lastSeenMap.value.get(userId)
    if (!ts) return 'Offline'
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  function startListening() {
    if (socketListenersRegistered || !user.value?.id) return
    socketListenersRegistered = true
    joinRoom(`user:${user.value.id}`)

    // Request desktop notification permission for @mention alerts
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { })
    }

    on('chat:message:new', onNewMessage)
    on('chat:message:edited', onMessageEdited)
    on('chat:message:deleted', onMessageDeleted)
    on('chat:message:reaction', onMessageReaction)
    on('chat:message:readBy', onMessageReadBy)
    on('chat:message:delivered', onMessageDelivered)
    on('chat:message:pinned', onMessagePinned)
    on('chat:message:unpinned', onMessageUnpinned)
    on('chat:conversation:new', onConversationNew)
    on('chat:conversation:updated', onConversationUpdated)
    on('chat:member:added', onMemberAdded)
    on('chat:member:left', onMemberLeft)
    on('chat:member:removed', onMemberRemoved)
    on('chat:member:blocked', onMemberBlocked)
    on('chat:member:unblocked', onMemberUnblocked)
    on('chat:typing', onTyping)
    on('user:status', ({ userId, online }: { userId: string; online: boolean }) => {
      const next = new Set(onlineUsers.value)
      if (online) {
        next.add(userId)
      } else {
        next.delete(userId)
        const m = new Map(lastSeenMap.value)
        m.set(userId, Date.now())
        lastSeenMap.value = m
      }
      onlineUsers.value = next
    })

    on('user:customStatus', ({ userId, emoji, text }) => {
      const next = new Map(customStatusMap.value)
      next.set(userId, { emoji, text })
      customStatusMap.value = next
    })

    on('chat:conversation:disappearing', ({ conversationId, enabled, ttl }) => {
      conversations.value = conversations.value.map((c) =>
        c._id === conversationId ? { ...c, disappearingMessages: { enabled, ttl } } : c,
      ) as Conversation[]
    })

    on('chat:poll:updated', ({ messageId, poll }) => {
      messages.value = messages.value.map((m) =>
        m._id === messageId ? { ...m, poll } : m,
      ) as ChatMessage[]
    })

    // Track browser network state for offline queue
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        networkOnline.value = true
        flushQueue()
      })
      window.addEventListener('offline', () => {
        networkOnline.value = false
      })
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // State
    conversations: readonly(conversations),
    activeConversationId: readonly(activeConversationId),
    activeConversation,
    messages: readonly(messages),
    totalUnread: readonly(totalUnread),
    onlineUsers: readonly(onlineUsers),
    typingUsers,
    typingConvIds,
    messageHasMore: readonly(messageHasMore),
    messageLoadingMore: readonly(messageLoadingMore),
    messageWindowMode: readonly(messageWindowMode),
    hasOlderMessages: readonly(hasOlderMessages),
    hasNewerMessages: readonly(hasNewerMessages),
    messageLoadingOlder: readonly(messageLoadingOlder),
    messageLoadingNewer: readonly(messageLoadingNewer),
    unreadSeparatorId: readonly(unreadSeparatorId),
    starredIds: readonly(starredIds),
    networkOnline: readonly(networkOnline),
    offlineQueue: readonly(offlineQueue),
    customStatusMap: readonly(customStatusMap),

    // Conversation actions
    loadConversations,
    resolvePrivateNames,
    selectConversation,
    createPrivateConversation,
    createGroupConversation,
    createBroadcastConversation,

    // Message actions
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    pinMessage,
    unpinMessage,
    sendTyping,
    loadMoreMessages,
    loadMessagesAround,
    loadOlderMessages,
    loadNewerMessages,

    // Member actions
    leaveGroup,
    removeMember,
    blockMember,
    unblockMember,
    muteConversation,
    markConversationUnread,
    markAllConversationsRead,
    starMessage,
    unstarMessage,
    loadMentions,
    setMyStatus,
    setDisappearingMessages,
    updateGroupAvatar,
    setSlowMode,
    archiveConversation,
    loadArchivedConversations,
    archivedConversations: readonly(archivedConversations),
    votePoll,

    // Real-time
    startListening,

    // Scheduled messages
    scheduledMessages: readonly(scheduledMessages),
    async loadScheduledMessages() {
      scheduledMessages.value = await chatApi.getScheduledMessages()
    },
    async scheduleMessage(conversationId: string, data: { content: string; scheduledFor: string; type?: string; replyTo?: string }) {
      const msg = await chatApi.scheduleMessage(conversationId, data)
      if (msg) scheduledMessages.value.push(msg)
      return msg
    },
    async cancelScheduledMessage(id: string) {
      await chatApi.cancelScheduledMessage(id)
      scheduledMessages.value = scheduledMessages.value.filter(m => m._id !== id)
    },

    // Message reminders
    reminders: readonly(reminders),
    async loadReminders() {
      reminders.value = await chatApi.getReminders()
    },
    async setReminder(messageId: string, data: { remindAt: string; note?: string }) {
      const reminder = await chatApi.setReminder(messageId, data)
      if (reminder) reminders.value.push(reminder)
      return reminder
    },
    async cancelReminder(id: string) {
      await chatApi.cancelReminder(id)
      reminders.value = reminders.value.filter(r => r._id !== id)
    },
    async setStandaloneReminder(data: { note: string; remindAt: string }) {
      return chatApi.setStandaloneReminder(data)
    },

    // Saved replies
    savedReplies: readonly(savedReplies),
    async loadSavedReplies() {
      savedReplies.value = await chatApi.getSavedReplies()
    },
    async createSavedReply(data: { title: string; shortcut: string; content: string }) {
      const reply = await chatApi.createSavedReply(data)
      if (reply) savedReplies.value.push(reply)
      return reply
    },
    async updateSavedReply(id: string, data: { title?: string; shortcut?: string; content?: string }) {
      const updated = await chatApi.updateSavedReply(id, data)
      if (updated) {
        const idx = savedReplies.value.findIndex(r => r._id === id)
        if (idx !== -1) savedReplies.value[idx] = updated
      }
      return updated
    },
    async deleteSavedReply(id: string) {
      await chatApi.deleteSavedReply(id)
      savedReplies.value = savedReplies.value.filter(r => r._id !== id)
    },

    // Helpers
    conversationName,
    conversationInitials,
    isMyMessage,
    isUnread,
    isOnline,
    getLastSeen,
    formatTime,
    formatDate,
    lastMessagePreview,
    lastMessageTime,
  }
}
