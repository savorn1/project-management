<template>
  <div v-if="src" class="inline-flex items-center gap-2">
    <a :href="src" target="_blank" rel="noopener noreferrer" class="group relative inline-block flex-shrink-0">
      <!-- Loading skeleton while Vimeo fetches -->
      <div
        v-if="loading"
        class="rounded bg-slate-700 animate-pulse"
        :style="{ height: height + 'px', width: (height * 1.78) + 'px' }"
      />
      <img
        v-else-if="thumb"
        :src="thumb"
        :alt="label ?? undefined"
        class="rounded object-cover bg-slate-700 group-hover:opacity-80 transition-opacity"
        :style="{ height: height + 'px', width: (height * 1.78) + 'px' }"
      />
      <div v-else class="rounded bg-slate-700 flex items-center justify-center" :style="{ height: height + 'px', width: (height * 1.78) + 'px' }">
        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <!-- Play overlay (hidden while loading) -->
      <div v-if="!loading" class="absolute inset-0 flex items-center justify-center">
        <div class="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
          <svg class="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </a>
    <span v-if="label" class="text-xs text-gray-400 truncate max-w-[120px]">{{ label }}</span>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** Video URL or JSON string with { url, provider } */
  value: string | null | undefined
  height?: number
}

const props = withDefaults(defineProps<Props>(), { height: 40 })

const src = computed(() => {
  if (!props.value) return null
  try { const p = JSON.parse(props.value); return p.url ?? props.value } catch { return props.value }
})

const ytId = computed(() => {
  if (!src.value) return null
  const m = src.value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return m ? m[1] : null
})

const vimeoThumb = ref<string | null>(null)
const loading    = ref(false)

watch(src, async (url) => {
  vimeoThumb.value = null
  if (!url) return
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (!vm) return
  loading.value = true
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}&width=320`)
    if (res.ok) {
      const data = await res.json()
      vimeoThumb.value = data.thumbnail_url ?? null
    }
  } catch {} finally {
    loading.value = false
  }
}, { immediate: true })

const thumb = computed((): string | null => {
  if (!src.value) return null
  if (ytId.value) return `https://img.youtube.com/vi/${ytId.value}/mqdefault.jpg`
  if (vimeoThumb.value) return vimeoThumb.value
  return null
})

const label = computed(() => {
  if (!src.value) return null
  try { return new URL(src.value).hostname } catch { return null }
})
</script>
