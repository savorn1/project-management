import type { Project, Task, TeamMember } from '~/types'

export const teamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: '👨‍💻',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: '👩‍🎨',
    role: 'designer',
    createdAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 'user-3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: '👨‍🔧',
    role: 'developer',
    createdAt: '2024-02-10T11:00:00Z'
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    avatar: '👩‍💼',
    role: 'manager',
    createdAt: '2024-01-20T08:00:00Z'
  },
  {
    id: 'user-5',
    name: 'James Lee',
    email: 'james@example.com',
    avatar: '👨‍🚀',
    role: 'developer',
    createdAt: '2024-03-01T14:00:00Z'
  }
]

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    color: 'indigo',
    icon: '🎨',
    memberIds: ['user-1', 'user-2', 'user-3'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z'
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2.0',
    description: 'Major update to the mobile application with new features and performance improvements',
    color: 'emerald',
    icon: '📱',
    memberIds: ['user-3', 'user-4', 'user-5'],
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-06-20T11:00:00Z'
  },
  {
    id: 'proj-3',
    name: 'API Integration',
    description: 'Integrate third-party APIs for payment processing and analytics',
    color: 'amber',
    icon: '🔧',
    memberIds: ['user-1', 'user-5'],
    createdAt: '2024-03-10T15:00:00Z',
    updatedAt: '2024-06-18T16:45:00Z'
  },
  {
    id: 'proj-4',
    name: 'Marketing Campaign',
    description: 'Q3 marketing campaign planning and execution',
    color: 'rose',
    icon: '🚀',
    memberIds: ['user-2', 'user-4'],
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-06-22T10:15:00Z'
  }
]

export const tasks: Task[] = [
  // Website Redesign tasks
  {
    id: 'task-1',
    title: 'Create wireframes',
    description: 'Design initial wireframes for all main pages',
    status: 'done',
    priority: 'high',
    dueDate: '2024-06-10',
    assigneeId: 'user-2',
    projectId: 'proj-1',
    order: 1,
    tags: ['design', 'ux'],
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-08T15:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Design system setup',
    description: 'Create design tokens, color palette, and typography system',
    status: 'done',
    priority: 'high',
    dueDate: '2024-06-15',
    assigneeId: 'user-2',
    projectId: 'proj-1',
    order: 2,
    tags: ['design'],
    createdAt: '2024-05-05T11:00:00Z',
    updatedAt: '2024-06-14T12:00:00Z'
  },
  {
    id: 'task-3',
    title: 'Homepage development',
    description: 'Implement the new homepage design with all animations',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-06-28',
    assigneeId: 'user-3',
    projectId: 'proj-1',
    order: 3,
    tags: ['frontend', 'development'],
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-20T14:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Contact form integration',
    description: 'Build and connect contact form with backend',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-07-05',
    assigneeId: 'user-1',
    projectId: 'proj-1',
    order: 4,
    tags: ['backend', 'frontend'],
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-06-10T10:00:00Z'
  },
  {
    id: 'task-5',
    title: 'SEO optimization',
    description: 'Implement meta tags, structured data, and sitemap',
    status: 'todo',
    priority: 'low',
    dueDate: '2024-07-15',
    assigneeId: null,
    projectId: 'proj-1',
    order: 5,
    tags: ['seo'],
    createdAt: '2024-06-12T11:00:00Z',
    updatedAt: '2024-06-12T11:00:00Z'
  },

  // Mobile App tasks
  {
    id: 'task-6',
    title: 'Push notification system',
    description: 'Implement push notifications for iOS and Android',
    status: 'review',
    priority: 'high',
    dueDate: '2024-06-22',
    assigneeId: 'user-5',
    projectId: 'proj-2',
    order: 1,
    tags: ['mobile', 'backend'],
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-06-21T16:00:00Z'
  },
  {
    id: 'task-7',
    title: 'Offline mode support',
    description: 'Enable offline data caching and sync',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-06-30',
    assigneeId: 'user-3',
    projectId: 'proj-2',
    order: 2,
    tags: ['mobile', 'performance'],
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2024-06-19T11:00:00Z'
  },
  {
    id: 'task-8',
    title: 'Dark mode implementation',
    description: 'Add dark mode theme support throughout the app',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-07-10',
    assigneeId: 'user-5',
    projectId: 'proj-2',
    order: 3,
    tags: ['mobile', 'ui'],
    createdAt: '2024-06-05T09:00:00Z',
    updatedAt: '2024-06-05T09:00:00Z'
  },
  {
    id: 'task-9',
    title: 'Performance optimization',
    description: 'Optimize app startup time and reduce memory usage',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2024-06-25',
    assigneeId: 'user-3',
    projectId: 'proj-2',
    order: 4,
    tags: ['performance'],
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z'
  },

  // API Integration tasks
  {
    id: 'task-10',
    title: 'Payment gateway setup',
    description: 'Integrate Stripe payment processing',
    status: 'done',
    priority: 'urgent',
    dueDate: '2024-06-15',
    assigneeId: 'user-1',
    projectId: 'proj-3',
    order: 1,
    tags: ['backend', 'payment'],
    createdAt: '2024-05-10T10:00:00Z',
    updatedAt: '2024-06-14T17:00:00Z'
  },
  {
    id: 'task-11',
    title: 'Analytics integration',
    description: 'Set up Google Analytics and custom event tracking',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-06-28',
    assigneeId: 'user-5',
    projectId: 'proj-3',
    order: 2,
    tags: ['analytics', 'tracking'],
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-20T09:00:00Z'
  },
  {
    id: 'task-12',
    title: 'Error monitoring setup',
    description: 'Implement Sentry for error tracking and monitoring',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-07-01',
    assigneeId: 'user-1',
    projectId: 'proj-3',
    order: 3,
    tags: ['monitoring', 'devops'],
    createdAt: '2024-06-10T14:00:00Z',
    updatedAt: '2024-06-10T14:00:00Z'
  },

  // Marketing Campaign tasks
  {
    id: 'task-13',
    title: 'Campaign strategy document',
    description: 'Create comprehensive Q3 marketing strategy',
    status: 'done',
    priority: 'high',
    dueDate: '2024-06-05',
    assigneeId: 'user-4',
    projectId: 'proj-4',
    order: 1,
    tags: ['strategy', 'planning'],
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-06-04T16:00:00Z'
  },
  {
    id: 'task-14',
    title: 'Social media content calendar',
    description: 'Plan and schedule social media posts for July-August',
    status: 'review',
    priority: 'medium',
    dueDate: '2024-06-20',
    assigneeId: 'user-2',
    projectId: 'proj-4',
    order: 2,
    tags: ['social', 'content'],
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-19T15:00:00Z'
  },
  {
    id: 'task-15',
    title: 'Email newsletter design',
    description: 'Design new email templates for newsletter campaign',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-06-30',
    assigneeId: 'user-2',
    projectId: 'proj-4',
    order: 3,
    tags: ['design', 'email'],
    createdAt: '2024-06-10T11:00:00Z',
    updatedAt: '2024-06-18T14:00:00Z'
  },
  {
    id: 'task-16',
    title: 'Landing page creation',
    description: 'Build campaign landing page with lead capture form',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-07-08',
    assigneeId: 'user-3',
    projectId: 'proj-4',
    order: 4,
    tags: ['frontend', 'marketing'],
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z'
  }
]

// Helper functions
export function getProjectTasks(projectId: string): Task[] {
  return tasks.filter(task => task.projectId === projectId)
}

export function getTasksByStatus(projectId: string, status: string): Task[] {
  return tasks.filter(task => task.projectId === projectId && task.status === status)
}

export function getMemberById(memberId: string): TeamMember | undefined {
  return teamMembers.find(member => member.id === memberId)
}

export function getProjectById(projectId: string): Project | undefined {
  return projects.find(project => project.id === projectId)
}

export function calculateProjectProgress(projectId: string): number {
  const projectTasks = getProjectTasks(projectId)
  if (projectTasks.length === 0) return 0
  const completedTasks = projectTasks.filter(task => task.status === 'done').length
  return Math.round((completedTasks / projectTasks.length) * 100)
}

export function getProjectMembers(projectId: string): TeamMember[] {
  const project = getProjectById(projectId)
  if (!project) return []
  return project.memberIds.map(id => getMemberById(id)).filter(Boolean) as TeamMember[]
}
