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
      style="max-height:75vh"
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
          v-if="query || hasFilters"
          @click="clearAll"
          class="w-5 h-5 flex items-center justify-center rounded-md text-gray-600 hover:text-gray-400 transition-colors"
          title="Clear all"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <kbd class="text-[10px] text-gray-700 bg-slate-800 border border-slate-700/50 rounded px-1.5 py-0.5 flex-shrink-0">Esc</kbd>
      </div>

      <!-- Filter bar -->
      <div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/40 flex-shrink-0 flex-wrap">
        <!-- Type filter pills -->
        <button
          v-for="t in typeFilters"
          :key="t.value"
          @click="toggleType(t.value)"
          class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border"
          :class="selectedTypes.has(t.value)
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            : 'bg-transparent border-slate-700/40 text-gray-600 hover:text-gray-300 hover:border-slate-600'"
        >
          <span>{{ t.icon }}</span>
          {{ t.label }}
        </button>

        <div class="w-px h-3.5 bg-slate-700/50 mx-0.5" />

        <!-- Date range -->
        <button
          @click="showDateFilter = !showDateFilter"
          class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border"
          :class="(dateFrom || dateTo)
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : 'bg-transparent border-slate-700/40 text-gray-600 hover:text-gray-300 hover:border-slate-600'"
        >
          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ dateFrom || dateTo ? `${dateFrom ?? '…'} → ${dateTo ?? '…'}` : 'Date' }}
        </button>

        <!-- Date picker (inline) -->
        <div v-if="showDateFilter" class="w-full flex items-center gap-2 mt-1 px-1">
          <input
            v-model="dateFrom"
            type="date"
            class="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-indigo-500/50"
          />
          <span class="text-[10px] text-gray-600">to</span>
          <input
            v-model="dateTo"
            type="date"
            class="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-indigo-500/50"
          />
          <button @click="dateFrom = ''; dateTo = ''; showDateFilter = false" class="text-[10px] text-gray-600 hover:text-gray-300 transition-colors">Clear</button>
        </div>
      </div>

      <!-- Results -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-10">
          <div class="w-5 h-5 border-2 border-slate-700 border-t-indigo-400 rounded-full animate-spin" />
        </div>

        <!-- Empty query -->
        <div v-else-if="!query.trim() && !hasFilters" class="flex flex-col items-center justify-center py-10 text-center px-6">
          <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-xs text-gray-600">Type to search across all conversations</p>
          <p class="text-[10px] text-gray-700 mt-1">Use filters to narrow by type or date</p>
        </div>

        <!-- No results -->
        <div v-else-if="filteredResults.length === 0 && !loading" class="flex flex-col items-center justify-center py-10 text-center px-6">
          <p class="text-sm text-gray-500">No messages found</p>
          <p v-if="query" class="text-sm font-medium text-gray-300 mt-0.5">"{{ query }}"</p>
          <button v-if="hasFilters" @click="clearFilters" class="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">Clear filters</button>
        </div>

        <!-- Result list -->
        <div v-else class="py-1.5">
          <p class="text-[10px] text-gray-600 px-4 pb-1.5">
            {{ filteredResults.length }} result{{ filteredResults.length !== 1 ? 's' : '' }}
            <span v-if="hasFilters" class="text-indigo-400/70"> (filtered)</span>
          </p>
          <button
            v-for="item in filteredResults"
            :key="item.message._id"
            class="w-full text-left px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
            @click="handleNavigate(item)"
          >
            <!-- Conversation name + time + type badge -->
            <div class="flex items-center justify-between mb-0.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-[10px] font-semibold text-indigo-400/80 truncate max-w-[180px]">
                  {{ convName(item.conversationId) }}
                </span>
                <span
                  v-if="item.message.type && item.message.type !== 'text'"
                  class="px-1 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-gray-500 flex-shrink-0"
                >{{ typeLabel(item.message.type) }}</span>
              </div>
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

// ── Filters ──────────────────────────────────────────────────────────────────

const typeFilters = [
  { value: 'text',        icon: '💬', label: 'Text' },
  { value: 'image',       icon: '🖼️',  label: 'Image' },
  { value: 'file',        icon: '📎', label: 'File' },
  { value: 'poll',        icon: '📊', label: 'Poll' },
  { value: 'voice',       icon: '🎙️', label: 'Voice' },
  { value: 'ai_response', icon: '🤖', label: 'AI' },
]

const selectedTypes = ref<Set<string>>(new Set())
const dateFrom = ref('')
const dateTo = ref('')
const showDateFilter = ref(false)

const hasFilters = computed(() =>
  selectedTypes.value.size > 0 || !!dateFrom.value || !!dateTo.value
)

function toggleType(type: string) {
  const next = new Set(selectedTypes.value)
  if (next.has(type)) next.delete(type)
  else next.add(type)
  selectedTypes.value = next
}

function clearFilters() {
  selectedTypes.value = new Set()
  dateFrom.value = ''
  dateTo.value = ''
  showDateFilter.value = false
}

function clearAll() {
  query.value = ''
  results.value = []
  clearFilters()
}

const filteredResults = computed(() => {
  let list = results.value

  // Type filter
  if (selectedTypes.value.size > 0) {
    list = list.filter(item => selectedTypes.value.has(item.message.type ?? 'text'))
  }

  // Date filter
  if (dateFrom.value) {
    const from = new Date(dateFrom.value).getTime()
    list = list.filter(item => new Date(item.message.createdAt).getTime() >= from)
  }
  if (dateTo.value) {
    const to = new Date(dateTo.value).getTime() + 86400000 // include the whole day
    list = list.filter(item => new Date(item.message.createdAt).getTime() <= to)
  }

  return list
})

onMounted(() => nextTick(() => inputRef.value?.focus()))

// Debounced search
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) { results.value = []; loading.value = false; return }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    results.value = await chatApi.searchMessages(val.trim(), 100)
    loading.value = false
  }, 300)
})

function convName(convId: string): string {
  return props.conversationNameMap?.get(convId) ?? convId.slice(-6)
}

function typeLabel(type: string): string {
  return typeFilters.find(t => t.value === type)?.label ?? type
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
