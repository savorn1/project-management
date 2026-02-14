<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span class="text-xl">📅</span>
        Upcoming Deadlines
      </h3>
      <span class="text-xs text-gray-500">Next 7 days</span>
    </div>

    <div class="space-y-2.5">
      <div
        v-for="task in upcomingDeadlines"
        :key="task._id"
        class="group relative p-3 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-700/50 transition-all duration-200"
      >
        <!-- Priority indicator bar -->
        <div
          class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity"
          :class="[
            priorityBarClass(task.priority),
            'opacity-60 group-hover:opacity-100'
          ]"
        ></div>

        <div class="flex items-start gap-3 pl-2">
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium text-sm mb-1 truncate">
              {{ task.title }}
            </p>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-gray-500">{{ task.key }}</span>
              <span class="text-gray-600">•</span>
              <span class="text-gray-400">{{ getProjectName(task.projectId) }}</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
              :class="dueDateClass(task.dueDate)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatRelativeDate(task.dueDate) }}</span>
            </div>
            <TaskPriorityBadge :priority="task.priority" class="scale-90" />
          </div>
        </div>
      </div>

      <EmptyState
        v-if="upcomingDeadlines.length === 0"
        icon="✅"
        title="No upcoming deadlines"
        description="All caught up for the next week"
        size="sm"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TaskPriority } from '~/types'
import { getDueDateStatus } from '~/utils/formatters'

const { upcomingDeadlines } = useDashboard()
const { getProjectById } = useProjects()

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown'
}

function priorityBarClass(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-slate-400',
    medium: 'bg-blue-400',
    high: 'bg-amber-400',
    urgent: 'bg-rose-400'
  }
  return colors[priority]
}

function dueDateClass(dueDate?: string): string {
  if (!dueDate) return 'bg-slate-700/50 text-gray-400'

  const status = getDueDateStatus(dueDate)
  if (status === 'overdue') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  if (status === 'today') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'

  const daysUntil = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil <= 2) return 'bg-amber-500/15 text-amber-300 border border-amber-500/25'

  return 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
}

function formatRelativeDate(dueDate?: string): string {
  if (!dueDate) return ''

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays <= 7) return `In ${diffDays} days`

  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
