<template>
  <NuxtLink :to="`/projects/${project._id}`">
    <BaseCard class="h-full hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-2xl">
          📁
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold truncate">{{ project.name }}</h3>
          <p class="text-gray-400 text-sm mt-1 line-clamp-2">{{ project.description }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
        <BaseBadge :color="project.status === 'active' ? 'emerald' : 'slate'">
          {{ project.status }}
        </BaseBadge>
        <span class="text-gray-500 text-sm font-mono">{{ project.key }}</span>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types'

interface Props {
  project: Project
}

defineProps<Props>()
</script>
