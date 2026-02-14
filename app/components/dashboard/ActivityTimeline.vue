<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span class="text-xl">⚡</span>
        Recent Activity
      </h3>
    </div>

    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-[17px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent"></div>

      <div class="space-y-3">
        <div
          v-for="(activity, index) in activityTimeline"
          :key="activity.id"
          class="relative flex gap-3 group"
        >
          <!-- Timeline dot -->
          <div class="relative flex-shrink-0 z-10">
            <div
              class="w-[10px] h-[10px] rounded-full ring-4 ring-slate-800 transition-all duration-200"
              :class="[
                activityDotClass(activity.action),
                'group-hover:scale-125 group-hover:ring-slate-700'
              ]"
            ></div>
          </div>

          <!-- Activity content -->
          <div class="flex-1 min-w-0 pb-3">
            <div class="p-2.5 bg-slate-700/30 rounded-lg border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-700/50 transition-all duration-200">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p class="text-white text-sm font-medium truncate">
                  {{ activity.title }}
                </p>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                  :class="actionBadgeClass(activity.action)"
                >
                  {{ activity.action }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span>{{ getProjectName(activity.projectId) }}</span>
                <span class="text-gray-600">•</span>
                <span>{{ formatTimeAgo(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="activityTimeline.length === 0"
        icon="📋"
        title="No recent activity"
        description="Activity will appear here as you work"
        size="sm"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { activityTimeline } = useDashboard()
const { getProjectById } = useProjects()

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown'
}

function activityDotClass(action: string): string {
  if (action === 'completed') return 'bg-emerald-500'
  if (action === 'created') return 'bg-blue-500'
  return 'bg-indigo-500'
}

function actionBadgeClass(action: string): string {
  if (action === 'completed') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  if (action === 'created') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
  return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
