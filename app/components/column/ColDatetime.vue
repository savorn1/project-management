<template>
  <span
    v-if="display"
    class="text-sm text-gray-200 tabular-nums whitespace-nowrap"
    :title="relative ? absoluteDisplay ?? undefined : undefined"
  >{{ display }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** ISO datetime string "YYYY-MM-DDTHH:mm" or parseable by Date() */
  value: string | null | undefined
  format?: Intl.DateTimeFormatOptions
  locale?: string
  /** Show relative time ("2 hours ago") instead of absolute */
  relative?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-US',
  relative: false,
})

const parsed = computed(() => {
  if (!props.value) return null
  const d = new Date(props.value)
  return isNaN(d.getTime()) ? null : d
})

const absoluteDisplay = computed(() => {
  if (!parsed.value) return null
  return parsed.value.toLocaleString(props.locale, props.format ?? {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
})

const display = computed(() => {
  if (!parsed.value) return props.value ?? null
  if (props.relative) {
    const diff = Date.now() - parsed.value.getTime()
    const rtf = new Intl.RelativeTimeFormat(props.locale, { numeric: 'auto' })
    const mins = Math.round(diff / 60000)
    if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute')
    const hours = Math.round(diff / 3600000)
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
    const days = Math.round(diff / 86400000)
    return rtf.format(-days, 'day')
  }
  return absoluteDisplay.value
})
</script>
