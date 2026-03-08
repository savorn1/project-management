import type { AppNotification, ChatMessage, Conversation, FundPool, MessageReaction, PaymentConfirmedEvent, PinnedMessage, Project } from '~/types'

// ── Task event payload ─────────────────────────────────────────────────────────

export interface TaskEventPayload {
  type: string
  projectId: string
  taskId: string
  data: Record<string, unknown>
  userId: string
  clientId?: string
  timestamp: string
}

// ── Server → Client events ─────────────────────────────────────────────────────

export interface ServerToClientEvents {
  // Chat — messages
  'chat:message:new': (data: ChatMessage) => void
  'chat:message:edited': (data: { messageId: string; conversationId: string; content: string; editedAt: string }) => void
  'chat:message:deleted': (data: { messageId: string; conversationId: string }) => void
  'chat:message:reaction': (data: { messageId: string; conversationId: string; reactions: MessageReaction[] }) => void
  'chat:message:readBy': (data: { conversationId: string; messageId: string; userId: string; readAt: string }) => void
  'chat:message:delivered': (data: { conversationId: string; messageId: string; userId: string; deliveredAt: string }) => void
  'chat:message:pinned': (data: { conversationId: string; pinnedMessage: PinnedMessage }) => void
  'chat:message:unpinned': (data: { conversationId: string; messageId: string }) => void

  // Chat — conversations
  'chat:conversation:new': (data: Conversation) => void
  'chat:conversation:updated': (data: { conversationId: string; name: string | null; avatar: string | null; admins: string[]; updatedAt: string }) => void

  // Chat — members
  'chat:member:added': (data: { conversationId: string; userIds: string[] }) => void
  'chat:member:left': (data: { conversationId: string; userId: string }) => void
  'chat:member:removed': (data: { conversationId: string; userId: string }) => void
  'chat:member:blocked': (data: { conversationId: string; userId: string }) => void
  'chat:member:unblocked': (data: { conversationId: string; userId: string }) => void

  // Chat — typing
  'chat:typing': (data: {
    userId: string
    userName: string
    isTyping: boolean
    conversationId: string
  }) => void

  // Disappearing messages
  'chat:conversation:disappearing': (data: { conversationId: string; enabled: boolean; ttl: number }) => void

  // Poll updates
  'chat:poll:updated': (data: { messageId: string; poll: { question: string; options: Array<{ text: string; votes: string[] }> } }) => void

  // Presence
  'user:status': (data: { userId: string; online: boolean }) => void
  'user:customStatus': (data: { userId: string; emoji: string; text: string }) => void

  // Tasks
  'task:moved': (data: TaskEventPayload) => void
  'task:updated': (data: TaskEventPayload) => void
  'task:created': (data: TaskEventPayload) => void
  'task:deleted': (data: TaskEventPayload) => void
  'task:reordered': (data: TaskEventPayload) => void
  'task:comment.added': (data: { taskId: string; userId: string; commentId: string; hasAttachment: boolean; timestamp: string }) => void

  // Fund pools
  'fund-pool:updated': (data: FundPool) => void
  'feature-flag:updated': (data: { key: string; enabled: boolean }) => void

  // Points / gamification
  'points:earned': (data: { points: number; totalPoints: number }) => void

  // Projects
  'project:created': (data: { project: Project; userId?: string }) => void
  'project:updated': (data: { project: Project }) => void
  'project:deleted': (data: { project: { _id: string } }) => void

  // Notifications
  'notification:new': (data: AppNotification) => void

  // Payments
  'payment:confirmed': (data: PaymentConfirmedEvent) => void
  'payment:expired': (data: { qrId: string; orderId: string }) => void
}

// ── Client → Server events ─────────────────────────────────────────────────────

export interface ClientToServerEvents {
  joinRoom: (data: { room: string }) => void
  leaveRoom: (data: { room: string }) => void
  joinConversationRoom: (data: { conversationId: string }) => void

  /** Join conversation member room (used for message delivery fanout) */
  joinConversationMemberRoom: (data: { conversationId: string }) => void
  leaveConversationMemberRoom: (data: { conversationId: string }) => void
  leaveConversationRoom: (data: { conversationId: string }) => void
  'chat:typing': (data: { conversationId: string; isTyping: boolean }) => void
  'user:setStatus': (data: { emoji: string; text: string }) => void
}
