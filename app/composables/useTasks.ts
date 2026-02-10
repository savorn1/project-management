import type { Task, TaskStatus, TaskPriority } from '~/types'

const tasks = ref<Task[]>([])
const isLoading = ref(false)
const apiError = ref<string | null>(null)

interface TaskFilters {
  status: TaskStatus | null
  priority: TaskPriority | null
  projectId: string | null
  assigneeId: string | null
  search: string
}

export function useTasks() {
  const { tasksApi, error: apiRequestError } = useApi()
  const toast = useToast()

  const filters = ref<TaskFilters>({
    status: null,
    priority: null,
    projectId: null,
    assigneeId: null,
    search: ''
  })

  async function loadTasks() {
    isLoading.value = true
    apiError.value = null

    const apiTasks = await tasksApi.getMyTasks()

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    tasks.value = apiTasks
    isLoading.value = false
  }

  async function loadTasksByProject(projectId: string) {
    isLoading.value = true
    apiError.value = null

    const apiTasks = await tasksApi.getByProject(projectId)

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    tasks.value = apiTasks
    isLoading.value = false
  }

  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      if (filters.value.status && task.status !== filters.value.status) return false
      if (filters.value.priority && task.priority !== filters.value.priority) return false
      if (filters.value.projectId && task.projectId !== filters.value.projectId) return false
      if (filters.value.assigneeId && task.assigneeId !== filters.value.assigneeId) return false
      if (filters.value.search && !task.title.toLowerCase().includes(filters.value.search.toLowerCase())) return false
      return true
    })
  })

  function getTasksByProject(projectId: string): Task[] {
    return tasks.value.filter(task => task.projectId === projectId)
  }

  function getTasksByStatus(status: TaskStatus, projectId?: string): Task[] {
    return tasks.value.filter(task => {
      if (task.status !== status) return false
      if (projectId && task.projectId !== projectId) return false
      return true
    }).sort((a, b) => a.order - b.order)
  }

  async function createTask(data: Partial<Task>): Promise<Task | null> {
    const projectId = data.projectId || ''
    const created = await tasksApi.create(data, projectId)
    if (created) {
      tasks.value.push(created)
      toast.success('Task created successfully')
    }
    return created
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const index = tasks.value.findIndex(t => t._id === id)
    if (index === -1) return

    const updated = await tasksApi.update(id, data)
    if (updated) {
      tasks.value[index] = { ...tasks.value[index], ...updated }
    }
  }

  async function deleteTask(id: string) {
    const success = await tasksApi.delete(id)
    if (success) {
      const index = tasks.value.findIndex(t => t._id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
      toast.success('Task deleted successfully')
    }
  }

  async function moveTask(taskId: string, newStatus: TaskStatus) {
    const task = tasks.value.find(t => t._id === taskId)
    if (task) {
      await updateTask(taskId, { status: newStatus })
    }
  }

  async function toggleTaskComplete(id: string) {
    const task = tasks.value.find(t => t._id === id)
    if (task) {
      const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
      await updateTask(id, { status: newStatus })
    }
  }

  function setFilter(key: keyof TaskFilters, value: TaskFilters[keyof TaskFilters]) {
    filters.value[key] = value as never
  }

  function clearFilters() {
    filters.value = {
      status: null,
      priority: null,
      projectId: null,
      assigneeId: null,
      search: ''
    }
  }

  return {
    tasks,
    filters,
    filteredTasks,
    isLoading,
    apiError,
    loadTasks,
    loadTasksByProject,
    getTasksByProject,
    getTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleTaskComplete,
    setFilter,
    clearFilters
  }
}
