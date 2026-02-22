<template>
  <NuxtLink :to="`/projects/${project._id}`">
    <BaseCard class="h-full hover:border-indigo-500/40 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer flex flex-col">
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
          <p
            class="text-xs mt-0.5 line-clamp-2"
            :class="project.description ? 'text-gray-500' : 'text-gray-600 italic'"
          >
            {{ project.description || 'Describe your vision...' }}
          </p>
        </div>
      </div>

      <!-- Task progress (only shown when tasks are loaded in store) -->
      <div v-if="totalTasks > 0" class="mt-3 pt-3 border-t border-slate-700/30">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-gray-500">{{ doneTasks }}/{{ totalTasks }} tasks</span>
          <span class="text-[11px] font-medium" :class="taskProgress === 100 ? 'text-emerald-400' : 'text-gray-500'">{{ taskProgress }}%</span>
        </div>
        <div class="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="taskProgress === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'"
            :style="{ width: `${taskProgress}%` }"
          ></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50" :class="totalTasks > 0 ? 'mt-3' : 'mt-4'">
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
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-gray-600">{{ formatRelativeTime(project.updatedAt) }}</span>
          <div class="flex items-center gap-1" :title="project.priority">
            <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="getPriorityDotClass(project.priority)"></span>
            <span :class="`text-xs font-medium capitalize ${getPriorityTextColor(project.priority)}`">{{ project.priority }}</span>
          </div>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { formatRelativeTime } from '~/utils/formatters'

interface Props {
  project: Project
  memberStatus?: { isMember: boolean; role: string | null }
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'request-join': [projectId: string] }>()

const { getTasksByProject } = useTasks()
const cardTasks = computed(() => getTasksByProject(props.project._id))
const totalTasks = computed(() => cardTasks.value.length)
const doneTasks = computed(() => cardTasks.value.filter(t => t.status === 'done').length)
const taskProgress = computed(() => totalTasks.value > 0 ? Math.round((doneTasks.value / totalTasks.value) * 100) : 0)

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
</script>
