<template>
  <span v-if="display" class="text-sm text-gray-200 tabular-nums whitespace-nowrap">{{ display }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** ISO date string "YYYY-MM-DD" or any date parseable by Date() */
  value: string | null | undefined
  /** Intl.DateTimeFormat options (default: medium date) */
  format?: Intl.DateTimeFormatOptions
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-US',
})

const display = computed(() => {
  if (!props.value) return null
  try {
    const d = new Date(props.value)
    if (isNaN(d.getTime())) return props.value
    return d.toLocaleDateString(props.locale, props.format ?? { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return props.value
  }
})
</script>
