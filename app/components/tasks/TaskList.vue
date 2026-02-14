<template>
  <div class="space-y-2">
    <div
      v-for="task in tasks"
      :key="task._id"
      class="group flex items-center gap-4 px-4 py-3.5 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 cursor-pointer"
      @click="$emit('select', task)"
    >
      <!-- Checkbox -->
      <button
        @click.stop="$emit('toggle', task._id)"
        class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
        :class="task.status === 'done'
          ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
          : 'border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10'"
      >
        <svg v-if="task.status === 'done'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <!-- Task Key -->
      <span class="text-[11px] font-mono text-gray-500 tracking-wide flex-shrink-0 w-20 truncate">
        {{ task.key }}
      </span>

      <!-- Title + Project -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2.5">
          <h4
            class="text-sm font-medium text-white truncate"
            :class="{ 'line-through text-gray-500': task.status === 'done' }"
          >
            {{ task.title }}
          </h4>
          <TaskPriorityBadge :priority="task.priority" />
        </div>
        <p class="text-xs text-gray-500 mt-0.5 truncate">{{ getProjectName(task.projectId) }}</p>
      </div>

      <!-- Sprint badge -->
      <span
        v-if="task.sprintId && getSprintName(task.sprintId, task.projectId)"
        class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/25"
      >
        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {{ getSprintName(task.sprintId, task.projectId) }}
      </span>

      <!-- Assignee -->
      <div v-if="getAssignee(task.assigneeId)" class="flex-shrink-0">
        <div
          class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium ring-2 ring-slate-900"
          :title="getAssignee(task.assigneeId)?.name"
        >
          {{ getInitials(getAssignee(task.assigneeId)?.name) }}
        </div>
      </div>

      <!-- Due Date -->
      <div class="flex-shrink-0 flex items-center gap-1 text-xs min-w-[70px] justify-end" :class="getDueDateClass(task)">
        <svg v-if="task.dueDate" class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ task.dueDate ? formatShortDate(task.dueDate) : '-' }}
      </div>

      <!-- Status Badge -->
      <BaseBadge :color="getStatusColor(task.status)" size="xs">
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
  (e: 'select', task: Task): void
}>()

const { getProjectById } = useProjects()
const { getMemberById } = useTeam()
const { getProjectSprints } = useSprints()

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
}

function getSprintName(sprintId: string, projectId: string): string | null {
  const sprints = getProjectSprints(projectId)
  return sprints.find(s => s._id === sprintId)?.name || null
}

function getAssignee(assigneeId: string | null) {
  if (!assigneeId) return null
  return getMemberById(assigneeId)
}

function getDueDateClass(task: Task): string {
  if (task.status === 'done') return 'text-gray-600'
  const status = getDueDateStatus(task.dueDate)
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-500'
}

function getStatusColor(status: TaskStatus): 'slate' | 'blue' | 'amber' | 'emerald' {
  const colors: Record<TaskStatus, 'slate' | 'blue' | 'amber' | 'emerald'> = {
    todo: 'slate',
    in_progress: 'blue',
    in_review: 'amber',
    done: 'emerald'
  }
  return colors[status]
}

function getStatusLabel(status: TaskStatus): string {
  return STATUS_CONFIG[status].label
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}
</script>
