<template>
  <div v-if="value" class="text-sm text-gray-300" v-html="value" />
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** Raw HTML string — rendered unescaped. Only use with trusted content. */
  value: string | null | undefined
}

defineProps<Props>()
</script>
