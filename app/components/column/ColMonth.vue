<template>
  <span v-if="display" class="text-sm text-gray-200">{{ display }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Props {
  /** "YYYY-MM" */
  value: string | null | undefined
  /** 'long' (default) | 'short' | 'numeric' */
  monthFormat?: 'long' | 'short' | 'numeric'
}

const props = withDefaults(defineProps<Props>(), { monthFormat: 'long' })

const display = computed(() => {
  if (!props.value) return null
  const [y, m] = props.value.split('-').map(Number)
  if (!y || !m || m < 1 || m > 12) return props.value
  if (props.monthFormat === 'numeric') return `${m}/${y}`
  if (props.monthFormat === 'short') return `${MONTHS[m - 1]!.slice(0, 3)} ${y}`
  return `${MONTHS[m - 1]} ${y}`
})
</script>
