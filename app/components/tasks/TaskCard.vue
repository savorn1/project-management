<template>
  <div
    class="group relative p-4 bg-slate-800/60 rounded-xl border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
    :class="{ 'opacity-50': task.status === 'done' }"
    draggable="true"
    @dragstart="$emit('dragstart', task)"
    @dragend="$emit('dragend')"
    @click="$emit('select', task)"
  >
    <!-- Top row: key + priority -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-[11px] font-mono text-gray-500 tracking-wide">{{ task.key }}</span>
      <span
        class="w-2 h-2 rounded-full flex-shrink-0"
        :class="priorityDotClass"
        :title="task.priority"
      ></span>
    </div>

    <!-- Title -->
    <h4
      class="text-sm font-medium text-white leading-snug mb-2"
      :class="{ 'line-through text-gray-500': task.status === 'done' }"
    >
      {{ task.title }}
    </h4>

    <!-- Description preview -->
    <p v-if="task.description && task.status !== 'done'" class="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
      {{ stripHtml(task.description) }}
    </p>

    <!-- Bottom row: priority badge + due date + assignee -->
    <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/30">
      <div class="flex items-center gap-2">
        <TaskPriorityBadge :priority="task.priority" />

        <span v-if="task.dueDate" class="inline-flex items-center gap-1 text-[11px]" :class="dueDateClass">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatShortDate(task.dueDate) }}
        </span>
      </div>

      <div v-if="assignee" class="flex-shrink-0">
        <div
          class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium ring-2 ring-slate-800"
          :title="assignee.name"
        >
          {{ getInitials(assignee.name) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types'
import { formatShortDate, getDueDateStatus } from '~/utils/formatters'

const { getMemberById } = useTeam()

interface Props {
  task: Task
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'select', task: Task): void
  (e: 'dragstart', task: Task): void
  (e: 'dragend'): void
}>()

const assignee = computed(() => {
  if (!props.task.assigneeId) return null
  return getMemberById(props.task.assigneeId)
})

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

const priorityDotClass = computed(() => {
  const map: Record<string, string> = {
    low: 'bg-slate-400',
    medium: 'bg-blue-400',
    high: 'bg-amber-400',
    urgent: 'bg-rose-400 animate-pulse',
  }
  return map[props.task.priority] || 'bg-slate-400'
})

const dueDateClass = computed(() => {
  const status = getDueDateStatus(props.task.dueDate)
  if (props.task.status === 'done') return 'text-gray-600'
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-500'
})
</script>
