import type { Task, Project, ProjectInput, TeamMember, DashboardStats } from '~/types'

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
  const { getAuthHeader } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const response = await fetch(`${apiBase}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        error.value = errorData.message || `HTTP error! status: ${response.status}`
        return null
      }

      return await response.json()
    } catch (err) {
      // Handle network errors, timeouts, etc. silently
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          error.value = 'Request timeout'
        } else {
          error.value = err.message
        }
      } else {
        error.value = 'An error occurred'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  // Tasks API
  const tasksApi = {
    async getAll(): Promise<Task[]> {
      const response = await request<TasksResponse>('/admin/tasks')
      return response?.tasks || []
    },

    async getById(id: string): Promise<Task | null> {
      const response = await request<TaskResponse>(`/admin/tasks/${id}`)
      return response?.task || null
    },

    async getByStatus(status: string): Promise<Task[]> {
      const response = await request<TasksResponse>(`/admin/tasks/status/${status}`)
      return response?.tasks || []
    },

    async getByUser(username: string): Promise<Task[]> {
      const response = await request<TasksResponse>(`/admin/tasks/user/${username}`)
      return response?.tasks || []
    },

    async create(data: Partial<Task>): Promise<Task | null> {
      const response = await request<TaskResponse>('/admin/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.task || null
    },

    async update(id: string, data: Partial<Task>): Promise<Task | null> {
      const response = await request<TaskResponse>(`/admin/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.task || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request(`/admin/tasks/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },

    async getStatistics(): Promise<DashboardStats | null> {
      const response = await request<StatsResponse>('/admin/tasks/statistics')
      return response?.statistics || null
    },
  }

  // Projects API
  const projectsApi = {
    async getAll(): Promise<Project[]> {
      const response = await request<ProjectsResponse>('/admin/projects')
      return response?.projects || []
    },

    async getById(id: string): Promise<Project | null> {
      const response = await request<ProjectResponse>(`/admin/projects/${id}`)
      return response?.project || null
    },

    async create(data: ProjectInput): Promise<Project | null> {
      const response = await request<ProjectResponse>('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.project || null
    },

    async update(id: string, data: Partial<ProjectInput>): Promise<Project | null> {
      const response = await request<ProjectResponse>(`/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.project || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request(`/admin/projects/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Team API
  const teamApi = {
    async getAll(): Promise<TeamMember[]> {
      const response = await request<TeamResponse>('/admin/users')
      return response?.members || []
    },

    async getById(id: string): Promise<TeamMember | null> {
      const response = await request<MemberResponse>(`/admin/users/${id}`)
      return response?.member || null
    },

    async create(data: Partial<TeamMember>): Promise<TeamMember | null> {
      const response = await request<MemberResponse>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.member || null
    },

    async update(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
      const response = await request<MemberResponse>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.member || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request(`/admin/users/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Health check
  async function checkHealth(): Promise<boolean> {
    const response = await request('/health')
    return response !== null
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
