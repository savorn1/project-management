import type { Task, TaskStatus } from '~/types'

interface TaskEventPayload {
  type: string
  projectId: string
  taskId: string
  data: Record<string, any>
  userId: string
  clientId?: string
  timestamp: string
}

export function useTaskRealtime(projectId: string) {
  const { tasks } = useTasks()
  const { clientId, connect, joinRoom, leaveRoom, on, off, isConnected } = useSocket()

  const room = `project:${projectId}`

  function isSelf(payload: TaskEventPayload): boolean {
    return !!payload.clientId && payload.clientId === clientId
  }

  function handleTaskMoved(payload: TaskEventPayload) {
    if (isSelf(payload)) return
    const index = tasks.value.findIndex(t => t._id === payload.taskId)
    if (index !== -1) {
      const taskData = (payload.data.task || {}) as Partial<Task>
      tasks.value[index] = {
        ...tasks.value[index],
        status: payload.data.status as TaskStatus,
        ...(Object.keys(taskData).length > 0 ? taskData : {}),
      } as Task
    }
  }

  function handleTaskUpdated(payload: TaskEventPayload) {
    if (isSelf(payload)) return
    const index = tasks.value.findIndex(t => t._id === payload.taskId)
    if (index !== -1 && payload.data.task) {
      tasks.value[index] = { ...tasks.value[index], ...(payload.data.task as Partial<Task>) } as Task
    }
  }

  function handleTaskCreated(payload: TaskEventPayload) {
    if (isSelf(payload)) return
    if (payload.data.task) {
      const exists = tasks.value.some(t => t._id === payload.taskId)
      if (!exists) {
        tasks.value.push(payload.data.task as Task)
      }
    }
  }

  function handleTaskDeleted(payload: TaskEventPayload) {
    if (isSelf(payload)) return
    const index = tasks.value.findIndex(t => t._id === payload.taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  function handleTaskReordered(payload: TaskEventPayload) {
    if (isSelf(payload)) return
    const taskOrders = payload.data.taskOrders as { taskId: string; order: number }[]
    if (taskOrders) {
      for (const { taskId, order } of taskOrders) {
        const task = tasks.value.find(t => t._id === taskId)
        if (task) task.order = order
      }
    }
  }

  function subscribe() {
    connect()
    joinRoom(room)

    on('task:moved', handleTaskMoved)
    on('task:updated', handleTaskUpdated)
    on('task:created', handleTaskCreated)
    on('task:deleted', handleTaskDeleted)
    on('task:reordered', handleTaskReordered)
  }

  function unsubscribe() {
    off('task:moved', handleTaskMoved)
    off('task:updated', handleTaskUpdated)
    off('task:created', handleTaskCreated)
    off('task:deleted', handleTaskDeleted)
    off('task:reordered', handleTaskReordered)
    leaveRoom(room)
  }

  return {
    subscribe,
    unsubscribe,
    isConnected,
  }
}
