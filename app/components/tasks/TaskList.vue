<template>
  <div class="space-y-3">
    <div
      v-for="task in tasks"
      :key="task._id"
      class="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <button
        @click="$emit('toggle', task._id)"
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0"
        :class="task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-indigo-500'"
      >
        <span v-if="task.status === 'done'" class="text-white text-xs">✓</span>
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3">
          <h4
            class="text-white font-medium truncate"
            :class="{ 'line-through opacity-50': task.status === 'done' }"
          >
            {{ task.title }}
          </h4>
          <TaskPriorityBadge :priority="task.priority" />
        </div>
        <p class="text-gray-400 text-sm mt-1">{{ getProjectName(task.projectId) }}</p>
      </div>

      <div v-if="getAssignee(task.assigneeId)" class="flex-shrink-0">
        <div
          class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm"
          :title="getAssignee(task.assigneeId)?.name"
        >
          {{ getAssignee(task.assigneeId)?.avatar }}
        </div>
      </div>

      <div class="flex-shrink-0 text-sm" :class="getDueDateClass(task)">
        {{ task.dueDate ? formatShortDate(task.dueDate) : '-' }}
      </div>

      <BaseBadge :color="getStatusColor(task.status)">
        {{ getStatusLabel(task.status) }}
      </BaseBadge>
    </div>

    <EmptyState
      v-if="tasks.length === 0"
      icon="✅"
      title="No tasks found"
      description="Try adjusting your filters or create a new task"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'
import { formatShortDate, getDueDateStatus } from '~/utils/formatters'
import { STATUS_CONFIG } from '~/utils/constants'

interface Props {
  tasks: Task[]
}

defineProps<Props>()

defineEmits<{
  (e: 'toggle', id: string): void
}>()

const { getProjectById } = useProjects()
const { getMemberById } = useTeam()

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
}

function getAssignee(assigneeId: string | null) {
  if (!assigneeId) return null
  return getMemberById(assigneeId)
}

function getDueDateClass(task: Task): string {
  if (task.status === 'done') return 'text-gray-500'
  const status = getDueDateStatus(task.dueDate)
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-400'
}

function getStatusColor(status: TaskStatus): 'slate' | 'blue' | 'amber' | 'emerald' {
  const colors: Record<TaskStatus, 'slate' | 'blue' | 'amber' | 'emerald'> = {
    todo: 'slate',
    in_progress: 'blue',
    review: 'amber',
    done: 'emerald'
  }
  return colors[status]
}

function getStatusLabel(status: TaskStatus): string {
  return STATUS_CONFIG[status].label
}
</script>
