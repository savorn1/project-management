<template>
  <div
    class="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group"
    :class="{ 'opacity-60': task.status === 'done' }"
    draggable="true"
    @dragstart="$emit('dragstart', task)"
    @dragend="$emit('dragend')"
  >
    <div class="flex items-start gap-3">
      <button
        @click.stop="$emit('toggle', task._id)"
        class="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0"
        :class="task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-indigo-500'"
      >
        <span v-if="task.status === 'done'" class="text-white text-xs">✓</span>
      </button>

      <div class="flex-1 min-w-0">
        <h4
          class="text-white font-medium truncate"
          :class="{ 'line-through': task.status === 'done' }"
        >
          {{ task.title }}
        </h4>

        <p v-if="task.description" class="text-gray-400 text-sm mt-1 line-clamp-2">
          {{ task.description }}
        </p>

        <div class="flex items-center gap-2 mt-3">
          <TaskPriorityBadge :priority="task.priority" />

          <span v-if="task.dueDate" class="text-xs" :class="dueDateClass">
            {{ formatShortDate(task.dueDate) }}
          </span>
        </div>
      </div>

      <div v-if="assignee" class="flex-shrink-0">
        <div
          class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm"
          :title="assignee.name"
        >
          {{ assignee.avatar }}
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
  (e: 'dragstart', task: Task): void
  (e: 'dragend'): void
}>()

const assignee = computed(() => {
  if (!props.task.assigneeId) return null
  return getMemberById(props.task.assigneeId)
})

const dueDateClass = computed(() => {
  const status = getDueDateStatus(props.task.dueDate)
  if (props.task.status === 'done') return 'text-gray-500'
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-400'
})
</script>
