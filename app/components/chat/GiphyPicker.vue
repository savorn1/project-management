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
          <span class="text-lg leading-none">🎬</span>
          <h3 class="text-sm font-semibold text-white flex-1">Send a GIF</h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-2 flex-shrink-0">
          <input
            v-model="query"
            @input="onSearchInput"
            type="text"
            placeholder="Search GIFs…"
            class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <!-- Grid -->
        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="loading" class="flex justify-center py-10">
            <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <div v-else-if="results.length === 0 && query.trim()" class="py-10 text-center text-sm text-gray-500">
            No GIFs found for "{{ query }}"
          </div>
          <div v-else class="grid grid-cols-3 gap-1.5">
            <button
              v-for="gif in results"
              :key="gif.id"
              @click="select(gif.url)"
              class="aspect-square rounded-xl overflow-hidden bg-slate-800 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none"
            >
              <img :src="gif.previewUrl" :alt="gif.title" loading="lazy" class="w-full h-full object-cover" />
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
interface GifResult { id: string; title: string; previewUrl: string; url: string }

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  select: [url: string]
}>()

const TENOR_KEY = 'LIVDSRZULELA'
const query = ref('')
const results = ref<GifResult[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchGifs(q: string) {
  loading.value = true
  try {
    const endpoint = q.trim()
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=18&media_filter=gif`
      : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=18&media_filter=gif`
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
  debounceTimer = setTimeout(() => fetchGifs(query.value), 400)
}

function select(url: string) {
  emit('select', url)
  emit('update:modelValue', false)
}

watch(() => true, () => {}, { immediate: false }) // no-op
onMounted(() => fetchGifs(''))
</script>
