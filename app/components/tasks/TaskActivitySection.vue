<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-400 text-sm">Loading activity...</p>
    </div>

    <!-- Activity List -->
    <div v-else-if="activities.length > 0" class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity._id"
        class="flex gap-3 items-start"
      >
        <div class="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-xs text-gray-300 flex-shrink-0 mt-0.5">
          {{ getInitials(activity.user?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-300">
            <span class="font-medium text-white">{{ activity.user?.name || 'Unknown' }}</span>
            {{ getActionDescription(activity) }}
          </p>
          <p class="text-xs text-gray-500 mt-0.5">{{ formatRelative(activity.createdAt) }}</p>
        </div>
        <div class="flex-shrink-0">
          <span class="text-base">{{ getActionIcon(activity.action) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6">
      <p class="text-gray-500 text-sm">No activity recorded yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskActivity } from '~/types'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

const { activities, isLoading, loadActivities } = useTaskActivity()

watch(() => props.taskId, (id) => {
  if (id) loadActivities(id)
}, { immediate: true })

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

function getActionDescription(activity: TaskActivity): string {
  const meta = activity.meta || {}

  switch (activity.action) {
    case 'created':
      return 'created this task'
    case 'status_changed':
      return `changed status to ${STATUS_LABELS[meta.to as string] || meta.to}`
    case 'priority_changed':
      return `changed priority to ${PRIORITY_LABELS[meta.to as string] || meta.to}`
    case 'assigned':
      return `assigned this task to ${meta.assigneeName || 'someone'}`
    case 'unassigned':
      return 'unassigned this task'
    case 'due_date_changed':
      return meta.to ? `set due date to ${new Date(meta.to as string).toLocaleDateString()}` : 'removed the due date'
    case 'title_changed':
      return 'updated the title'
    case 'description_changed':
      return 'updated the description'
    case 'comment_added':
      return 'added a comment'
    case 'sprint_changed':
      return 'moved to a different sprint'
    case 'label_added':
      return 'added a label'
    case 'label_removed':
      return 'removed a label'
    case 'file_attached':
      return 'attached a file'
    case 'file_removed':
      return 'removed a file'
    default:
      return `performed action: ${activity.action}`
  }
}

function getActionIcon(action: string): string {
  switch (action) {
    case 'created': return '+'
    case 'status_changed': return '~'
    case 'priority_changed': return '!'
    case 'assigned':
    case 'unassigned': return '@'
    case 'due_date_changed': return '#'
    case 'title_changed':
    case 'description_changed': return '*'
    case 'comment_added': return '>'
    default: return '-'
  }
}
</script>
