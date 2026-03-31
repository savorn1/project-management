<template>
  <div class="w-80 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">

    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Bookmarks
        <span v-if="bookmarks.length" class="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">{{ bookmarks.length }}</span>
      </span>
      <div class="flex items-center gap-1">
        <button
          v-if="bookmarks.length"
          @click="confirmClear = true"
          class="text-[10px] text-gray-600 hover:text-rose-400 transition-colors px-1.5 py-0.5 rounded"
          title="Clear all bookmarks"
        >Clear all</button>
        <button
          @click="$emit('close')"
          class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-800/60 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="px-3 py-2 border-b border-slate-800/40 flex-shrink-0">
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search bookmarks…"
          class="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">

      <!-- Empty state -->
      <div v-if="!bookmarks.length" class="flex flex-col items-center justify-center h-full px-6 text-center pb-16">
        <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-violet-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p class="text-xs font-medium text-gray-400 mb-1">No bookmarks yet</p>
        <p class="text-[11px] text-gray-600 leading-relaxed">Press <kbd class="px-1 py-0.5 rounded bg-slate-800 border border-slate-700/50 font-mono text-[10px] text-gray-400">Ctrl+B</kbd> on any message to save it here privately.</p>
      </div>

      <!-- No search results -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-10 px-4 text-center">
        <p class="text-xs text-gray-500">No bookmarks match</p>
        <p class="text-xs font-medium text-gray-300 mt-0.5">"{{ search }}"</p>
      </div>

      <!-- Bookmark items -->
      <div v-else class="py-1.5 divide-y divide-slate-800/40">
        <div
          v-for="bm in filtered"
          :key="bm.messageId"
          class="group px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
          @click="$emit('navigate', bm.conversationId, bm.messageId)"
        >
          <div class="flex items-start justify-between gap-2 mb-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <!-- Sender initial avatar -->
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {{ bm.senderName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-[10px] font-semibold text-gray-400 truncate">{{ bm.senderName }}</span>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                @click.stop="removeBookmark(bm.messageId)"
                class="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove bookmark"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <p class="text-[11px] text-gray-300 leading-relaxed line-clamp-3 break-words" v-html="highlighted(bm.content)" />

          <p class="text-[9px] text-gray-600 mt-1.5 flex items-center gap-2">
            <span>{{ convName(bm.conversationId) }}</span>
            <span class="text-slate-700">·</span>
            <span>{{ timeAgo(bm.bookmarkedAt) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Confirm clear all -->
    <Teleport to="body">
      <div v-if="confirmClear" class="fixed inset-0 z-[99999] flex items-center justify-center p-4" @click.self="confirmClear = false">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmClear = false" />
        <div class="relative bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5 w-72 flex flex-col gap-3" @click.stop>
          <p class="text-sm font-semibold text-white">Clear all bookmarks?</p>
          <p class="text-xs text-gray-500">This will permanently delete all {{ bookmarks.length }} bookmarks. This cannot be undone.</p>
          <div class="flex gap-2 justify-end">
            <button @click="confirmClear = false" class="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 transition-colors">Cancel</button>
            <button @click="doClearAll" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-colors">Clear all</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  conversationNameMap?: Map<string, string>
}>()

const emit = defineEmits<{
  close: []
  navigate: [conversationId: string, messageId: string]
}>()

const { bookmarks, removeBookmark } = useBookmarks()

const search = ref('')
const confirmClear = ref(false)

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return [...bookmarks.value]
  return bookmarks.value.filter(bm =>
    bm.content.toLowerCase().includes(q) ||
    bm.senderName.toLowerCase().includes(q)
  )
})

function doClearAll() {
  for (const bm of [...bookmarks.value]) removeBookmark(bm.messageId)
  confirmClear.value = false
}

function convName(convId: string): string {
  return props.conversationNameMap?.get(convId) ?? `#${convId.slice(-4)}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function highlighted(content: string): string {
  const q = search.value.trim()
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (!q) return escaped
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(
    new RegExp(safe, 'gi'),
    m => `<mark style="background:rgba(139,92,246,0.3);color:rgb(196,181,253);border-radius:2px;padding:0 1px;">${m}</mark>`
  )
}
</script>
