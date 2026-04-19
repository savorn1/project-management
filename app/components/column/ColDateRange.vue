<template>
  <span v-if="startDisplay || endDisplay" class="inline-flex items-center gap-1.5 text-sm text-gray-200 whitespace-nowrap">
    <span>{{ startDisplay ?? '…' }}</span>
    <svg class="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
    <span>{{ endDisplay ?? '…' }}</span>
    <span v-if="durationLabel" class="text-xs text-gray-500">({{ durationLabel }})</span>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** JSON string { start, end } or null. Alternatively use start/end props directly. */
  value?: string | { start?: string; end?: string } | null
  start?: string | null
  end?: string | null
  format?: Intl.DateTimeFormatOptions
  locale?: string
  /** Show duration in days */
  showDuration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-US',
  showDuration: false,
})

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

const parsed = computed(() => {
  // Accept { start, end } from value JSON or direct props
  if (props.value) {
    if (typeof props.value === 'object') return props.value
    try { return JSON.parse(String(props.value)) } catch {}
  }
  return { start: props.start, end: props.end }
})

function fmt(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(props.locale, props.format ?? DEFAULT_FORMAT)
  } catch { return dateStr }
}

const startDisplay = computed(() => fmt(parsed.value?.start))
const endDisplay   = computed(() => fmt(parsed.value?.end))

const durationLabel = computed(() => {
  if (!props.showDuration) return null
  const s = parsed.value?.start
  const e = parsed.value?.end
  if (!s || !e) return null
  try {
    const days = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000)
    if (isNaN(days)) return null
    return `${days} day${days === 1 ? '' : 's'}`
  } catch { return null }
})
</script>
