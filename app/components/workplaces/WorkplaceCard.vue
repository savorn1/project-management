<template>
  <NuxtLink :to="`/workplaces/${workplace._id}`">
    <BaseCard class="h-full hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-2xl">
          🏢
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold truncate">{{ workplace.name }}</h3>
          <p class="text-gray-400 text-sm mt-1">{{ workplace.slug }}</p>
        </div>
        <BaseBadge :color="planColor">
          {{ workplace.plan }}
        </BaseBadge>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <span>📁</span>
          <span>{{ projectCount }} projects</span>
        </div>
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <span>👥</span>
          <span>{{ memberCount }} members</span>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Workplace } from '~/types'

interface Props {
  workplace: Workplace
  projectCount?: number
  memberCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  projectCount: 0,
  memberCount: 0
})

const planColor = computed((): 'slate' | 'blue' | 'amber' => {
  const colors: Record<string, 'slate' | 'blue' | 'amber'> = {
    free: 'slate',
    pro: 'blue',
    enterprise: 'amber'
  }
  return colors[props.workplace.plan] || 'slate'
})
</script>
