<template>
  <div class="w-72 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Starred Messages
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
      <div class="w-5 h-5 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
    </div>

    <!-- Empty state -->
    <div v-else-if="starred.length === 0" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <svg class="w-10 h-10 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      <p class="text-xs text-gray-500">No starred messages yet</p>
      <p class="text-[11px] text-gray-700 mt-1">Star messages to save them here</p>
    </div>

    <!-- Starred list -->
    <div v-else class="flex-1 overflow-y-auto py-2">
      <div
        v-for="item in starred"
        :key="item.message._id"
        class="group/star mx-2 mb-1 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer"
        @click="$emit('navigate', item.conversationId, item.message._id)"
      >
        <!-- Conversation badge + time -->
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-medium text-indigo-400/70 truncate max-w-[140px]">
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

        <!-- Unstar button -->
        <div class="flex justify-end mt-1.5 opacity-0 group-hover/star:opacity-100 transition-opacity">
          <button
            @click.stop="handleUnstar(item.message._id)"
            class="text-[10px] text-amber-400/60 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Unstar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StarredMessage } from '~/types'

const props = defineProps<{
  memberMap?: Map<string, string>
  conversationNameMap?: Map<string, string>
}>()

const emit = defineEmits<{
  close: []
  navigate: [conversationId: string, messageId: string]
}>()

const { chatApi } = useApi()
const { unstarMessage } = useChat()

const loading = ref(true)
const starred = ref<StarredMessage[]>([])

async function load() {
  loading.value = true
  starred.value = await chatApi.getStarredMessages()
  loading.value = false
}

async function handleUnstar(messageId: string) {
  await unstarMessage(messageId)
  starred.value = starred.value.filter((s) => s.message._id !== messageId)
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
