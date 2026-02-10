<template>
  <BaseCard class="hover:border-indigo-500/50 transition-colors">
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0"
        :class="member.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'"
      >
        {{ initials }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-white font-semibold truncate">{{ member.name }}</h3>
          <span
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="member.isActive ? 'bg-emerald-400' : 'bg-slate-500'"
            :title="member.isActive ? 'Active' : 'Inactive'"
          />
        </div>
        <p class="text-gray-400 text-sm truncate">{{ member.email }}</p>

        <div class="flex items-center gap-2 mt-3">
          <BaseBadge :color="getRoleColor(member.role)">
            {{ formatRole(member.role) }}
          </BaseBadge>
          <span v-if="member.lastLogin" class="text-gray-500 text-xs">
            Last login: {{ formatDate(member.lastLogin) }}
          </span>
        </div>
      </div>

      <div class="flex gap-1 flex-shrink-0">
        <button
          @click="$emit('edit', member)"
          class="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          title="Edit user"
        >
          ✏️
        </button>
        <button
          v-if="!isSelf"
          @click="$emit('delete', member)"
          class="p-2 text-gray-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
          title="Delete user"
        >
          🗑️
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

interface Props {
  member: TeamMember
  currentUserId?: string
}

const props = defineProps<Props>()

const isSelf = computed(() => props.currentUserId && props.member._id === props.currentUserId)

defineEmits<{
  edit: [member: TeamMember]
  delete: [member: TeamMember]
}>()

const initials = computed(() => {
  const parts = props.member.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  }
  return parts[0]!.charAt(0).toUpperCase()
})

function getRoleColor(role: string): 'indigo' | 'emerald' {
  return role === 'super_admin' ? 'indigo' : 'emerald'
}

function formatRole(role: string): string {
  return role === 'super_admin' ? 'Super Admin' : 'Admin'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
