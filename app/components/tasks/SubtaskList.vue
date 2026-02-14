<template>
  <div class="space-y-3">
    <!-- Header with count + Add button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Sub-tasks{{ subtasks.length ? ` (${subtasks.length})` : '' }}
        </span>
      </div>
      <button
        @click="$emit('add')"
        class="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </div>

    <!-- Subtask rows -->
    <div v-if="subtasks.length > 0" class="space-y-1">
      <div
        v-for="subtask in subtasks"
        :key="subtask._id"
        @click="$emit('select', subtask)"
        class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/50 cursor-pointer transition-all duration-150 group"
      >
        <!-- Status dot -->
        <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotClass(subtask.status)"></span>
        <!-- Key -->
        <span class="text-[10px] font-mono text-gray-500 flex-shrink-0">{{ subtask.key }}</span>
        <!-- Title -->
        <span
          class="text-sm text-gray-300 truncate flex-1"
          :class="{ 'line-through text-gray-600': subtask.status === 'done' }"
        >
          {{ subtask.title }}
        </span>
        <!-- Priority badge -->
        <TaskPriorityBadge :priority="subtask.priority" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-xs text-gray-600 text-center py-2">
      No sub-tasks yet
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'

interface Props {
  taskId: string
  tasks: Task[]
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'select', task: Task): void
  (e: 'add'): void
}>()

const subtasks = computed(() =>
  props.tasks.filter(t => t.parentId === props.taskId)
)

function statusDotClass(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: 'bg-slate-400',
    in_progress: 'bg-blue-400',
    in_review: 'bg-amber-400',
    done: 'bg-emerald-400',
  }
  return map[status] || 'bg-slate-400'
}
</script>
