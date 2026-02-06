import type { Task, TaskStatus, TaskPriority } from '~/types'
import { tasks as mockTasks } from '~/data/mockData'
import { generateId } from '~/utils/formatters'

const tasks = ref<Task[]>([])
const isApiConnected = ref(false)
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

    const apiTasks = await tasksApi.getAll()

    if (apiTasks.length > 0) {
      tasks.value = apiTasks
      isApiConnected.value = true
    } else if (apiRequestError.value) {
      // API failed, use mock data
      console.warn('API not available, using mock data')
      tasks.value = [...mockTasks]
      isApiConnected.value = false
      apiError.value = apiRequestError.value
    } else {
      // API returned empty array (no tasks)
      tasks.value = []
      isApiConnected.value = true
    }

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

  async function createTask(data: Partial<Task>): Promise<Task> {
    const newTask: Task = {
      id: generateId(),
      title: data.title || 'New Task',
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      assigneeId: data.assigneeId || null,
      projectId: data.projectId || '',
      order: tasks.value.filter(t => t.projectId === data.projectId && t.status === (data.status || 'todo')).length + 1,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (isApiConnected.value) {
      const created = await tasksApi.create(newTask)
      if (created) {
        tasks.value.push(created)
        return created
      }
    }

    tasks.value.push(newTask)
    return newTask
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return

    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    if (isApiConnected.value) {
      const updated = await tasksApi.update(id, updatedData)
      if (updated) {
        tasks.value[index] = { ...tasks.value[index], ...updated }
        return
      }
    }

    tasks.value[index] = {
      ...tasks.value[index],
      ...updatedData
    }
  }

  async function deleteTask(id: string) {
    if (isApiConnected.value) {
      await tasksApi.delete(id)
    }

    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  async function moveTask(taskId: string, newStatus: TaskStatus) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      await updateTask(taskId, { status: newStatus })
    }
  }

  async function toggleTaskComplete(id: string) {
    const task = tasks.value.find(t => t.id === id)
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
    isApiConnected,
    isLoading,
    apiError,
    loadTasks,
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
