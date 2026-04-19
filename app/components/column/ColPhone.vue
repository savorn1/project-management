<template>
  <a
    v-if="value"
    :href="`tel:${clean}`"
    class="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-colors whitespace-nowrap"
  >{{ value }}</a>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: string | null | undefined
}

const props = defineProps<Props>()
const clean = computed(() => props.value?.replace(/\s/g, '') ?? '')
</script>
