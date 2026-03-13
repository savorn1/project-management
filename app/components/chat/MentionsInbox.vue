<template>
  <div class="w-72 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
        Mentions
        <span v-if="mentions.length" class="bg-sky-500/20 text-sky-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          {{ mentions.length }}
        </span>
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
      <div class="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      </div>
      <p class="text-xs font-medium text-gray-500">No mentions yet</p>
      <p class="text-[11px] text-gray-700 mt-1 leading-relaxed">You'll see messages where someone @mentioned you</p>
    </div>

    <!-- Mentions list -->
    <div v-else class="flex-1 overflow-y-auto py-2 flex flex-col gap-0.5">
      <div
        v-for="item in mentions"
        :key="item.message._id"
        class="group/mention mx-2 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-700/40"
        @click="$emit('navigate', item.conversationId, item.message._id)"
      >
        <!-- Top row: sender avatar + name + time -->
        <div class="flex items-center gap-2 mb-1.5">
          <!-- Sender avatar -->
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            :style="{ background: senderGradient(item.message.senderId) }"
          >
            {{ senderInitials(item.message.senderId) }}
          </div>
          <span class="text-[11px] font-semibold text-gray-300 truncate flex-1">
            {{ senderName(item.message.senderId) }}
          </span>
          <span class="text-[10px] text-gray-600 flex-shrink-0">
            {{ formatTimeAgo(item.message.createdAt) }}
          </span>
        </div>

        <!-- Content with parsed mentions -->
        <p
          v-if="!item.message.isDeleted"
          class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed pl-8"
          v-html="renderContent(item.message.content || '')"
        />
        <p v-else class="text-[11px] text-gray-600 italic pl-8">Message deleted</p>

        <!-- Channel pill -->
        <div class="pl-8 mt-1.5">
          <span class="inline-flex items-center gap-1 text-[9px] font-medium text-sky-400/60 bg-sky-500/8 border border-sky-500/15 rounded-full px-2 py-0.5">
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            {{ convName(item.conversationId) }}
          </span>
        </div>
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

defineEmits<{
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

function senderName(userId: string): string {
  return props.memberMap?.get(userId) ?? userId.slice(-4)
}

function senderInitials(userId: string): string {
  const name = senderName(userId)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return name.charAt(0).toUpperCase()
}

// Deterministic gradient from userId
const GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6d28d9)',
  'linear-gradient(135deg,#e11d48,#be185d)',
  'linear-gradient(135deg,#d97706,#b45309)',
  'linear-gradient(135deg,#059669,#0d9488)',
  'linear-gradient(135deg,#0284c7,#1d4ed8)',
  'linear-gradient(135deg,#c026d3,#9333ea)',
  'linear-gradient(135deg,#0891b2,#0ea5e9)',
  'linear-gradient(135deg,#65a30d,#16a34a)',
]
function senderGradient(userId: string): string {
  let hash = 0
  for (const ch of userId) hash = ((hash << 5) - hash) + ch.charCodeAt(0)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]!
}

/** Parse @[name](id) → styled mention chip, @[everyone] → everyone chip */
function renderContent(text: string): string {
  // Escape HTML first
  text = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // @[everyone]
  text = text.replace(/@\[everyone\]/g,
    '<span style="background:rgba(245,158,11,0.15);color:rgb(252,211,77);border:1px solid rgba(245,158,11,0.25);padding:0 5px;border-radius:4px;font-weight:600;font-size:11px;white-space:nowrap;">@everyone</span>'
  )

  // @[name](id)
  text = text.replace(/@\[([^\]]+)\]\([^)]+\)/g, (_: string, name: string) =>
    `<span style="background:rgba(99,102,241,0.15);color:rgb(165,180,252);border:1px solid rgba(99,102,241,0.25);padding:0 5px;border-radius:4px;font-weight:600;font-size:11px;white-space:nowrap;">@${name}</span>`
  )

  return text
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
