<template>
  <span v-if="display" class="text-sm text-gray-200 tabular-nums">{{ display }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** "YYYY-Www" e.g. "2025-W18" */
  value: string | null | undefined
}

const props = defineProps<Props>()

const display = computed(() => {
  if (!props.value) return null
  const match = props.value.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return props.value
  return `Week ${match[2]}, ${match[1]}`
})
</script>
