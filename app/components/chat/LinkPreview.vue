<template>
  <a
    v-if="preview && !dismissed"
    :href="preview.url"
    target="_blank"
    rel="noopener noreferrer"
    class="relative block mt-1.5 rounded-2xl overflow-hidden border transition-all duration-150 max-w-[300px] group/lp hover:scale-[1.01]"
    :class="mine
      ? 'border-indigo-500/20 bg-indigo-900/20 hover:bg-indigo-900/30'
      : 'border-slate-700/40 bg-slate-800/50 hover:bg-slate-800/70'"
    @click.stop
  >
    <!-- ── YouTube ─────────────────────────────────────────────────────── -->
    <template v-if="domain === 'youtube'">
      <div class="relative">
        <img
          v-if="ytThumb"
          :src="ytThumb"
          :alt="preview.title ?? ''"
          class="w-full h-36 object-cover"
          @error="ytThumb = ''"
        />
        <div v-else class="w-full h-36 bg-slate-900/60 flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.7C14.56 2.64 13.37 2 12 2c-1.37 0-2.56.64-3.82 2a4.83 4.83 0 01-3.77 2.7C2.96 6.82 2 7.9 2 9.2v5.6c0 1.3.96 2.38 2.41 2.51a4.83 4.83 0 013.77 2.7C9.44 21.36 10.63 22 12 22s2.56-.64 3.82-2a4.83 4.83 0 013.77-2.7C21.04 17.18 22 16.1 22 14.8V9.2c0-1.3-.96-2.38-2.41-2.51zM10 15.5v-7l6 3.5-6 3.5z"/>
          </svg>
        </div>
        <!-- Play button overlay -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl opacity-0 group-hover/lp:opacity-100 transition-opacity">
            <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <!-- YouTube badge -->
        <div class="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          <svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span class="text-[9px] font-bold text-white">YouTube</span>
        </div>
      </div>
      <div class="px-3 py-2">
        <p v-if="preview.title" class="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2">{{ preview.title }}</p>
        <p v-if="preview.description" class="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{{ preview.description }}</p>
      </div>
    </template>

    <!-- ── GitHub ──────────────────────────────────────────────────────── -->
    <template v-else-if="domain === 'github'">
      <div class="px-3.5 py-3 flex gap-3">
        <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[9px] font-bold uppercase tracking-wider text-gray-600">GitHub</span>
          </div>
          <p v-if="preview.title" class="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-1">{{ preview.title }}</p>
          <p v-if="preview.description" class="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{{ preview.description }}</p>
        </div>
      </div>
    </template>

    <!-- ── Twitter / X ─────────────────────────────────────────────────── -->
    <template v-else-if="domain === 'twitter'">
      <div class="px-3.5 py-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <div>
            <p v-if="preview.siteName" class="text-[11px] font-semibold text-gray-300">{{ preview.siteName }}</p>
            <p class="text-[9px] text-gray-600">X (Twitter)</p>
          </div>
        </div>
        <p v-if="preview.description" class="text-[11px] text-gray-300 leading-relaxed line-clamp-4 mb-2">{{ preview.description }}</p>
        <img
          v-if="preview.image"
          :src="preview.image"
          class="w-full rounded-xl object-cover max-h-32"
          @error="(e) => (e.target as HTMLImageElement).style.display='none'"
        />
      </div>
    </template>

    <!-- ── Figma ───────────────────────────────────────────────────────── -->
    <template v-else-if="domain === 'figma'">
      <div class="relative">
        <img
          v-if="preview.image"
          :src="preview.image"
          class="w-full h-28 object-cover"
          @error="(e) => (e.target as HTMLImageElement).style.display='none'"
        />
        <div v-else class="w-full h-20 bg-slate-900/60 flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-700" fill="currentColor" viewBox="0 0 38 57">
            <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
            <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"/>
            <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z"/>
            <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
            <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
          </svg>
        </div>
        <div class="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          <span class="text-[9px] font-bold text-white">Figma</span>
        </div>
      </div>
      <div class="px-3 py-2">
        <p v-if="preview.title" class="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-1">{{ preview.title }}</p>
        <p v-if="preview.description" class="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{{ preview.description }}</p>
      </div>
    </template>

    <!-- ── Generic fallback ───────────────────────────────────────────── -->
    <template v-else>
      <img
        v-if="preview.image"
        :src="preview.image"
        :alt="preview.title ?? ''"
        class="w-full h-28 object-cover"
        @error="(e) => (e.target as HTMLImageElement).style.display='none'"
      />
      <div class="px-3 py-2">
        <p v-if="preview.siteName" class="text-[9px] font-semibold uppercase tracking-wider text-gray-600 mb-0.5">{{ preview.siteName }}</p>
        <p v-if="preview.title" class="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2">{{ preview.title }}</p>
        <p v-if="preview.description" class="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{{ preview.description }}</p>
      </div>
    </template>

    <!-- Dismiss button -->
    <button
      @click.prevent.stop="dismissed = true"
      class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover/lp:opacity-100 transition-opacity"
      title="Dismiss preview"
    >
      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </a>
</template>

<script setup lang="ts">
import type { LinkPreview } from '~/types'

const props = defineProps<{
  url: string
  mine?: boolean
}>()

const { chatApi } = useApi()

const preview = ref<LinkPreview | null>(null)
const dismissed = ref(false)
const ytThumb = ref('')

onMounted(async () => {
  preview.value = await chatApi.getLinkPreview(props.url)
  if (domain.value === 'youtube') {
    ytThumb.value = extractYtThumb(props.url)
  }
})

// ── Domain detection ──────────────────────────────────────────────────────────

const domain = computed(() => {
  try {
    const host = new URL(props.url).hostname.replace('www.', '')
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('github.com')) return 'github'
    if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter'
    if (host.includes('figma.com')) return 'figma'
    return 'generic'
  } catch {
    return 'generic'
  }
})

// ── YouTube thumbnail extraction ──────────────────────────────────────────────

function extractYtThumb(url: string): string {
  try {
    const u = new URL(url)
    let videoId = ''
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1).split('?')[0] ?? ''
    } else {
      videoId = u.searchParams.get('v') ?? ''
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}
</script>
