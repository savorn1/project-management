<template>
  <span v-if="display" class="text-sm text-gray-200 tabular-nums font-mono">{{ display }}</span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** "HH:mm" or "HH:mm:ss" */
  value: string | null | undefined
  use24h?: boolean
}

const props = withDefaults(defineProps<Props>(), { use24h: true })

const display = computed(() => {
  if (!props.value) return null
  const [h, m] = props.value.split(':').map(Number)
  if (isNaN(h!) || isNaN(m!)) return props.value
  if (props.use24h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const h12 = h === 0 ? 12 : (h! > 12 ? h! - 12 : h)
  const ap  = h! < 12 ? 'AM' : 'PM'
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
})
</script>
