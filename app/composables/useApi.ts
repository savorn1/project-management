import type { Task, Project, TeamMember, DashboardStats } from '~/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface TasksResponse {
  success: boolean
  count: number
  tasks: Task[]
}

interface TaskResponse {
  success: boolean
  task: Task
  message?: string
}

interface ProjectsResponse {
  success: boolean
  count: number
  projects: Project[]
}

interface ProjectResponse {
  success: boolean
  project: Project
  message?: string
}

interface TeamResponse {
  success: boolean
  count: number
  members: TeamMember[]
}

interface MemberResponse {
  success: boolean
  member: TeamMember
  message?: string
}

interface StatsResponse {
  success: boolean
  statistics: DashboardStats
}

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Tasks API
  const tasksApi = {
    async getAll(): Promise<Task[]> {
      const response = await request<TasksResponse>('/task-system/tasks')
      return response.tasks || []
    },

    async getById(id: string): Promise<Task> {
      const response = await request<TaskResponse>(`/task-system/tasks/${id}`)
      return response.task
    },

    async getByStatus(status: string): Promise<Task[]> {
      const response = await request<TasksResponse>(`/task-system/tasks/status/${status}`)
      return response.tasks || []
    },

    async getByUser(username: string): Promise<Task[]> {
      const response = await request<TasksResponse>(`/task-system/tasks/user/${username}`)
      return response.tasks || []
    },

    async create(data: Partial<Task>): Promise<Task> {
      const response = await request<TaskResponse>('/task-system/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.task
    },

    async update(id: string, data: Partial<Task>): Promise<Task> {
      const response = await request<TaskResponse>(`/task-system/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response.task
    },

    async delete(id: string): Promise<void> {
      await request(`/task-system/tasks/${id}`, {
        method: 'DELETE',
      })
    },

    async getStatistics(): Promise<DashboardStats> {
      const response = await request<StatsResponse>('/task-system/statistics')
      return response.statistics
    },
  }

  // Projects API
  const projectsApi = {
    async getAll(): Promise<Project[]> {
      const response = await request<ProjectsResponse>('/projects')
      return response.projects || []
    },

    async getById(id: string): Promise<Project> {
      const response = await request<ProjectResponse>(`/projects/${id}`)
      return response.project
    },

    async create(data: Partial<Project>): Promise<Project> {
      const response = await request<ProjectResponse>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.project
    },

    async update(id: string, data: Partial<Project>): Promise<Project> {
      const response = await request<ProjectResponse>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response.project
    },

    async delete(id: string): Promise<void> {
      await request(`/projects/${id}`, {
        method: 'DELETE',
      })
    },
  }

  // Team API
  const teamApi = {
    async getAll(): Promise<TeamMember[]> {
      const response = await request<TeamResponse>('/admin/users')
      return response.members || []
    },

    async getById(id: string): Promise<TeamMember> {
      const response = await request<MemberResponse>(`/admin/users/${id}`)
      return response.member
    },

    async create(data: Partial<TeamMember>): Promise<TeamMember> {
      const response = await request<MemberResponse>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.member
    },

    async update(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
      const response = await request<MemberResponse>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response.member
    },

    async delete(id: string): Promise<void> {
      await request(`/admin/users/${id}`, {
        method: 'DELETE',
      })
    },
  }

  // Health check
  async function checkHealth(): Promise<boolean> {
    try {
      await request('/health')
      return true
    } catch {
      return false
    }
  }

  return {
    loading,
    error,
    request,
    tasksApi,
    projectsApi,
    teamApi,
    checkHealth,
  }
}
