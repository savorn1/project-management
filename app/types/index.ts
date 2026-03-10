// User Roles
export type UserRole = 'super_admin' | 'admin'

// Team Member (User)
export interface TeamMember {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
}

// Task Priority and Status
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'

// Sprint
export type SprintStatus = 'planning' | 'active' | 'closed'

export interface Sprint {
  _id: string
  projectId: string
  name: string
  startDate?: string
  endDate?: string
  status: SprintStatus
  goal?: string
  createdAt: string
}

// Label
export interface Label {
  _id: string
  projectId: string
  name: string
  color: string
  createdAt: string
}

// Task
export interface Task {
  _id: string
  key: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
  projectId: string
  order: number
  tags: string[]
  sprintId?: string
  parentId?: string
  labelIds: string[]
  createdAt: string
  updatedAt: string
}

// Kanban Column
export interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
}

// Milestone
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export interface Milestone {
  _id: string
  name: string
  description?: string
  projectId: string
  status: MilestoneStatus
  dueDate: string
  completedAt?: string
  progress: number
  createdAt: string
  updatedAt: string
}

// Project Status and Priority
export type ProjectStatus = 'active' | 'archived'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

// Project
export interface Project {
  _id: string
  workplaceId: string
  name: string
  key: string
  description?: string
  coverImage?: string
  ownerId: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// Project Create/Update Input (without auto-generated fields)
export interface ProjectInput {
  name: string
  key: string
  description?: string
  coverImage?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  startDate?: string
  endDate?: string
}

// Workplace
export type WorkplacePlan = 'free' | 'pro' | 'enterprise'
export type WorkplaceStatus = 'active' | 'archived'
export type WorkplaceMemberRole = 'owner' | 'admin' | 'member'

export interface Workplace {
  _id: string
  name: string
  slug: string
  coverImage?: string
  ownerId: string
  plan: WorkplacePlan
  status: WorkplaceStatus
  createdAt: string
  updatedAt: string
}

export interface WorkplaceInput {
  name: string
  slug: string
  plan?: WorkplacePlan
  coverImage?: string
}

export interface WorkplaceMember {
  _id: string
  workplaceId: string
  userId: string
  role: WorkplaceMemberRole
  joinedAt: string
}

export interface WorkplaceMemberWithUser extends WorkplaceMember {
  user?: TeamMember
}

export type ProjectMemberRole = 'manager' | 'developer' | 'viewer'

export interface ProjectMember {
  _id: string
  projectId: string
  userId: string | { _id: string; name: string; email: string }
  role: ProjectMemberRole
  joinedAt: string
  user?: { _id: string; name: string; email: string }
}

// Task Comment
export interface CommentAttachment {
  fileId: string
  originalName: string
  url: string
  mimeType: string
  size: number
  s3Key: string
}

export interface TaskComment {
  _id: string
  taskId: string
  userId: string
  user?: { _id: string; name: string; email: string }
  content: string
  attachments: CommentAttachment[]
  createdAt: string
  updatedAt: string
}

// Notification
export type NotificationType = 'mentioned' | 'assigned' | 'task_completed' | 'chat_group_created' | 'chat_member_added'

export interface AppNotification {
  _id: string
  recipientId: string
  actorId?: string
  taskId?: string
  taskTitle?: string
  conversationId?: string
  conversationName?: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
}

// Task Activity
export interface TaskActivity {
  _id: string
  taskId: string
  userId: string
  user?: { _id: string; name: string; email: string }
  action: string
  meta?: Record<string, unknown>
  createdAt: string
}

// Fund Pool
export type FundPoolType = 'savings' | 'emergency' | 'investment' | 'operational' | 'reserve' | 'general'

export interface FundPool {
  _id: string
  type: FundPoolType
  name: string
  currentAmount: number
  recurringAmount: number
  intervalMinutes: number
  isEnabled: boolean
  lastExecutedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FundPoolInput {
  type: FundPoolType
  name: string
  recurringAmount?: number
  intervalMinutes: number
  isEnabled?: boolean
}

export interface FundPoolExecution {
  _id: string
  poolId: string
  amountAdded: number
  balanceAfter: number
  executedAt: string
}

// Orders
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  clientId: string
  vendorId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress?: string
  paymentMethod?: string
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'THB' | 'JPY'

export interface CreateOrderItemInput {
  productId: string
  name: string        // description of the item
  quantity: number
  price: number       // unit price (amount)
}

export interface CreateOrderInput {
  vendorId: string
  items: CreateOrderItemInput[]
  shippingAddress: string
  paymentMethod: string
  currency: SupportedCurrency
  notes?: string
}

// Payment QR
export type PaymentQrStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export interface PaymentQrResult {
  qrId: string
  qrImage: string
  expiresAt: string
  amount: number
}

export interface PaymentQrStatusResult {
  qrId: string
  orderId: string
  amount: number
  currency: string
  status: PaymentQrStatus
  expiresAt: string
  paidAt?: string
}

export interface PaymentConfirmedEvent {
  orderId: string
  qrId: string
  amount: number
  currency: string
  paidAt: string
  newStatus: string
}

export interface SampleOrderResult {
  order: Order
  qrId: string
  qrImage: string
  expiresAt: string
  amount: number
  currency: string
}

export interface QrHistoryRecord {
  qrId: string
  orderId: string
  amount: number
  currency: string
  status: PaymentQrStatus
  expiresAt: string
  paidAt: string | null
  createdAt: string | null
}

/** Full QR detail returned by GET /admin/payments/qr/:qrId */
export interface PaymentQrDetail {
  qrId: string
  orderId: string
  amount: number
  currency: string
  status: PaymentQrStatus
  expiresAt: string
  paidAt: string | null
  /** Base64 PNG data-URL. Only present when status=pending and QR is still in Redis. */
  qrImage: string | null
  /** Seconds remaining until expiry. 0 when expired/paid/cancelled. */
  secondsLeft: number
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ConversationType = 'private' | 'group'
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'poll'

export interface PollOption {
  text: string
  votes: string[]
}

export interface Poll {
  question: string
  options: PollOption[]
}

export interface LastMessageSnapshot {
  messageId: string
  senderId: string
  content: string
  createdAt: string
  type?: MessageType
  attachmentsCount?: number
}

export interface Conversation {
  _id: string
  type: ConversationType
  participants: string[]
  name?: string
  avatar?: string
  createdBy?: string
  admins: string[]
  blockedMembers: string[]
  lastMessage?: LastMessageSnapshot
  pinnedMessages?: PinnedMessage[]
  createdAt: string
  updatedAt: string
  /** Returned by API: persisted unread count from UserConversation */
  unreadCount?: number
  /** Frontend-only: live unread count (initialized from unreadCount, updated via socket) */
  _unread?: number
  /** Whether this conversation is muted for the current user (no notifications) */
  muted?: boolean
  /** ID of last message the current user has read (returned by API, used for unread separator) */
  lastReadMessageId?: string | null
  /** Whether the current user has archived this conversation */
  archived?: boolean
  /** Disappearing messages setting */
  disappearingMessages?: { enabled: boolean; ttl: number }
  /** Slow mode — cooldown seconds between messages per member (group admin setting) */
  slowMode?: { enabled: boolean; delay: number }
  /** Invite link token for group (admin-generated) */
  inviteToken?: string
}

export interface MessageAttachment {
  url: string
  originalName: string
  mimeType: string
  size?: number
}

export interface MessageReadReceipt {
  userId: string
  readAt: string
}

export interface MessageDeliveryReceipt {
  userId: string
  deliveredAt: string
}

export interface MessageReaction {
  emoji: string
  userId: string
}

export interface PinnedMessage {
  messageId: string
  pinnedBy: string
  pinnedAt: string
  content?: string
}

export interface MessageEditHistoryEntry {
  content: string
  editedAt: string
}

export interface ForwardedFrom {
  messageId: string
  conversationId: string
  senderName: string
}

export interface ChatMessage {
  _id: string
  conversationId: string
  senderId: string
  type: MessageType
  content: string
  replyTo?: string
  attachments: MessageAttachment[]
  readBy: ReadonlyArray<MessageReadReceipt>
  deliveredTo?: ReadonlyArray<MessageDeliveryReceipt>
  reactions: MessageReaction[]
  isDeleted: boolean
  deletedAt?: string
  editedAt?: string
  createdAt: string
  updatedAt: string
  /** Set when conversation has disappearing messages; ISO string */
  expiresAt?: string
  /** Poll payload — present when type === 'poll' */
  poll?: Poll
  /** Edit history — previous versions of the message content */
  editHistory?: MessageEditHistoryEntry[]
  /** Forwarded-from metadata — set when this message is a forward */
  forwardedFrom?: ForwardedFrom
  /** Mentioned user IDs */
  mentions?: string[]
  /** Frontend-only: optimistic send state */
  _status?: 'sending' | 'sent'
}

export interface LinkPreview {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

export interface StarredMessage {
  message: ChatMessage
  conversationId: string
}

export interface MentionResult {
  message: ChatMessage
  conversationId: string
}

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  teamMembers: number
  tasksThisWeek: number
}



