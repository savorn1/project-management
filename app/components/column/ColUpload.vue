<template>
  <span v-if="src" class="group inline-flex items-center gap-1.5">
    <a
      :href="src"
      :download="download || undefined"
      :target="download ? undefined : '_blank'"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      :title="src"
    >
      <span class="text-base leading-none flex-shrink-0">{{ fileIcon }}</span>
      <span class="truncate max-w-[180px] hover:underline">{{ displayName }}</span>
      <svg class="w-3 h-3 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="download" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
    <span v-if="sizeLabel" class="text-xs text-gray-600 flex-shrink-0">{{ sizeLabel }}</span>
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-gray-500 hover:text-gray-300"
      @click.stop="copy"
    >
      <svg v-if="!copied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** File path or full URL */
  value: string | null | undefined
  /** Custom display label (overrides filename) */
  label?: string
  /** Base URL prepended to relative paths */
  baseUrl?: string
  /** File size in bytes — displayed as human-readable label */
  size?: number | null
  /** Force browser download instead of opening in new tab */
  download?: boolean
}

const props = withDefaults(defineProps<Props>(), { download: false })

const copied = ref(false)

const src = computed(() => {
  if (!props.value) return null
  if (props.baseUrl && !props.value.startsWith('http')) {
    return props.baseUrl.replace(/\/$/, '') + '/' + props.value.replace(/^\//, '')
  }
  return props.value
})

const displayName = computed(() => {
  if (props.label) return props.label
  if (!props.value) return ''
  return props.value.split('/').pop() ?? props.value
})

const ext = computed(() => {
  const name = displayName.value
  const dot = name.lastIndexOf('.')
  return dot !== -1 ? name.slice(dot + 1).toLowerCase() : ''
})

const fileIcon = computed(() => {
  const e = ext.value
  if (['jpg','jpeg','png','gif','webp','svg','avif'].includes(e)) return '🖼️'
  if (['mp4','mov','avi','mkv','webm'].includes(e))              return '🎬'
  if (['mp3','wav','ogg','flac','aac'].includes(e))              return '🎵'
  if (['zip','rar','tar','gz','7z'].includes(e))                 return '📦'
  if (e === 'pdf')                                                return '📄'
  if (['doc','docx','odt'].includes(e))                          return '📝'
  if (['xls','xlsx','csv'].includes(e))                          return '📊'
  if (['ppt','pptx'].includes(e))                                return '📽️'
  if (['js','ts','py','php','go','rs','vue','json'].includes(e)) return '💾'
  return '📎'
})

const sizeLabel = computed(() => {
  if (props.size == null) return null
  const b = props.size
  if (b < 1024)        return `${b} B`
  if (b < 1048576)     return `${(b / 1024).toFixed(1)} KB`
  if (b < 1073741824)  return `${(b / 1048576).toFixed(1)} MB`
  return `${(b / 1073741824).toFixed(2)} GB`
})

async function copy() {
  if (!src.value) return
  try {
    await navigator.clipboard.writeText(src.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
