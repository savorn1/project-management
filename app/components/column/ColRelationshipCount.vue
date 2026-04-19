<template>
  <span v-if="value !== null && value !== undefined" class="inline-flex items-center gap-1.5 text-sm tabular-nums">
    <span class="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">{{ value }}</span>
    <span v-if="suffix" class="text-gray-400 text-xs">{{ suffix }}</span>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: number | null | undefined
  suffix?: string
}

withDefaults(defineProps<Props>(), { suffix: 'items' })
</script>
