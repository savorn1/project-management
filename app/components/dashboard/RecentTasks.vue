<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Recent Tasks</h3>
      <NuxtLink to="/tasks" class="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
        View all
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="task in recentTasks"
        :key="task.id"
        class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <button
          @click="toggleTask(task.id)"
          class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
          :class="task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-indigo-500'"
        >
          <span v-if="task.status === 'done'" class="text-white text-xs">✓</span>
        </button>

        <div class="flex-1 min-w-0">
          <p class="text-white font-medium truncate" :class="{ 'line-through opacity-50': task.status === 'done' }">
            {{ task.title }}
          </p>
          <p class="text-gray-400 text-sm">{{ getProjectName(task.projectId) }}</p>
        </div>

        <BaseBadge :color="getPriorityColor(task.priority)">
          {{ task.priority }}
        </BaseBadge>
      </div>

      <EmptyState
        v-if="recentTasks.length === 0"
        icon="📋"
        title="No recent tasks"
        description="Tasks you work on will appear here"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TaskPriority } from '~/types'
import { getProjectById } from '~/data/mockData'

const { recentTasks } = useDashboard()
const { toggleTaskComplete } = useTasks()

function toggleTask(id: string) {
  toggleTaskComplete(id)
}

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
}

function getPriorityColor(priority: TaskPriority): 'slate' | 'blue' | 'amber' | 'rose' {
  const colors: Record<TaskPriority, 'slate' | 'blue' | 'amber' | 'rose'> = {
    low: 'slate',
    medium: 'blue',
    high: 'amber',
    urgent: 'rose'
  }
  return colors[priority]
}
</script>
