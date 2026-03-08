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

    <!-- Tabs -->
    <div class="flex gap-1 px-3 pt-2 pb-1 flex-shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors relative"
        :class="activeTab === tab.key
          ? 'bg-indigo-500/20 text-indigo-300'
          : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/40'"
      >
        {{ tab.label }}
        <span
          v-if="tab.unread > 0"
          class="min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center"
        >{{ tab.unread }}</span>
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
        <p class="text-xs text-gray-600">{{ search ? 'No results' : activeTab === 'group' ? 'No group chats' : activeTab === 'private' ? 'No private chats' : 'No conversations yet' }}</p>
        <button v-if="!search" @click="$emit('new')" class="mt-2 text-xs text-indigo-400 hover:text-indigo-300">
          Start chatting →
        </button>
      </div>

      <div
        v-for="item in filtered"
        :key="item._id"
        class="relative group/conv border-b border-slate-800/30 last:border-0"
      >
        <button
          @click="$emit('select', item._id)"
          class="w-full px-3 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors text-left"
          :class="activeId === item._id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''"
        >
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              :class="item.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
            >
              {{ conversationInitials(item) }}
            </div>
            <!-- Group icon badge -->
            <div
              v-if="item.type === 'group'"
              class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <!-- Online dot for private conversations -->
            <div
              v-else-if="otherParticipantId(item) && isOnline(otherParticipantId(item)!)"
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"
            />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0 pr-6">
            <div class="flex items-center justify-between gap-1">
              <span
                class="text-[14px] truncate"
                :class="isUnread(item) ? 'font-bold text-white' : 'font-semibold text-gray-300'"
              >{{ conversationName(item) }}</span>
              <span class="text-[12px] font-bold flex-shrink-0" :class="isUnread(item) ? 'text-indigo-400' : 'text-indigo-400/50'">{{ lastMessageTime(item) }}</span>
            </div>
            <div class="flex items-center justify-between gap-1 mt-0.5">
              <p
                class="text-[12px] truncate flex items-center gap-1"
                :class="isUnread(item) ? 'font-bold text-slate-300' : 'font-medium text-slate-500'"
              >
                <svg v-if="item.muted" class="w-2.5 h-2.5 flex-shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                {{ lastMessagePreview(item) }}
              </p>
              <span
                v-if="isUnread(item)"
                class="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center"
              >{{ item._unread }}</span>
            </div>
          </div>
        </button>

        <!-- Mute toggle (appears on hover) -->
        <button
          @click.stop="toggleMute(item)"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center transition-all opacity-0 group-hover/conv:opacity-100"
          :class="item.muted ? 'text-amber-400 opacity-100' : 'text-gray-600 hover:text-gray-400'"
          :title="item.muted ? 'Unmute notifications' : 'Mute notifications'"
        >
          <svg v-if="item.muted" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12c-1.05 0-2.05.4-2.828 1.172L5.586 10.757A2 2 0 015 12.172V13h14v-.828a2 2 0 00-.586-1.415L14.828 7.172A4 4 0 0012 6z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728" />
          </svg>
        </button>
      </div>

      <!-- Archived section -->
      <div v-if="(archivedConversations ?? []).length > 0" class="border-t border-slate-800/30">
        <button
          @click="showArchived = !showArchived"
          class="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg class="w-3 h-3 transition-transform" :class="showArchived ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Archived ({{ (archivedConversations ?? []).length }})
        </button>
        <div v-if="showArchived">
          <div
            v-for="item in (archivedConversations ?? [])"
            :key="item._id"
            class="relative group/conv border-b border-slate-800/30 last:border-0"
          >
            <button
              @click="$emit('select', item._id)"
              class="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-800/40 transition-colors text-left opacity-70"
              :class="activeId === item._id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 opacity-100' : ''"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                :class="item.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
              >{{ conversationInitials(item) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-400 truncate">{{ conversationName(item) }}</p>
                <p class="text-[11px] text-gray-600 truncate">{{ lastMessagePreview(item) }}</p>
              </div>
              <!-- Archive icon -->
              <svg class="w-3 h-3 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types';

const props = defineProps<{
  conversations: Conversation[]
  archivedConversations?: Conversation[]
  activeId: string | null
}>()

defineEmits<{
  select: [id: string]
  new: []
}>()

const { conversationName, conversationInitials, lastMessagePreview, lastMessageTime, isUnread, isOnline, muteConversation } = useChat()

async function toggleMute(conv: Conversation) {
  await muteConversation(conv._id, !conv.muted)
}

const { user } = useAuth()

function otherParticipantId(conv: Conversation): string | null {
  if (conv.type !== 'private') return null
  return conv.participants.find((p) => p !== user.value?.id) ?? null
}

const search = ref('')
const activeTab = ref<'all' | 'group' | 'private'>('all')
const showArchived = ref(false)

const tabs = computed(() => {
  const unreadFor = (type?: 'group' | 'private') =>
    props.conversations
      .filter((c) => (type ? c.type === type : true) && isUnread(c))
      .reduce((sum, c) => sum + (c._unread ?? 0), 0)

  return [
    { key: 'all' as const,     label: 'All',     unread: unreadFor() },
    { key: 'group' as const,   label: 'Groups',  unread: unreadFor('group') },
    { key: 'private' as const, label: 'Private', unread: unreadFor('private') },
  ]
})

const filtered = computed(() => {
  let list = props.conversations
  if (activeTab.value !== 'all') list = list.filter((c) => c.type === activeTab.value)
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter((c) =>
    conversationName(c).toLowerCase().includes(q) ||
    (c.lastMessage?.content ?? '').toLowerCase().includes(q),
  )
})
</script>
