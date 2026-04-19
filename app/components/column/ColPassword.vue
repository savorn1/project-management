<template>
  <span v-if="value" class="text-sm text-gray-400 font-mono tracking-widest">{{ mask }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: string | null | undefined
  /** Masking character (default: •) */
  char?: string
  /** Number of mask characters shown (default: 8) */
  length?: number
}

const props = withDefaults(defineProps<Props>(), { char: '•', length: 8 })
const mask = computed(() => props.char!.repeat(props.length!))
</script>
