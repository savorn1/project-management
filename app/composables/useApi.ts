import type {
  AppNotification,
  DashboardStats,
  Label,
  Project,
  ProjectInput,
  ProjectMember,
  Sprint,
  Task,
  TaskActivity,
  TaskComment,
  TeamMember,
  Workplace,
  WorkplaceInput,
  WorkplaceMemberWithUser,
  WorkplaceMember as WpMember
} from '~/types'

interface ListResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  limit: number
}

interface SingleResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface DeleteResponse {
  success: boolean
  message: string
}

interface StatsResponse {
  success: boolean
  statistics: DashboardStats
}

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { getAuthHeader, clearAuthState } = useAuth()
  const { clientId } = useSocket()
  const toast = useToast()

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
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const { headers: optHeaders, ...restOptions } = options

      const response = await fetch(`${apiBase}${endpoint}`, {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
          ...getAuthHeader(),
          ...(optHeaders as Record<string, string>),
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `HTTP error! status: ${response.status}`
        error.value = message
        toast.error(message)

        if (response.status === 401) {
          clearAuthState()
          navigateTo('/login')
        }

        return null
      }

      return await response.json()
    } catch (err) {
      let message = 'An error occurred'
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          message = 'Request timeout - server not responding'
        } else if (err.message === 'Failed to fetch') {
          message = 'Cannot connect to server'
        } else {
          message = err.message
        }
      }
      error.value = message
      toast.error(message)
      return null
    } finally {
      loading.value = false
    }
  }

  // Tasks API
  const tasksApi = {
    async getMyTasks(): Promise<Task[]> {
      const response = await request<ListResponse<Task>>('/admin/tasks/my-tasks?limit=100')
      return response?.data || []
    },

    async getByProject(projectId: string): Promise<Task[]> {
      const response = await request<ListResponse<Task>>(`/admin/tasks/project/${projectId}?limit=100`)
      return response?.data || []
    },

    async getCounts(projectId: string): Promise<{ total: number; byStatus: Record<string, number> }> {
      const response = await request<{ success: boolean; data: { total: number; byStatus: Record<string, number> } }>(`/admin/tasks/project/${projectId}/counts`)
      return response?.data ?? { total: 0, byStatus: {} }
    },

    async getBySprint(sprintId: string): Promise<Task[]> {
      const response = await request<ListResponse<Task>>(`/admin/tasks/sprint/${sprintId}?limit=100`)
      return response?.data || []
    },

    async getBacklog(projectId: string): Promise<Task[]> {
      const response = await request<ListResponse<Task>>(`/admin/tasks/backlog/${projectId}?limit=100`)
      return response?.data || []
    },

    async getSubtasks(taskId: string): Promise<Task[]> {
      const response = await request<ListResponse<Task>>(`/admin/tasks/${taskId}/subtasks?limit=100`)
      return response?.data || []
    },

    async getById(id: string): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks/${id}`)
      return response?.data || null
    },

    async create(data: Partial<Task>, projectId: string): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks?projectId=${projectId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async update(id: string, data: Partial<Task>): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async updateStatus(id: string, status: string): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return response?.data || null
    },

    async assign(id: string, assigneeId: string): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks/${id}/assign/${assigneeId}`, {
        method: 'PATCH',
      })
      return response?.data || null
    },

    async unassign(id: string): Promise<Task | null> {
      const response = await request<SingleResponse<Task>>(`/admin/tasks/${id}/unassign`, {
        method: 'PATCH',
      })
      return response?.data || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request<DeleteResponse>(`/admin/tasks/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },

    async reorder(projectId: string, taskOrders: { taskId: string; order: number }[]): Promise<void> {
      await request('/admin/tasks/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ projectId, taskOrders }),
      })
    },

    async getStatistics(): Promise<DashboardStats | null> {
      const response = await request<StatsResponse>('/admin/tasks/statistics')
      return response?.statistics || null
    },
  }

  // Projects API
  const projectsApi = {
    async getAll(): Promise<Project[]> {
      const response = await request<ListResponse<Project>>('/admin/projects?limit=100')
      return response?.data || []
    },

    async getByWorkplace(workplaceId: string): Promise<Project[]> {
      const response = await request<ListResponse<Project>>(`/admin/projects/by-workplace/${workplaceId}?limit=100`)
      return response?.data || []
    },

    async getMyProjects(): Promise<Project[]> {
      const response = await request<ListResponse<Project>>('/admin/projects/my-projects?limit=100')
      return response?.data || []
    },

    async getById(id: string): Promise<Project | null> {
      const response = await request<SingleResponse<Project>>(`/admin/projects/${id}`)
      return response?.data || null
    },

    async create(data: ProjectInput, workplaceId: string): Promise<Project | null> {
      const response = await request<SingleResponse<Project>>(`/admin/projects?workplaceId=${workplaceId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async update(id: string, data: Partial<ProjectInput>): Promise<Project | null> {
      const response = await request<SingleResponse<Project>>(`/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request<DeleteResponse>(`/admin/projects/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },

    async archive(id: string): Promise<Project | null> {
      const response = await request<SingleResponse<Project>>(`/admin/projects/${id}/archive`, {
        method: 'PUT',
      })
      return response?.data || null
    },

    async activate(id: string): Promise<Project | null> {
      const response = await request<SingleResponse<Project>>(`/admin/projects/${id}/activate`, {
        method: 'PUT',
      })
      return response?.data || null
    },
  }

  // Team API (Users)
  const teamApi = {
    async getAll(): Promise<TeamMember[]> {
      const response = await request<ListResponse<TeamMember>>('/admin/users?limit=100')
      return response?.data || []
    },

    async getById(id: string): Promise<TeamMember | null> {
      const response = await request<SingleResponse<TeamMember>>(`/admin/users/${id}`)
      return response?.data || null
    },

    async create(data: Partial<TeamMember>): Promise<TeamMember | null> {
      const response = await request<SingleResponse<TeamMember>>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async update(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
      const response = await request<SingleResponse<TeamMember>>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response?.data || null
    },

    async delete(id: string): Promise<boolean> {
      const response = await request<DeleteResponse>(`/admin/users/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Workplaces API
  // Note: Backend workplace controller returns raw responses (no { success, data } wrapping)
  // - List endpoints return { data: [...], total: N } from findWithPagination
  // - Single endpoints return the raw document
  interface RawListResponse<T> {
    data: T[]
    total: number
  }

  const workplacesApi = {
    async getAll(): Promise<Workplace[]> {
      const response = await request<RawListResponse<Workplace>>('/admin/workplaces?limit=100')
      return response?.data || []
    },

    async getById(id: string): Promise<Workplace | null> {
      return await request<Workplace>(`/admin/workplaces/${id}`)
    },

    async getBySlug(slug: string): Promise<Workplace | null> {
      return await request<Workplace>(`/admin/workplaces/slug/${slug}`)
    },

    async create(data: WorkplaceInput): Promise<Workplace | null> {
      return await request<Workplace>('/admin/workplaces', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async update(id: string, data: Partial<WorkplaceInput>): Promise<Workplace | null> {
      return await request<Workplace>(`/admin/workplaces/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    async delete(id: string): Promise<boolean> {
      const response = await request(`/admin/workplaces/${id}`, {
        method: 'DELETE',
      })
      return response !== null
    },

    async getStats(): Promise<Record<string, { projectCount: number; memberCount: number }>> {
      const response = await request<SingleResponse<Record<string, { projectCount: number; memberCount: number }>>>('/admin/workplaces/stats')
      return response?.data || {}
    },
  }

  // Workplace Members API
  const workplaceMembersApi = {
    async getAll(workplaceId: string): Promise<WpMember[]> {
      const response = await request<RawListResponse<WpMember>>(`/admin/workplaces/${workplaceId}/members?limit=100`)
      return response?.data || []
    },

    async getAllWithDetails(workplaceId: string): Promise<WorkplaceMemberWithUser[]> {
      const response = await request<RawListResponse<any>>(`/admin/workplaces/${workplaceId}/members/details?limit=100`)
      return (response?.data || []).map((m: any) => {
        const user = typeof m.userId === 'object' ? m.userId : undefined
        return {
          ...m,
          user,
          userId: user?._id || m.userId,
        }
      })
    },

    async getMemberRole(workplaceId: string, userId: string): Promise<string | null> {
      const response = await request<{ role: string }>(`/admin/workplaces/${workplaceId}/members/${userId}/role`)
      return response?.role || null
    },

    async addMember(workplaceId: string, userId: string, role?: string): Promise<WpMember | null> {
      return await request<WpMember>(`/admin/workplaces/${workplaceId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      })
    },

    async updateRole(workplaceId: string, userId: string, role: string): Promise<WpMember | null> {
      return await request<WpMember>(`/admin/workplaces/${workplaceId}/members/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      })
    },

    async removeMember(workplaceId: string, userId: string): Promise<boolean> {
      const response = await request(`/admin/workplaces/${workplaceId}/members/${userId}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Labels API
  const labelsApi = {
    async getAll(projectId: string): Promise<Label[]> {
      const response = await request<Label[]>(`/admin/projects/${projectId}/labels/all`)
      return response || []
    },

    async create(projectId: string, data: { name: string; color: string }): Promise<Label | null> {
      return await request<Label>(`/admin/projects/${projectId}/labels`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async update(projectId: string, labelId: string, data: { name?: string; color?: string }): Promise<Label | null> {
      return await request<Label>(`/admin/projects/${projectId}/labels/${labelId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    async delete(projectId: string, labelId: string): Promise<boolean> {
      const response = await request(`/admin/projects/${projectId}/labels/${labelId}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Sprints API
  const sprintsApi = {
    async getAll(projectId: string): Promise<Sprint[]> {
      const response = await request<RawListResponse<Sprint>>(`/admin/projects/${projectId}/sprints?limit=100`)
      return response?.data || []
    },

    async create(projectId: string, data: { name: string; startDate?: string; endDate?: string; goal?: string }): Promise<Sprint | null> {
      return await request<Sprint>(`/admin/projects/${projectId}/sprints`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async update(projectId: string, sprintId: string, data: { name?: string; startDate?: string; endDate?: string; goal?: string }): Promise<Sprint | null> {
      return await request<Sprint>(`/admin/projects/${projectId}/sprints/${sprintId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    async start(projectId: string, sprintId: string): Promise<Sprint | null> {
      return await request<Sprint>(`/admin/projects/${projectId}/sprints/${sprintId}/start`, {
        method: 'PUT',
      })
    },

    async close(projectId: string, sprintId: string): Promise<Sprint | null> {
      return await request<Sprint>(`/admin/projects/${projectId}/sprints/${sprintId}/close`, {
        method: 'PUT',
      })
    },

    async delete(projectId: string, sprintId: string): Promise<boolean> {
      const response = await request(`/admin/projects/${projectId}/sprints/${sprintId}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  // Task Comments API
  // Note: Backend returns populated userId as { _id, name, email } object
  // We map it to the `user` field for frontend consumption
  const commentsApi = {
    async getByTask(taskId: string): Promise<TaskComment[]> {
      const response = await request<RawListResponse<any>>(`/admin/tasks/${taskId}/comments?limit=100`)
      return (response?.data || []).map(mapComment)
    },

    async create(taskId: string, content: string, file?: File): Promise<TaskComment | null> {
      if (file) {
        // Must use fetch directly — request() always injects Content-Type: application/json
        // which breaks multipart/form-data (browser needs to set boundary itself)
        const fd = new FormData()
        if (content.trim()) fd.append('content', content.trim())
        fd.append('file', file)
        try {
          const res = await fetch(`${apiBase}/admin/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: { 'x-client-id': clientId, ...getAuthHeader() },
            body: fd,
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            toast.error(err.message || 'Upload failed')
            return null
          }
          const raw = await res.json()
          return mapComment(raw)
        } catch {
          toast.error('Failed to upload attachment')
          return null
        }
      }

      const response = await request<any>(`/admin/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      return response ? mapComment(response) : null
    },

    async update(taskId: string, commentId: string, content: string): Promise<TaskComment | null> {
      const response = await request<any>(`/admin/tasks/${taskId}/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      })
      return response ? mapComment(response) : null
    },

    async getById(taskId: string, commentId: string): Promise<TaskComment | null> {
      const response = await request<any>(`/admin/tasks/${taskId}/comments/${commentId}`)
      return response ? mapComment(response) : null
    },

    async delete(taskId: string, commentId: string): Promise<boolean> {
      const response = await request<DeleteResponse>(`/admin/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      })
      return response !== null
    },
  }

  function mapComment(raw: any): TaskComment {
    const user = typeof raw.userId === 'object' ? raw.userId : undefined
    return {
      ...raw,
      user,
      userId: user?._id || raw.userId,
      attachments: raw.attachments ?? [],
    }
  }

  // Task Activity API
  const activityApi = {
    async getByTask(taskId: string): Promise<TaskActivity[]> {
      const response = await request<RawListResponse<TaskActivity>>(`/admin/tasks/${taskId}/activities?limit=100`)
      return response?.data || []
    },
  }

  // Notifications API
  const notificationsApi = {
    async getAll(limit = 30): Promise<AppNotification[]> {
      const response = await request<AppNotification[]>(`/admin/notifications?limit=${limit}`)
      return response ?? []
    },
    async getUnreadCount(): Promise<number> {
      const response = await request<{ count: number }>('/admin/notifications/unread-count')
      return response?.count ?? 0
    },
    async markRead(id: string): Promise<void> {
      await request(`/admin/notifications/${id}/read`, { method: 'PATCH' })
    },
    async markAllRead(): Promise<void> {
      await request('/admin/notifications/read-all', { method: 'PATCH' })
    },
  }

  // Project members API
  const projectMembersApi = {
    async getWithDetails(projectId: string): Promise<ProjectMember[]> {
      const response = await request<{ data: ProjectMember[] }>(`/admin/projects/${projectId}/members/details?limit=100`)
      return (response?.data || []).map(m => ({
        ...m,
        user: typeof m.userId === 'object' ? m.userId : undefined,
        userId: typeof m.userId === 'object' ? (m.userId as any)._id : m.userId,
      }))
    },
  }

  // Project membership (join / check status)
  const membershipApi = {
    async getMyMembership(projectId: string): Promise<{ isMember: boolean; role: string | null }> {
      const response = await request<{ isMember: boolean; role: string | null }>(`/admin/projects/${projectId}/members/me`)
      return response ?? { isMember: false, role: null }
    },
    async join(projectId: string): Promise<boolean> {
      const response = await request(`/admin/projects/${projectId}/members/join`, { method: 'POST' })
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
    labelsApi,
    sprintsApi,
    commentsApi,
    activityApi,
    workplacesApi,
    workplaceMembersApi,
    notificationsApi,
    membershipApi,
    projectMembersApi,
    checkHealth,
  }
}
