<template>
  <BaseCard class="hover:border-indigo-500/50 transition-colors">
    <div class="flex flex-col items-center text-center">
      <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-3xl mb-4">
        {{ member.avatar }}
      </div>

      <h3 class="text-white font-semibold">{{ member.name }}</h3>
      <p class="text-gray-400 text-sm">{{ member.email }}</p>

      <BaseBadge :color="getRoleColor(member.role)" class="mt-3">
        {{ member.role }}
      </BaseBadge>

      <div class="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700 w-full">
        <div class="flex-1 text-center">
          <p class="text-xl font-bold text-white">{{ member.taskCount }}</p>
          <p class="text-gray-400 text-xs">Total Tasks</p>
        </div>
        <div class="flex-1 text-center">
          <p class="text-xl font-bold text-indigo-400">{{ member.activeTasks }}</p>
          <p class="text-gray-400 text-xs">Active</p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

interface MemberWithStats extends TeamMember {
  taskCount: number
  activeTasks: number
}

interface Props {
  member: MemberWithStats
}

defineProps<Props>()

function getRoleColor(role: string): 'indigo' | 'emerald' | 'amber' | 'violet' {
  const colors: Record<string, 'indigo' | 'emerald' | 'amber' | 'violet'> = {
    admin: 'indigo',
    manager: 'emerald',
    developer: 'amber',
    designer: 'violet'
  }
  return colors[role] || 'slate'
}
</script>
