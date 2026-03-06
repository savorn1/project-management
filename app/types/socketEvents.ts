import type { ChatMessage, Conversation, PaymentConfirmedEvent } from '~/types'

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
  'chat:message:new':     (data: ChatMessage) => void
  'chat:message:deleted': (data: { messageId: string; conversationId: string }) => void

  // Chat — conversations
  'chat:conversation:new': (data: Conversation) => void

  // Chat — members
  'chat:member:added':     (data: { conversationId: string; userIds: string[] }) => void
  'chat:member:left':      (data: { conversationId: string; userId: string }) => void
  'chat:member:removed':   (data: { conversationId: string; userId: string }) => void
  'chat:member:blocked':   (data: { conversationId: string; userId: string }) => void
  'chat:member:unblocked': (data: { conversationId: string; userId: string }) => void

  // Chat — typing
  'chat:typing': (data: {
    userId: string
    userName: string
    isTyping: boolean
    conversationId: string
  }) => void

  // Presence
  'user:status': (data: { userId: string; online: boolean }) => void

  // Tasks
  'task:moved':     (data: TaskEventPayload) => void
  'task:updated':   (data: TaskEventPayload) => void
  'task:created':   (data: TaskEventPayload) => void
  'task:deleted':   (data: TaskEventPayload) => void
  'task:reordered': (data: TaskEventPayload) => void

  // Points / gamification
  'points:earned': (data: { points: number; totalPoints: number }) => void

  // Payments
  'payment:confirmed': (data: PaymentConfirmedEvent) => void
  'payment:expired':   (data: { qrId: string; orderId: string }) => void
}

// ── Client → Server events ─────────────────────────────────────────────────────

export interface ClientToServerEvents {
  joinRoom:              (data: { room: string }) => void
  leaveRoom:             (data: { room: string }) => void
  joinConversationRoom:  (data: { conversationId: string }) => void
  leaveConversationRoom: (data: { conversationId: string }) => void
  'chat:typing':         (data: { conversationId: string; isTyping: boolean }) => void
}
