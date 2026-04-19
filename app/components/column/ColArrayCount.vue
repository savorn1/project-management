<template>
  <span v-if="count !== null" class="inline-flex items-center gap-1.5 text-sm text-gray-200 tabular-nums">
    <span class="px-2 py-0.5 rounded-full bg-slate-700 border border-slate-600 text-xs font-medium text-gray-300">{{ count }}</span>
    <span v-if="suffix" class="text-gray-400 text-xs">{{ suffix }}</span>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: unknown[] | string | number | null | undefined
  suffix?: string
}

const props = defineProps<Props>()

const count = computed(() => {
  if (props.value === null || props.value === undefined) return null
  if (typeof props.value === 'number') return props.value
  if (Array.isArray(props.value)) return props.value.length
  try { const p = JSON.parse(String(props.value)); return Array.isArray(p) ? p.length : null } catch { return null }
})
</script>
