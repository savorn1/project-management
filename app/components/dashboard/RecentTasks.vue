<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span class="text-xl">📝</span>
        Recent Tasks
      </h3>
      <NuxtLink
        to="/tasks"
        class="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 group"
      >
        <span>View all</span>
        <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <div class="space-y-2.5">
      <div
        v-for="task in recentTasks"
        :key="task._id"
        class="group relative p-3 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-700/50 transition-all duration-200 overflow-hidden"
      >
        <!-- Priority indicator bar -->
        <div
          class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity"
          :class="[
            priorityBarClass(task.priority),
            'opacity-50 group-hover:opacity-100'
          ]"
        ></div>

        <div class="flex items-center gap-3 pl-2">
          <button
            @click="toggleTask(task._id)"
            class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            :class="task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'border-gray-500 hover:border-indigo-500 hover:scale-110'"
          >
            <svg
              v-if="task.status === 'done'"
              class="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <div class="flex-1 min-w-0">
            <p
              class="text-white font-medium text-sm mb-1 truncate"
              :class="{ 'line-through opacity-50': task.status === 'done' }"
            >
              {{ task.title }}
            </p>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-gray-500 font-mono">{{ task.key }}</span>
              <span class="text-gray-600">•</span>
              <span class="text-gray-400">{{ getProjectName(task.projectId) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <TaskPriorityBadge :priority="task.priority" class="scale-90" />
            <div
              v-if="task.status !== 'done'"
              class="w-2 h-2 rounded-full"
              :class="statusDotClass(task.status)"
            ></div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="recentTasks.length === 0"
        icon="📋"
        title="No recent tasks"
        description="Tasks you work on will appear here"
        size="sm"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TaskPriority, TaskStatus } from '~/types'

const { recentTasks } = useDashboard()
const { toggleTaskComplete } = useTasks()
const { getProjectById } = useProjects()

function toggleTask(id: string) {
  toggleTaskComplete(id)
}

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
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

function statusDotClass(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: 'bg-slate-400',
    in_progress: 'bg-blue-400 animate-pulse',
    in_review: 'bg-amber-400',
    done: 'bg-emerald-400'
  }
  return colors[status]
}
</script>
