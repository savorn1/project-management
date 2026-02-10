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

// Task
export interface Task {
  _id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
  projectId: string
  order: number
  tags: string[]
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
export interface TaskComment {
  _id: string
  taskId: string
  userId: string
  user?: { _id: string; name: string; email: string }
  content: string
  createdAt: string
  updatedAt: string
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
