<template>
  <div v-if="value" class="inline-flex items-center gap-2">
    <span
      class="w-5 h-5 rounded-md border border-white/10 flex-shrink-0 shadow-sm"
      :style="{ backgroundColor: value }"
    />
    <code v-if="showHex" class="text-xs text-gray-400 font-mono uppercase">{{ value }}</code>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** Hex colour string e.g. "#6366f1" */
  value: string | null | undefined
  showHex?: boolean
}

withDefaults(defineProps<Props>(), { showHex: true })
</script>
