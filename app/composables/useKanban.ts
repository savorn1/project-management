import type { Task, TaskStatus } from '~/types'
import { KANBAN_COLUMNS } from '~/utils/constants'

const COLUMN_PAGE_SIZE = 5

interface ColumnMeta {
  skip: number
  total: number
  isLoading: boolean
  initialized: boolean
}

export function useKanban(projectId: string) {
  const { tasksApi } = useApi()
  const { tasks, moveTask, reorderTasks } = useTasks()

  const columns = ref(KANBAN_COLUMNS)
  const draggedTask = ref<Task | null>(null)
  const dropTargetColumn = ref<TaskStatus | null>(null)

  // Per-column state (independent from global tasks store)
  const columnTasks = ref<Record<string, Task[]>>({})
  const columnMeta = ref<Record<string, ColumnMeta>>({})

  function getColumnTasks(columnId: TaskStatus): Task[] {
    return columnTasks.value[columnId] || []
  }

  function getColumnTotal(columnId: TaskStatus): number {
    return columnMeta.value[columnId]?.total ?? (columnTasks.value[columnId]?.length ?? 0)
  }

  function isColumnLoading(columnId: TaskStatus): boolean {
    return columnMeta.value[columnId]?.isLoading ?? false
  }

  function hasMoreInColumn(columnId: TaskStatus): boolean {
    const meta = columnMeta.value[columnId]
    if (!meta) return false
    return (columnTasks.value[columnId]?.length ?? 0) < meta.total
  }

  async function loadColumnTasks(columnId: TaskStatus) {
    if (columnMeta.value[columnId]?.initialized) return

    columnMeta.value[columnId] = { skip: 0, total: 0, isLoading: true, initialized: false }

    const { data, total } = await tasksApi.getByProjectPaginated(projectId, {
      status: columnId,
      skip: 0,
      limit: COLUMN_PAGE_SIZE,
    })

    columnTasks.value[columnId] = data
    columnMeta.value[columnId] = { skip: data.length, total, isLoading: false, initialized: true }
  }

  async function loadMoreColumnTasks(columnId: TaskStatus) {
    const meta = columnMeta.value[columnId]
    if (!meta || meta.isLoading || !hasMoreInColumn(columnId)) return

    columnMeta.value[columnId] = { ...meta, isLoading: true }

    const { data } = await tasksApi.getByProjectPaginated(projectId, {
      status: columnId,
      skip: meta.skip,
      limit: COLUMN_PAGE_SIZE,
    })

    columnTasks.value[columnId] = [...(columnTasks.value[columnId] || []), ...data]
    columnMeta.value[columnId] = { ...meta, skip: meta.skip + data.length, isLoading: false }
  }

  // Sync single-task additions (creates via this user or socket) and deletions
  watch(
    () => tasks.value.length,
    (newLen, oldLen) => {
      if (newLen > oldLen) {
        // Addition: only handle one-at-a-time changes (socket/create events)
        if (newLen - oldLen > 1) return
        const task = tasks.value[tasks.value.length - 1]
        if (!task || task.projectId !== projectId) return
        const col = columnTasks.value[task.status as TaskStatus]
        if (!col) return
        if (!col.find(t => t._id === task._id)) {
          col.unshift(task)
          if (columnMeta.value[task.status]) columnMeta.value[task.status].total++
        }
      } else {
        // Deletion: remove from whichever column has the task
        const currentIds = new Set(tasks.value.map(t => t._id))
        for (const status of Object.keys(columnTasks.value) as TaskStatus[]) {
          const before = columnTasks.value[status].length
          columnTasks.value[status] = columnTasks.value[status].filter(t => currentIds.has(t._id))
          const removed = before - columnTasks.value[status].length
          if (removed > 0 && columnMeta.value[status]) {
            columnMeta.value[status].total = Math.max(0, columnMeta.value[status].total - removed)
          }
        }
      }
    }
  )

  // Sync cross-column moves from real-time socket events (task:updated with status change)
  const taskStatusMap = computed(() => {
    const map: Record<string, TaskStatus> = {}
    for (const t of tasks.value) {
      if (t.projectId === projectId) map[t._id] = t.status as TaskStatus
    }
    return map
  })

  watch(taskStatusMap, (newMap, oldMap) => {
    if (!oldMap) return
    for (const [id, newStatus] of Object.entries(newMap)) {
      const oldStatus = oldMap[id]
      if (!oldStatus || oldStatus === newStatus) continue
      // Task changed column via socket — move it in our per-column arrays
      if (columnTasks.value[oldStatus]) {
        columnTasks.value[oldStatus] = columnTasks.value[oldStatus].filter(t => t._id !== id)
        if (columnMeta.value[oldStatus]) {
          columnMeta.value[oldStatus].total = Math.max(0, columnMeta.value[oldStatus].total - 1)
        }
      }
      if (columnTasks.value[newStatus]) {
        const task = tasks.value.find(t => t._id === id)
        if (task && !columnTasks.value[newStatus].find(t => t._id === id)) {
          columnTasks.value[newStatus] = [task, ...columnTasks.value[newStatus]]
          if (columnMeta.value[newStatus]) columnMeta.value[newStatus].total++
        }
      }
    }
  })

  // Drag & Drop
  function onDragStart(task: Task) {
    draggedTask.value = task
  }

  function onDragEnd() {
    draggedTask.value = null
    dropTargetColumn.value = null
  }

  function onDragOver(columnId: TaskStatus) {
    dropTargetColumn.value = columnId
  }

  function onDragLeave(columnId: TaskStatus) {
    if (dropTargetColumn.value === columnId) {
      dropTargetColumn.value = null
    }
  }

  function onDrop(columnId: TaskStatus, insertIdx: number = -1) {
    if (!draggedTask.value) return
    const task = draggedTask.value

    if (task.status !== columnId) {
      // Cross-column: update per-column arrays optimistically
      const fromStatus = task.status as TaskStatus
      columnTasks.value[fromStatus] = (columnTasks.value[fromStatus] || []).filter(t => t._id !== task._id)
      if (columnMeta.value[fromStatus]) {
        columnMeta.value[fromStatus].total = Math.max(0, columnMeta.value[fromStatus].total - 1)
      }

      const updatedTask = { ...task, status: columnId }
      const targetTasks = [...(columnTasks.value[columnId] || [])]
      if (insertIdx >= 0 && insertIdx <= targetTasks.length) {
        targetTasks.splice(insertIdx, 0, updatedTask)
      } else {
        targetTasks.push(updatedTask)
      }
      columnTasks.value[columnId] = targetTasks
      if (columnMeta.value[columnId]) columnMeta.value[columnId].total++

      moveTask(task._id, columnId)
    } else if (insertIdx >= 0) {
      // Same-column reorder
      const colTasks = [...getColumnTasks(columnId)]
      const fromIndex = colTasks.findIndex(t => t._id === task._id)
      if (fromIndex !== -1) {
        colTasks.splice(fromIndex, 1)
        const toIndex = insertIdx > fromIndex ? insertIdx - 1 : insertIdx
        if (fromIndex !== toIndex) {
          colTasks.splice(toIndex, 0, task)
          columnTasks.value[columnId] = colTasks
          reorderTasks(colTasks)
        }
      }
    }

    draggedTask.value = null
    dropTargetColumn.value = null
  }

  function reorderTasksInColumn(columnId: TaskStatus, taskIds: string[]) {
    taskIds.forEach((taskId, index) => {
      const task = (columnTasks.value[columnId] || []).find(t => t._id === taskId)
      if (task) task.order = index + 1
    })
  }

  return {
    columns,
    draggedTask,
    dropTargetColumn,
    getColumnTasks,
    getColumnTotal,
    isColumnLoading,
    hasMoreInColumn,
    loadColumnTasks,
    loadMoreColumnTasks,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    reorderTasksInColumn,
  }
}
