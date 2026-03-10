<template>
  <div class="w-72 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
        Mentions
      </span>
      <button
        @click="$emit('close')"
        class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-800/60 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="w-5 h-5 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
    </div>

    <!-- Empty state -->
    <div v-else-if="mentions.length === 0" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <svg class="w-10 h-10 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
      <p class="text-xs text-gray-500">No mentions yet</p>
      <p class="text-[11px] text-gray-700 mt-1">You'll see messages where someone @mentioned you</p>
    </div>

    <!-- Mentions list -->
    <div v-else class="flex-1 overflow-y-auto py-2">
      <div
        v-for="item in mentions"
        :key="item.message._id"
        class="group/mention mx-2 mb-1 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer"
        @click="$emit('navigate', item.conversationId, item.message._id)"
      >
        <!-- Conversation badge + time -->
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-medium text-sky-400/70 truncate max-w-[140px]">
            {{ convName(item.conversationId) }}
          </span>
          <span class="text-[10px] text-gray-700 flex-shrink-0 ml-2">
            {{ formatTimeAgo(item.message.createdAt) }}
          </span>
        </div>

        <!-- Sender + content -->
        <p class="text-[10px] font-semibold text-gray-500 mb-0.5">
          {{ props.memberMap?.get(item.message.senderId) ?? item.message.senderId.slice(-4) }}
        </p>
        <p class="text-xs text-gray-300 line-clamp-2 leading-relaxed">
          {{ item.message.isDeleted ? 'Message deleted' : (item.message.content || '📎 Attachment') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MentionResult } from '~/types'

const props = defineProps<{
  memberMap?: Map<string, string>
  conversationNameMap?: Map<string, string>
}>()

const emit = defineEmits<{
  close: []
  navigate: [conversationId: string, messageId: string]
}>()

const { loadMentions } = useChat()

const loading = ref(true)
const mentions = ref<MentionResult[]>([])

async function load() {
  loading.value = true
  mentions.value = await loadMentions()
  loading.value = false
}

function convName(convId: string): string {
  return props.conversationNameMap?.get(convId) ?? convId.slice(-6)
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60_000)
  const hr = Math.floor(diff / 3_600_000)
  const day = Math.floor(diff / 86_400_000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  return new Date(dateStr).toLocaleDateString()
}

onMounted(load)
</script>
