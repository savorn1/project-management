<template>
  <NuxtLink :to="`/projects/${project._id}`">
    <BaseCard class="h-full hover:border-indigo-500/40 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div :class="`w-10 h-10 rounded-lg bg-gradient-to-br ${getProjectGradient(project.key)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md`">
          {{ project.key.slice(0, 3) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-white font-semibold truncate">{{ project.name }}</h3>
            <span class="text-[10px] font-mono text-gray-500 bg-slate-700/60 px-1.5 py-0.5 rounded flex-shrink-0">{{ project.key }}</span>
          </div>
          <p class="text-gray-500 text-xs mt-0.5 line-clamp-2">{{ project.description || 'No description' }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
        <div class="flex items-center gap-2">
          <BaseBadge :color="project.status === 'active' ? 'emerald' : 'slate'">
            {{ project.status }}
          </BaseBadge>
          <button
            v-if="memberStatus && !memberStatus.isMember"
            @click.prevent.stop="emit('request-join', project._id)"
            class="px-2.5 py-0.5 text-xs font-medium bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 rounded-full ring-1 ring-indigo-500/25 transition-colors"
          >
            + Join
          </button>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-none">{{ getPriorityIcon(project.priority) }}</span>
          <span :class="`text-xs font-medium capitalize ${getPriorityTextColor(project.priority)}`">{{ project.priority }}</span>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types'

interface Props {
  project: Project
  memberStatus?: { isMember: boolean; role: string | null }
}

defineProps<Props>()
const emit = defineEmits<{ 'request-join': [projectId: string] }>()

function getProjectGradient(key: string): string {
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ]
  return gradients[(key.charCodeAt(0) || 0) % gradients.length]!
}

function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = { low: '🟢', medium: '🔵', high: '🟠', critical: '🔴' }
  return icons[priority] || '🔵'
}

function getPriorityTextColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-blue-400',
    high: 'text-amber-400',
    critical: 'text-rose-400',
  }
  return colors[priority] || 'text-gray-400'
}
</script>
