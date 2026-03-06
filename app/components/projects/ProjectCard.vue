<template>
  <NuxtLink :to="`/projects/${project._id}`">
    <BaseCard noPadding class="overflow-hidden hover:border-indigo-500/40 transition-all duration-200 cursor-pointer group">

      <!-- Cover Area -->
      <div class="relative h-36 overflow-hidden">
        <!-- Cover image or gradient fallback -->
        <div
          v-if="project.coverImage"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          :style="{ backgroundImage: `url(${project.coverImage})` }"
        />
        <div
          v-else
          :class="`absolute inset-0 bg-gradient-to-br ${getCoverGradient(project.key)} transition-transform duration-500 group-hover:scale-105`"
        />

        <!-- Bottom scrim for readability -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <!-- Action buttons - top right -->
        <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            @click.prevent.stop="copyLink"
            class="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
            title="Copy link"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            @click.prevent.stop="toggleFavorite"
            class="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all"
            :class="isFavorite ? 'text-amber-400 hover:bg-black/50' : 'text-white/70 hover:text-white hover:bg-black/50'"
            title="Favorite"
          >
            <svg class="w-3.5 h-3.5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        <!-- Join button (if not a member) -->
        <button
          v-if="memberStatus && !memberStatus.isMember"
          @click.prevent.stop="emit('request-join', project._id)"
          class="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-medium bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-full backdrop-blur-sm transition-colors"
        >
          + Join
        </button>

        <!-- Project avatar - bottom left -->
        <div
          :class="`absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-gradient-to-br ${getProjectGradient(project.key)} flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-black/20`"
        >
          {{ project.key.slice(0, 2) }}
        </div>
      </div>

      <!-- Info Area -->
      <div class="px-4 pt-3 pb-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="text-white font-semibold truncate leading-tight">{{ project.name }}</h3>
            <span class="text-[11px] font-mono text-gray-500 tracking-wide">{{ project.key }}</span>
          </div>
          <BaseBadge :color="project.status === 'active' ? 'emerald' : 'slate'" class="flex-shrink-0 mt-0.5">
            {{ formatStatus(project.status) }}
          </BaseBadge>
        </div>

        <!-- Task Progress -->
        <div v-if="totalTasks > 0" class="mt-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] text-gray-500">{{ doneTasks }}/{{ totalTasks }} tasks</span>
            <span class="text-[11px] font-medium" :class="taskProgress === 100 ? 'text-emerald-400' : 'text-gray-500'">{{ taskProgress }}%</span>
          </div>
          <div class="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="taskProgress === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'"
              :style="{ width: `${taskProgress}%` }"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
          <span class="text-[11px] text-gray-600">Created on {{ formatDate(project.createdAt) }}</span>
          <div class="flex items-center gap-1" :title="project.priority">
            <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="getPriorityDotClass(project.priority)" />
            <span :class="`text-[11px] font-medium capitalize ${getPriorityTextColor(project.priority)}`">{{ project.priority }}</span>
          </div>
        </div>
      </div>

    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types';

interface Props {
  project: Project
  memberStatus?: { isMember: boolean; role: string | null }
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'request-join': [projectId: string] }>()

const { tasksApi } = useApi()

const totalTasks = ref(0)
const doneTasks = ref(0)
const taskProgress = computed(() => totalTasks.value > 0 ? Math.round((doneTasks.value / totalTasks.value) * 100) : 0)
const isFavorite = ref(false)

onMounted(async () => {
  const counts = await tasksApi.getCounts(props.project._id)
  totalTasks.value = counts.total
  doneTasks.value = counts.byStatus['done'] ?? 0
})

function getCoverGradient(key: string): string {
  const gradients = [
    'from-blue-950 via-blue-900 to-sky-800',
    'from-violet-950 via-purple-900 to-indigo-800',
    'from-slate-900 via-slate-800 to-slate-700',
    'from-emerald-950 via-teal-900 to-cyan-800',
    'from-rose-950 via-rose-900 to-pink-800',
    'from-amber-950 via-orange-900 to-amber-800',
  ]
  return gradients[(key.charCodeAt(0) || 0) % gradients.length]!
}

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

function getPriorityDotClass(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-emerald-400',
    medium: 'bg-blue-400',
    high: 'bg-amber-400',
    critical: 'bg-rose-400',
  }
  return map[priority] || 'bg-gray-400'
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

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    archived: 'Archived',
  }
  return map[status] || status
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/projects/${props.project._id}`)
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}
</script>
