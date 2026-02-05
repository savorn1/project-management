<template>
  <NuxtLink :to="`/projects/${project.id}`">
    <BaseCard class="h-full hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
      <div class="flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          :class="getColorClass(project.color)"
        >
          {{ project.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold truncate">{{ project.name }}</h3>
          <p class="text-gray-400 text-sm mt-1 line-clamp-2">{{ project.description }}</p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="text-gray-400">Progress</span>
          <span class="text-white font-medium">{{ project.progress }}%</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="getProgressColor(project.color)"
            :style="{ width: `${project.progress}%` }"
          ></div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
        <AvatarGroup :members="project.members" :max="3" />
        <div class="text-gray-400 text-sm">
          {{ project.tasks.length }} tasks
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project, Task, TeamMember } from '~/types'

interface ProjectWithStats extends Project {
  progress: number
  tasks: Task[]
  members: TeamMember[]
}

interface Props {
  project: ProjectWithStats
}

defineProps<Props>()

function getColorClass(color: string): string {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    emerald: 'bg-emerald-500/20',
    amber: 'bg-amber-500/20',
    rose: 'bg-rose-500/20',
    cyan: 'bg-cyan-500/20',
    violet: 'bg-violet-500/20',
    pink: 'bg-pink-500/20',
    teal: 'bg-teal-500/20'
  }
  return colors[color] || 'bg-indigo-500/20'
}

function getProgressColor(color: string): string {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500'
  }
  return colors[color] || 'bg-indigo-500'
}
</script>
