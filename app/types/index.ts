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
export type NotificationType = 'mentioned' | 'assigned'

export interface AppNotification {
  _id: string
  recipientId: string
  actorId?: string
  taskId?: string
  taskTitle?: string
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

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  teamMembers: number
  tasksThisWeek: number
}

