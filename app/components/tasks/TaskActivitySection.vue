<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm">Loading activity...</p>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div v-else-if="activities.length > 0" class="relative">
      <!-- Timeline line -->
      <div class="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-slate-700/50 via-slate-700/30 to-transparent"></div>

      <div class="space-y-1">
        <div
          v-for="activity in activities"
          :key="activity._id"
          class="relative flex gap-3 items-start py-2.5 px-2 rounded-lg hover:bg-slate-800/30 transition-colors group"
        >
          <!-- Icon circle -->
          <div
            class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-slate-900"
            :class="actionIconStyle(activity.action).bg"
          >
            <svg class="w-3.5 h-3.5" :class="actionIconStyle(activity.action).text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="actionIconStyle(activity.action).icon" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <p class="text-sm text-gray-300 leading-relaxed">
              <span class="font-medium text-white">{{ activity.user?.name || 'Unknown' }}</span>{{ ' ' }}<span class="text-gray-500">{{ getActionDescription(activity) }}</span>
            </p>
            <p class="text-[11px] text-gray-600 mt-0.5">{{ formatRelative(activity.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-10">
      <div class="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3 ring-1 ring-slate-700/30">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-gray-500 text-sm font-medium">No activity yet</p>
      <p class="text-gray-600 text-xs mt-1">Changes will appear here</p>
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

interface ActionStyle {
  bg: string
  text: string
  icon: string
}

function actionIconStyle(action: string): ActionStyle {
  switch (action) {
    case 'created':
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        icon: 'M12 4v16m8-8H4',
      }
    case 'status_changed':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
      }
    case 'priority_changed':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      }
    case 'assigned':
    case 'unassigned':
      return {
        bg: 'bg-indigo-500/20',
        text: 'text-indigo-400',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      }
    case 'due_date_changed':
      return {
        bg: 'bg-violet-500/20',
        text: 'text-violet-400',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      }
    case 'title_changed':
    case 'description_changed':
      return {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-400',
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      }
    case 'comment_added':
      return {
        bg: 'bg-teal-500/20',
        text: 'text-teal-400',
        icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      }
    default:
      return {
        bg: 'bg-slate-700/50',
        text: 'text-gray-400',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      }
  }
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
</script>
