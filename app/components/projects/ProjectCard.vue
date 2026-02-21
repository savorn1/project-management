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
        <div class="flex items-center gap-2">
          <BaseBadge :color="project.status === 'active' ? 'emerald' : 'slate'">
            {{ project.status }}
          </BaseBadge>
          <!-- Non-member join button -->
          <button
            v-if="memberStatus && !memberStatus.isMember"
            @click.prevent.stop="emit('request-join', project._id)"
            class="px-2.5 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-full ring-1 ring-indigo-500/30 transition-colors"
          >
            + Join
          </button>
        </div>
        <span class="text-gray-500 text-sm font-mono">{{ project.key }}</span>
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
</script>
