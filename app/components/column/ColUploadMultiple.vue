<template>
  <div v-if="files.length">
    <!-- Grid / thumbnail mode for image files -->
    <div v-if="grid && imageFiles.length" class="flex flex-wrap gap-1.5">
      <a
        v-for="(file, i) in displayedImages"
        :key="'img-' + i"
        :href="href(file)"
        target="_blank"
        rel="noopener noreferrer"
        :title="name(file)"
        class="group relative block flex-shrink-0"
      >
        <img
          :src="href(file)"
          :alt="name(file)"
          class="rounded object-cover bg-slate-700 group-hover:opacity-80 transition-opacity"
          style="height:48px;width:48px;"
          @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
        />
      </a>
      <div
        v-if="imageFiles.length > limit"
        class="w-12 h-12 rounded bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-xs text-gray-400"
      >+{{ imageFiles.length - limit }}</div>
      <!-- Non-image files listed below -->
      <div v-if="nonImageFiles.length" class="w-full mt-1 flex flex-col gap-0.5">
        <a
          v-for="(file, i) in nonImageFiles"
          :key="'file-' + i"
          :href="href(file)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
          :title="href(file)"
        >
          <span>{{ icon(file) }}</span>
          <span class="truncate max-w-[160px]">{{ name(file) }}</span>
        </a>
      </div>
    </div>

    <!-- List mode -->
    <div v-else class="flex flex-col gap-1">
      <a
        v-for="(file, i) in displayed"
        :key="i"
        :href="href(file)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
        :title="href(file)"
      >
        <span class="text-sm leading-none flex-shrink-0">{{ icon(file) }}</span>
        <span class="truncate max-w-[200px]">{{ name(file) }}</span>
        <svg class="w-3 h-3 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      <span
        v-if="files.length > limit"
        class="text-xs text-gray-500 cursor-default"
        :title="files.slice(limit).map(name).join(', ')"
      >+{{ files.length - limit }} more</span>
    </div>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','svg','avif']

interface Props {
  /** JSON array of file paths, or actual array */
  value: string[] | string | null | undefined
  /** Max files to show before "+N more" */
  limit?: number
  /** Base URL prepended to relative paths */
  baseUrl?: string
  /** Show images as thumbnail grid instead of list */
  grid?: boolean
}

const props = withDefaults(defineProps<Props>(), { limit: 5, grid: false })

const files = computed<string[]>(() => {
  if (!props.value) return []
  if (Array.isArray(props.value)) return props.value
  try { const p = JSON.parse(String(props.value)); return Array.isArray(p) ? p : [] } catch { return [] }
})

const displayed     = computed(() => files.value.slice(0, props.limit))
const imageFiles    = computed(() => files.value.filter(f => IMAGE_EXTS.includes((f.split('.').pop() ?? '').toLowerCase())))
const nonImageFiles = computed(() => files.value.filter(f => !IMAGE_EXTS.includes((f.split('.').pop() ?? '').toLowerCase())))
const displayedImages = computed(() => imageFiles.value.slice(0, props.limit))

function href(path: string) {
  if (props.baseUrl && !path.startsWith('http')) {
    return props.baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
  }
  return path
}

function name(path: string) { return path.split('/').pop() ?? path }

function icon(path: string) {
  const e = (path.split('.').pop() ?? '').toLowerCase()
  if (IMAGE_EXTS.includes(e))                              return '🖼️'
  if (['mp4','mov','avi','mkv','webm'].includes(e))        return '🎬'
  if (['mp3','wav','ogg'].includes(e))                     return '🎵'
  if (['zip','rar','tar','gz'].includes(e))                return '📦'
  if (e === 'pdf')                                          return '📄'
  if (['doc','docx'].includes(e))                          return '📝'
  if (['xls','xlsx','csv'].includes(e))                    return '📊'
  return '📎'
}
</script>
