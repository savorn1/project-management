<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9996] flex items-end justify-center p-4 sm:items-center"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

      <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[70vh]">
        <!-- Header -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
          <span class="text-lg leading-none">{{ activeTab === 'gifs' ? '🎬' : '✨' }}</span>
          <h3 class="text-sm font-semibold text-white flex-1">{{ activeTab === 'gifs' ? 'Send a GIF' : 'Send a Sticker' }}</h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tab switcher -->
        <div class="flex gap-1 px-4 pt-3 pb-1 flex-shrink-0">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="switchTab(tab.value)"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeTab === tab.value
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-gray-500 hover:text-gray-300'"
          >{{ tab.label }}</button>
        </div>

        <!-- Search -->
        <div class="px-4 py-2 flex-shrink-0">
          <input
            v-model="query"
            @input="onSearchInput"
            type="text"
            :placeholder="activeTab === 'gifs' ? 'Search GIFs…' : 'Search stickers…'"
            class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <!-- Sticker category pills (sticker tab only, when no query) -->
        <div v-if="activeTab === 'stickers' && !query.trim()" class="flex gap-1.5 px-4 pb-2 flex-wrap flex-shrink-0">
          <button
            v-for="cat in stickerCategories"
            :key="cat.query"
            @click="selectStickerCategory(cat.query)"
            class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border"
            :class="activeStickerCat === cat.query
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              : 'text-gray-400 border-slate-700/50 hover:text-gray-200 hover:border-slate-600'"
          >{{ cat.label }}</button>
        </div>

        <!-- Grid -->
        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="loading" class="flex justify-center py-10">
            <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <div v-else-if="results.length === 0 && (query.trim() || activeTab === 'gifs')" class="py-10 text-center text-sm text-gray-500">
            No {{ activeTab === 'gifs' ? 'GIFs' : 'stickers' }} found{{ query.trim() ? ` for "${query}"` : '' }}
          </div>
          <div v-else class="grid gap-1.5" :class="activeTab === 'stickers' ? 'grid-cols-4' : 'grid-cols-3'">
            <button
              v-for="item in results"
              :key="item.id"
              @click="select(item.url)"
              class="overflow-hidden bg-slate-800 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none"
              :class="activeTab === 'stickers' ? 'rounded-2xl aspect-square p-1' : 'rounded-xl aspect-square'"
            >
              <img :src="item.previewUrl" :alt="item.title" loading="lazy" class="w-full h-full object-contain" />
            </button>
          </div>
        </div>

        <div class="px-4 pb-2 flex-shrink-0 text-center">
          <p class="text-[9px] text-gray-700">Powered by Tenor</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface MediaResult { id: string; title: string; previewUrl: string; url: string }

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  select: [url: string]
}>()

const TENOR_KEY = 'LIVDSRZULELA'

const tabs = [
  { value: 'gifs' as const, label: '🎬 GIFs' },
  { value: 'stickers' as const, label: '✨ Stickers' },
]
const activeTab = ref<'gifs' | 'stickers'>('gifs')

const stickerCategories = [
  { label: '😄 Reactions', query: 'reactions' },
  { label: '❤️ Love', query: 'love' },
  { label: '🎉 Party', query: 'party' },
  { label: '👋 Hello', query: 'hello' },
  { label: '😂 Funny', query: 'funny' },
  { label: '😢 Sad', query: 'sad' },
  { label: '🔥 Fire', query: 'fire' },
  { label: '✅ Yes', query: 'yes' },
]
const activeStickerCat = ref('reactions')

const query = ref('')
const results = ref<MediaResult[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchMedia(q: string) {
  loading.value = true
  try {
    const isSticker = activeTab.value === 'stickers'
    const searchQ = q.trim() || (isSticker ? activeStickerCat.value : '')
    const endpoint = searchQ
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQ)}&key=${TENOR_KEY}&limit=24&media_filter=${isSticker ? 'gif' : 'gif'}&contentfilter=low${isSticker ? '&sticker=true' : ''}`
      : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=24&media_filter=gif${isSticker ? '&sticker=true' : ''}`

    const res = await fetch(endpoint)
    const data = await res.json()
    results.value = (data.results ?? []).map((r: Record<string, unknown>) => {
      const formats = r.media_formats as Record<string, { url: string }> | undefined
      return {
        id: r.id as string,
        title: (r.title as string) || '',
        previewUrl: formats?.tinygif?.url ?? formats?.gif?.url ?? '',
        url: formats?.gif?.url ?? formats?.tinygif?.url ?? '',
      }
    })
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchMedia(query.value), 400)
}

function switchTab(tab: 'gifs' | 'stickers') {
  activeTab.value = tab
  query.value = ''
  results.value = []
  fetchMedia('')
}

function selectStickerCategory(cat: string) {
  activeStickerCat.value = cat
  fetchMedia('')
}

function select(url: string) {
  emit('select', url)
  emit('update:modelValue', false)
}

watch(() => true, () => {}, { immediate: false })
onMounted(() => fetchMedia(''))
</script>
