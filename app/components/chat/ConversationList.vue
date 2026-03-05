<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <h2 class="text-sm font-semibold text-white">Messages</h2>
      <button
        @click="$emit('new')"
        class="w-7 h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:text-indigo-300 transition-all"
        title="New conversation"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 py-2 flex-shrink-0">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search…"
          class="w-full pl-8 pr-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center h-32 text-center px-4">
        <p class="text-xs text-gray-600">{{ search ? 'No results' : 'No conversations yet' }}</p>
        <button v-if="!search" @click="$emit('new')" class="mt-2 text-xs text-indigo-400 hover:text-indigo-300">
          Start chatting →
        </button>
      </div>

      <button
        v-for="conv in filtered"
        :key="conv._id"
        @click="$emit('select', conv._id)"
        class="w-full px-3 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors text-left border-b border-slate-800/30 last:border-0"
        :class="activeId === conv._id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''"
      >
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            :class="conv.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
          >
            {{ conversationInitials(conv) }}
          </div>
          <div
            v-if="conv.type === 'group'"
            class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span
              class="text-[14px] truncate"
              :class="isUnread(conv) ? 'font-bold text-white' : 'font-semibold text-gray-300'"
            >{{ conversationName(conv) }}</span>
            <span class="text-[12px] font-bold flex-shrink-0" :class="isUnread(conv) ? 'text-indigo-400' : 'text-indigo-400/50'">{{ lastMessageTime(conv) }}</span>
          </div>
          <div class="flex items-center justify-between gap-1 mt-0.5">
            <p
              class="text-[12px] truncate"
              :class="isUnread(conv) ? 'font-bold text-slate-300' : 'font-medium text-slate-500'"
            >{{ lastMessagePreview(conv) }}</p>
            <span
              v-if="isUnread(conv)"
              class="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center"
            >{{ conv._unread }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types';

const props = defineProps<{
  conversations: Conversation[]
  activeId: string | null
}>()

defineEmits<{
  select: [id: string]
  new: []
}>()

const { conversationName, conversationInitials, lastMessagePreview, lastMessageTime, isUnread } = useChat()

const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return props.conversations
  const q = search.value.toLowerCase()
  return props.conversations.filter((c) =>
    conversationName(c).toLowerCase().includes(q) ||
    (c.lastMessage?.content ?? '').toLowerCase().includes(q),
  )
})
</script>
