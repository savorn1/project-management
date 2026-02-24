import type { Task, TaskStatus } from '~/types'
import { KANBAN_COLUMNS } from '~/utils/constants'

export function useKanban(projectId: string) {
  const { tasks, getTasksByStatus, moveTask, updateTask, reorderTasks } = useTasks()

  const columns = ref(KANBAN_COLUMNS)
  const draggedTask = ref<Task | null>(null)
  const dropTargetColumn = ref<TaskStatus | null>(null)

  function getColumnTasks(columnId: TaskStatus): Task[] {
    return getTasksByStatus(columnId, projectId)
  }

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

    if (draggedTask.value.status !== columnId) {
      // Cross-column: change status
      moveTask(draggedTask.value._id, columnId)
    } else if (insertIdx >= 0) {
      // Same-column: reorder by position
      const colTasks = getColumnTasks(columnId)
      const fromIndex = colTasks.findIndex(t => t._id === draggedTask.value!._id)
      if (fromIndex !== -1) {
        const newOrder = [...colTasks]
        newOrder.splice(fromIndex, 1)
        const toIndex = insertIdx > fromIndex ? insertIdx - 1 : insertIdx
        if (fromIndex !== toIndex) {
          newOrder.splice(toIndex, 0, draggedTask.value)
          reorderTasks(newOrder)
        }
      }
    }

    draggedTask.value = null
    dropTargetColumn.value = null
  }

  function reorderTasksInColumn(columnId: TaskStatus, taskIds: string[]) {
    taskIds.forEach((taskId, index) => {
      updateTask(taskId, { order: index + 1 })
    })
  }

  return {
    columns,
    draggedTask,
    dropTargetColumn,
    getColumnTasks,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    reorderTasksInColumn
  }
}
