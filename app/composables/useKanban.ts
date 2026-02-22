import type { Task, TaskStatus } from '~/types'
import { KANBAN_COLUMNS } from '~/utils/constants'

export function useKanban(projectId: string) {
  const { tasks, getTasksByStatus, moveTask, updateTask } = useTasks()

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

  function onDrop(columnId: TaskStatus) {
    if (draggedTask.value && draggedTask.value.status !== columnId) {
      moveTask(draggedTask.value._id, columnId)
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
