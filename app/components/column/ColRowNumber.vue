<template>
  <span class="text-sm text-gray-500 tabular-nums font-mono select-none">{{ value ?? '—' }}</span>
</template>

<script setup lang="ts">
interface Props {
  value: number | null | undefined
}
defineProps<Props>()
</script>
