<template>
  <div class="grid grid-cols-4 gap-4 h-[calc(100vh-16rem)]">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      :tasks="getColumnTasks(column.id)"
      :is-drop-target="dropTargetColumn === column.id"
      @add-task="handleAddTask(column.id)"
      @toggle-task="toggleTaskComplete"
      @select-task="(task: Task) => emit('select-task', task)"
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
      @drag-over="onDragOver(column.id)"
      @drag-leave="onDragLeave(column.id)"
      @drop="onDrop(column.id)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-task', status: TaskStatus): void
  (e: 'select-task', task: Task): void
}>()

const {
  columns,
  dropTargetColumn,
  getColumnTasks,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
} = useKanban(props.projectId)

const { toggleTaskComplete } = useTasks()

function handleAddTask(status: TaskStatus) {
  emit('add-task', status)
}
</script>
