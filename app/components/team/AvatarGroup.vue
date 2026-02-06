<template>
  <div class="flex items-center">
    <div
      v-for="(member, index) in visibleMembers"
      :key="member.id"
      class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm border-2 border-slate-800 -ml-2 first:ml-0"
      :title="member.name"
    >
      {{ member.avatar }}
    </div>
    <div
      v-if="remainingCount > 0"
      class="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-slate-800 -ml-2"
    >
      +{{ remainingCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

interface Props {
  members: TeamMember[]
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 4
})

const visibleMembers = computed(() => props.members.slice(0, props.max))
const remainingCount = computed(() => Math.max(0, props.members.length - props.max))
</script>
