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

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  teamMembers: number
  tasksThisWeek: number
}

