<template>
  <div v-if="value" class="prose-col text-sm text-gray-300 leading-relaxed" v-html="rendered" />
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: string | null | undefined
  /** Trim rendered output to N characters of source before rendering */
  limit?: number
}

const props = withDefaults(defineProps<Props>(), { limit: 0 })

const rendered = computed(() => {
  if (!props.value) return ''
  const src = props.limit && props.value.length > props.limit
    ? props.value.slice(0, props.limit) + '…'
    : props.value
  return src
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{3}\s(.+)$/gm, '<h3 class="text-gray-200 font-semibold text-xs mt-2 mb-0.5">$1</h3>')
    .replace(/^#{2}\s(.+)$/gm, '<h2 class="text-gray-200 font-semibold text-sm mt-2 mb-1">$1</h2>')
    .replace(/^#{1}\s(.+)$/gm, '<h1 class="text-white font-bold mt-2 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-200 font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="text-emerald-400 font-mono text-xs bg-slate-800 px-1 rounded">$1</code>')
    .replace(/^\s*[-*+]\s(.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-400 hover:underline">$1</a>')
    .replace(/\n{2,}/g, '</p><p class="mt-1">')
    .replace(/\n/g, '<br />')
})
</script>

<style scoped>
.prose-col :deep(p) { margin: 0; }
.prose-col :deep(ul) { padding-left: 0; margin: 0.25rem 0; }
</style>
