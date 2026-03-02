<template>
  <div class="flex h-full -m-6 overflow-hidden">
    <!-- ── Conversation sidebar ─────────────────────────────────────── -->
    <div class="w-72 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col h-full">
      <ConversationList
        :conversations="conversations as Conversation[]"
        :active-id="activeConversationId"
        @select="handleSelect"
        @new="showModal = true"
      />
    </div>

    <!-- ── Message area ────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">

      <!-- Empty state -->
      <div v-if="!activeConversation" class="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div class="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-400">Select a conversation</p>
        <p class="text-xs text-gray-600 mt-1">or start a new one</p>
        <button
          @click="showModal = true"
          class="mt-4 px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-all"
        >
          New Conversation
        </button>
      </div>

      <!-- Active conversation -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800/60 flex-shrink-0">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            :class="activeConversation.type === 'group'
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
          >
            {{ conversationInitials(activeConversation) }}
          </div>
          <div>
            <p class="text-sm font-semibold text-white">{{ conversationName(activeConversation) }}</p>
            <p class="text-[11px] text-gray-500">
              {{ activeConversation.type === 'group'
                ? `${activeConversation.participants.length} members`
                : 'Private chat' }}
            </p>
          </div>

          <!-- Real-time connection status -->
          <div class="ml-auto flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full"
              :class="isConnected ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60' : 'bg-gray-600'"
            />
            <span class="text-[10px] text-gray-600">{{ isConnected ? 'Live' : 'Offline' }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div ref="scrollRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <!-- Loading skeleton -->
          <div v-if="loadingMessages" class="space-y-4">
            <div v-for="i in 6" :key="i" class="flex gap-2" :class="i % 3 === 0 ? 'flex-row-reverse' : ''">
              <div class="w-7 h-7 rounded-full bg-slate-800 animate-pulse flex-shrink-0 self-end" />
              <div
                class="h-9 rounded-2xl bg-slate-800 animate-pulse"
                :style="`width: ${50 + i * 20}px`"
              />
            </div>
          </div>

          <!-- Messages grouped by date -->
          <template v-else>
            <template v-for="(group, date) in groupedMessages" :key="date">
              <!-- Date separator -->
              <div class="flex items-center gap-3 py-1">
                <div class="flex-1 h-px bg-slate-800/60" />
                <span class="text-[10px] text-gray-600 px-2 py-0.5 bg-slate-900 rounded-full border border-slate-800/40">
                  {{ formatDate(date) }}
                </span>
                <div class="flex-1 h-px bg-slate-800/60" />
              </div>

              <MessageBubble
                v-for="msg in group"
                :key="msg._id"
                :message="msg"
                :mine="isMyMessage(msg)"
                :sender-name="senderName(msg.senderId)"
                @delete="deleteMessage"
              />
            </template>
          </template>

          <!-- Typing indicator -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div v-if="typingUsers.length > 0" class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                {{ typingUsers[0]!.charAt(0).toUpperCase() }}
              </div>
              <div class="flex items-center gap-1 px-3 py-2 bg-slate-800/80 rounded-2xl rounded-tl-sm border border-slate-700/40">
                <span class="text-[11px] text-gray-400 mr-1">{{ typingUsers[0] }} is typing</span>
                <span class="flex gap-0.5">
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 0ms" />
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 150ms" />
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 300ms" />
                </span>
              </div>
            </div>
          </Transition>

          <!-- Scroll anchor -->
          <div ref="bottomRef" />
        </div>

        <!-- Input -->
        <MessageInput
          ref="inputRef"
          @send="onSend"
          @typing="onTyping"
        />
      </template>
    </div>

    <!-- ── New Conversation Modal ───────────────────────────────────── -->
    <NewConversationModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

definePageMeta({ layout: 'default' })

const {
  conversations,
  activeConversationId,
  activeConversation,
  messages,
  typingUsers,
  loadConversations,
  selectConversation,
  sendMessage: chatSend,
  sendTyping,
  deleteMessage: chatDelete,
  startListening,
  conversationName,
  conversationInitials,
  isMyMessage,
  formatDate,
} = useChat()

const { teamApi } = useApi()
const { isConnected } = useSocket()

const showModal = ref(false)
const loadingMessages = ref(false)
const bottomRef = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)

// Team member name lookup
const memberMap = ref<Map<string, string>>(new Map())

// Group messages by calendar date
const groupedMessages = computed(() => {
  const groups: Record<string, typeof messages.value> = {}
  for (const msg of messages.value) {
    const key = new Date(msg.createdAt).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key]!.push(msg)
  }
  return groups
})

function senderName(senderId: string): string {
  return memberMap.value.get(senderId) ?? senderId.slice(-4)
}

async function handleSelect(id: string) {
  loadingMessages.value = true
  await selectConversation(id)
  loadingMessages.value = false
  scrollToBottom()
  nextTick(() => inputRef.value?.focus())
}

async function onSend(content: string) {
  await chatSend(content)
  scrollToBottom()
}

function onTyping(isTyping: boolean) {
  sendTyping(isTyping)
}

async function deleteMessage(id: string) {
  await chatDelete(id)
}

async function handleCreated(id: string) {
  showModal.value = false
  const team = Array.from(memberMap.value.entries()).map(([_id, name]) => ({
    _id, name, email: '', role: 'admin' as const, isActive: true, isEmailVerified: true, createdAt: '',
  }))
  await loadConversations(team)
  await handleSelect(id)
}

function scrollToBottom() {
  nextTick(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }))
}

// Auto-scroll on new messages or typing
watch(() => messages.value.length, scrollToBottom)
watch(typingUsers, (users) => { if (users.length > 0) scrollToBottom() })

onMounted(async () => {
  const team = await teamApi.getAll()
  memberMap.value = new Map(team.map((m) => [m._id, m.name]))
  await loadConversations(team)
  startListening()
})
</script>
