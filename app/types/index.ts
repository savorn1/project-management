// Team Member
export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'manager' | 'developer' | 'designer'
  createdAt: string
}

// Task Priority and Status
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

// Task
export interface Task {
  id: string
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

// Project
export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
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
