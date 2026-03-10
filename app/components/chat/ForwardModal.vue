<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

      <div class="relative w-80 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-white">Forward message</p>
            <p class="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">{{ preview }}</p>
          </div>
          <button @click="$emit('close')" class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-3 py-2 border-b border-slate-800/40">
          <input
            v-model="search"
            type="text"
            placeholder="Search conversations…"
            class="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            autofocus
          />
        </div>

        <!-- Conversation list -->
        <div class="overflow-y-auto max-h-64 py-1">
          <button
            v-for="conv in filtered"
            :key="conv._id"
            @click="select(conv._id)"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-800/50 transition-colors text-left"
            :disabled="sending"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              :class="conv.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
            >
              {{ conversationInitials(conv) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-200 truncate">{{ conversationName(conv) }}</p>
              <p class="text-[10px] text-gray-600">{{ conv.type === 'group' ? `${conv.participants.length} members` : 'Private' }}</p>
            </div>
            <svg v-if="sentTo.has(conv._id)" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <p v-if="filtered.length === 0" class="text-[11px] text-gray-600 text-center py-4">No conversations found</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

const props = defineProps<{
  conversations: Conversation[]
  messageId: string
  content: string
}>()

const emit = defineEmits<{ close: []; forwarded: [conversationId: string] }>()

const { conversationName, conversationInitials } = useChat()

const search = ref('')
const sending = ref(false)
const sentTo = ref<Set<string>>(new Set())

const preview = computed(() =>
  props.content.length > 60 ? props.content.slice(0, 60) + '…' : props.content,
)

const filtered = computed(() => {
  if (!search.value.trim()) return props.conversations
  const q = search.value.toLowerCase()
  return props.conversations.filter((c) =>
    conversationName(c).toLowerCase().includes(q),
  )
})

async function select(conversationId: string) {
  if (sending.value || sentTo.value.has(conversationId)) return
  sending.value = true
  const { chatApi } = useApi()
  await chatApi.forwardMessage(props.messageId, conversationId)
  const next = new Set(sentTo.value)
  next.add(conversationId)
  sentTo.value = next
  sending.value = false
  emit('forwarded', conversationId)
  setTimeout(() => emit('close'), 600)
}
</script>
