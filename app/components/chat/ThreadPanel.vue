<template>
  <div class="w-72 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <div>
        <span class="text-xs font-semibold text-gray-300">Thread</span>
        <span v-if="replies.length > 0" class="ml-1.5 text-[10px] text-gray-600">{{ replies.length }} repl{{ replies.length === 1 ? 'y' : 'ies' }}</span>
      </div>
      <button
        @click="$emit('close')"
        class="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-800/60 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="w-5 h-5 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Root message -->
      <div v-if="root" class="px-3 py-3 border-b border-slate-800/60 flex-shrink-0">
        <p class="text-[10px] text-gray-600 mb-1 font-semibold uppercase tracking-wide">Original message</p>
        <div class="flex gap-2">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-bold text-gray-300 flex-shrink-0">
            {{ senderInitials(root.senderId) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-semibold text-gray-400 mb-0.5">{{ senderName(root.senderId) }}</p>
            <p class="text-xs text-gray-300 break-words line-clamp-4">{{ root.isDeleted ? 'Message deleted' : root.content }}</p>
            <p class="text-[10px] text-gray-600 mt-1">{{ formatTime(root.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Replies -->
      <div class="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        <p v-if="replies.length === 0" class="text-[11px] text-gray-600 text-center py-6">
          No replies yet. Reply to start a thread.
        </p>

        <div
          v-for="msg in replies"
          :key="msg._id"
          class="flex gap-2"
          :class="isMyMessage(msg) ? 'flex-row-reverse' : 'flex-row'"
        >
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-bold text-gray-300 flex-shrink-0 self-end">
            {{ senderInitials(msg.senderId) }}
          </div>
          <div class="max-w-[80%] flex flex-col" :class="isMyMessage(msg) ? 'items-end' : 'items-start'">
            <p class="text-[10px] text-gray-600 mb-0.5 px-1">{{ senderName(msg.senderId) }}</p>
            <div
              class="px-2.5 py-1.5 rounded-xl text-xs leading-relaxed break-words"
              :class="isMyMessage(msg)
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                : 'bg-slate-800/80 text-gray-200 rounded-tl-sm border border-slate-700/40'"
            >{{ msg.isDeleted ? 'Message deleted' : msg.content }}</div>
            <p class="text-[9px] text-gray-600 mt-0.5 px-1">{{ formatTime(msg.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Reply input -->
      <div class="flex-shrink-0 px-3 py-2 border-t border-slate-800/60">
        <div class="flex gap-2 items-end">
          <textarea
            ref="inputRef"
            v-model="replyText"
            @keydown.enter.exact.prevent="sendReply"
            @keydown.shift.enter.exact="replyText += '\n'"
            placeholder="Reply in thread…"
            rows="1"
            class="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
            style="max-height: 80px; overflow-y: auto"
            @input="autoResize"
          />
          <button
            @click="sendReply"
            :disabled="!replyText.trim() || sending"
            class="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-40"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{
  rootMessageId: string
  conversationId: string
  memberMap: Map<string, string>
}>()

defineEmits<{ close: [] }>()

const { chatApi } = useApi()
const { isMyMessage, formatTime, sendMessage } = useChat()

const loading = ref(true)
const root = ref<ChatMessage | null>(null)
const replies = ref<ChatMessage[]>([])
const replyText = ref('')
const sending = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)

function senderName(senderId: string): string {
  return props.memberMap.get(senderId) ?? senderId.slice(-4)
}

function senderInitials(senderId: string): string {
  const name = senderName(senderId)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return name.charAt(0).toUpperCase()
}

async function load() {
  loading.value = true
  const data = await chatApi.getThreadMessages(props.conversationId, props.rootMessageId)
  root.value = data.root
  replies.value = data.replies
  loading.value = false
  nextTick(() => inputRef.value?.focus())
}

async function sendReply() {
  const content = replyText.value.trim()
  if (!content || sending.value) return
  sending.value = true
  const msg = await chatApi.sendMessage(props.conversationId, content, props.rootMessageId)
  if (msg) {
    replies.value = [...replies.value, msg]
    replyText.value = ''
    nextTick(() => {
      if (inputRef.value) { inputRef.value.style.height = 'auto'; inputRef.value.focus() }
    })
  }
  sending.value = false
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(() => props.rootMessageId, load, { immediate: true })
</script>
