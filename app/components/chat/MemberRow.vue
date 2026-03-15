<template>
  <div
    class="group/row flex items-center gap-2.5 px-3 py-2 mx-2 rounded-xl transition-colors cursor-default"
    :class="[
      participantId === currentUserId ? 'bg-indigo-500/8' : 'hover:bg-slate-800/50',
      blockedMembers?.includes(participantId) ? 'opacity-40' : '',
    ]"
  >
    <!-- Avatar -->
    <div class="relative flex-shrink-0">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br"
        :class="avatarGradient"
      >
        {{ (memberMap.get(participantId) ?? '?').charAt(0).toUpperCase() }}
      </div>
      <!-- Online dot -->
      <span
        class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
        :class="isOnline ? 'bg-emerald-400' : 'bg-slate-600'"
      />
    </div>

    <!-- Name + info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5 min-w-0">
        <p class="text-xs font-medium truncate" :class="participantId === currentUserId ? 'text-indigo-300' : 'text-gray-200'">
          {{ memberMap.get(participantId) ?? participantId.slice(-4) }}
        </p>
        <!-- You badge -->
        <span v-if="participantId === currentUserId" class="shrink-0 text-[9px] font-semibold px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400 leading-none">
          YOU
        </span>
        <!-- Admin badge -->
        <span v-if="admins?.includes(participantId)" class="shrink-0 text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 leading-none">
          ADMIN
        </span>
        <!-- Blocked badge -->
        <span v-if="blockedMembers?.includes(participantId)" class="shrink-0 text-[9px] font-semibold px-1 py-0.5 rounded bg-red-500/15 text-red-400 leading-none">
          BLOCKED
        </span>
      </div>

      <!-- Custom status -->
      <p v-if="customStatus?.text" class="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
        {{ customStatus.emoji }} {{ customStatus.text }}
      </p>
      <!-- Last seen (only when no custom status) -->
      <p v-else class="text-[10px] truncate leading-tight mt-0.5" :class="isOnline ? 'text-emerald-400/70' : 'text-gray-600'">
        {{ lastSeen }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
      <!-- Spinner -->
      <div v-if="actionLoading" class="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />

      <template v-else>
        <!-- Self → leave -->
        <button
          v-if="participantId === currentUserId"
          @click="$emit('leave')"
          class="w-6 h-6 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Leave group"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <!-- Admin actions on other members -->
        <template v-else-if="isAdmin">
          <!-- Block / Unblock -->
          <button
            @click="$emit('block')"
            class="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
            :class="blockedMembers?.includes(participantId)
              ? 'text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10'
              : 'text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-500/10'"
            :title="blockedMembers?.includes(participantId) ? 'Unblock' : 'Block'"
          >
            <svg v-if="blockedMembers?.includes(participantId)" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
            </svg>
          </button>

          <!-- Remove -->
          <button
            @click="$emit('remove')"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Remove from group"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  participantId: string
  currentUserId: string | undefined
  memberMap: Map<string, string>
  admins?: string[]
  blockedMembers?: string[]
  isOnline: boolean
  lastSeen: string
  customStatus?: { emoji?: string; text?: string } | null
  isAdmin: boolean
  actionLoading: boolean
  avatarGradient: string
}>()

defineEmits<{
  leave: []
  block: []
  remove: []
}>()
</script>
