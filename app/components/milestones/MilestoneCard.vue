<template>
  <div class="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 hover:border-slate-600/60 transition-all duration-200">
    <div class="flex items-start gap-3">
      <!-- Flag icon -->
      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :class="iconBg">
        <svg class="w-4 h-4" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="text-sm font-semibold text-white truncate">{{ milestone.name }}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ring-1" :class="statusClass">
            {{ statusLabel }}
          </span>
        </div>

        <p v-if="milestone.description" class="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {{ milestone.description }}
        </p>

        <!-- Progress bar -->
        <div class="mt-2.5">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] text-slate-500">Progress</span>
            <span class="text-[11px] font-medium" :class="milestone.progress === 100 ? 'text-emerald-400' : 'text-slate-400'">
              {{ milestone.progress }}%
            </span>
          </div>
          <div class="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="progressBarClass"
              :style="{ width: `${milestone.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-2.5">
          <div class="flex items-center gap-1 text-[11px]" :class="isOverdue ? 'text-rose-400' : 'text-slate-500'">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ isOverdue ? 'Overdue · ' : 'Due ' }}{{ formatDate(milestone.dueDate) }}
          </div>
          <div class="flex items-center gap-1">
            <button
              @click.stop="emit('edit', milestone)"
              class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
              title="Edit"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click.stop="emit('delete', milestone._id)"
              class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Delete"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Milestone } from '~/types'

const props = defineProps<{ milestone: Milestone }>()
const emit = defineEmits<{
  (e: 'edit', milestone: Milestone): void
  (e: 'delete', id: string): void
}>()

const isOverdue = computed(() =>
  props.milestone.status !== 'completed' && new Date(props.milestone.dueDate) < new Date()
)

const STATUS_LABELS: Record<string, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  overdue:     'Overdue',
}

const statusLabel = computed(() => STATUS_LABELS[props.milestone.status] ?? props.milestone.status)

const statusClass = computed(() => {
  const map: Record<string, string> = {
    pending:     'bg-slate-700/60 text-slate-400 ring-slate-600/30',
    in_progress: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    completed:   'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    overdue:     'bg-rose-500/10 text-rose-400 ring-rose-500/20',
  }
  return map[props.milestone.status] || map.pending
})

const iconBg = computed(() => {
  const map: Record<string, string> = {
    pending:     'bg-slate-700/50',
    in_progress: 'bg-blue-500/15',
    completed:   'bg-emerald-500/15',
    overdue:     'bg-rose-500/15',
  }
  return map[props.milestone.status] || 'bg-slate-700/50'
})

const iconColor = computed(() => {
  const map: Record<string, string> = {
    pending:     'text-slate-400',
    in_progress: 'text-blue-400',
    completed:   'text-emerald-400',
    overdue:     'text-rose-400',
  }
  return map[props.milestone.status] || 'text-slate-400'
})

const progressBarClass = computed(() =>
  props.milestone.progress === 100
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
    : 'bg-gradient-to-r from-indigo-500 to-blue-500'
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
