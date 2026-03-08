<template>
  <div
    class="fixed inset-0 z-[9990] flex items-start justify-center pt-[12vh]"
    @click.self="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

    <!-- Panel -->
    <div
      class="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
      style="max-height:70vh"
      @click.stop
    >
      <!-- Search input -->
      <div class="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-800/60 flex-shrink-0">
        <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          placeholder="Search messages…"
          class="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
          @keydown.escape="$emit('close')"
        />
        <button
          v-if="query"
          @click="query = ''"
          class="w-5 h-5 flex items-center justify-center rounded-md text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <kbd class="text-[10px] text-gray-700 bg-slate-800 border border-slate-700/50 rounded px-1.5 py-0.5 flex-shrink-0">Esc</kbd>
      </div>

      <!-- Results -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-10">
          <div class="w-5 h-5 border-2 border-slate-700 border-t-indigo-400 rounded-full animate-spin" />
        </div>

        <!-- Empty query -->
        <div v-else-if="!query.trim()" class="flex flex-col items-center justify-center py-10 text-center px-6">
          <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-xs text-gray-600">Type to search across all conversations</p>
        </div>

        <!-- No results -->
        <div v-else-if="results.length === 0 && !loading" class="flex flex-col items-center justify-center py-10 text-center px-6">
          <p class="text-sm text-gray-500">No messages found for</p>
          <p class="text-sm font-medium text-gray-300 mt-0.5">"{{ query }}"</p>
        </div>

        <!-- Result list -->
        <div v-else class="py-1.5">
          <p class="text-[10px] text-gray-600 px-4 pb-1.5">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }}</p>
          <button
            v-for="item in results"
            :key="item.message._id"
            class="w-full text-left px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
            @click="handleNavigate(item)"
          >
            <!-- Conversation name + time -->
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-[10px] font-semibold text-indigo-400/80 truncate max-w-[240px]">
                {{ convName(item.conversationId) }}
              </span>
              <span class="text-[10px] text-gray-600 flex-shrink-0 ml-2">
                {{ formatDate(item.message.createdAt) }}
              </span>
            </div>
            <!-- Sender -->
            <p class="text-[10px] text-gray-500 mb-0.5">
              {{ props.memberMap?.get(item.message.senderId) ?? item.message.senderId.slice(-4) }}
            </p>
            <!-- Content with highlight -->
            <p class="text-xs text-gray-300 leading-relaxed line-clamp-2" v-html="highlight(item.message.content)" />
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

const query = ref('')
const loading = ref(false)
const results = ref<StarredMessage[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => nextTick(() => inputRef.value?.focus()))

// Debounced search
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) { results.value = []; return }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    results.value = await chatApi.searchMessages(val.trim())
    loading.value = false
  }, 300)
})

function convName(convId: string): string {
  return props.conversationNameMap?.get(convId) ?? convId.slice(-6)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60_000)
  const hr = Math.floor(diff / 3_600_000)
  const day = Math.floor(diff / 86_400_000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString()
}

function highlight(content: string): string {
  if (!query.value.trim()) return escapeHtml(content)
  const escaped = escapeHtml(content)
  const q = escapeHtml(query.value.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(
    new RegExp(q, 'gi'),
    (m) => `<mark style="background:rgba(99,102,241,0.3);color:rgb(199,210,254);border-radius:2px;padding:0 2px;">${m}</mark>`
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function handleNavigate(item: StarredMessage) {
  emit('navigate', item.conversationId, item.message._id)
  emit('close')
}
</script>
