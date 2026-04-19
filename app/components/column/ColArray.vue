<template>
  <div v-if="items.length > 0">
    <!-- Badge mode -->
    <div v-if="asBadges" class="flex flex-wrap gap-1">
      <span
        v-for="(item, i) in displayed"
        :key="i"
        class="px-1.5 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded text-gray-300"
      >{{ item }}</span>
      <span
        v-if="items.length > limit"
        class="px-1.5 py-0.5 text-xs text-gray-500 cursor-default"
        :title="remaining.join(', ')"
      >+{{ items.length - limit }} more</span>
    </div>
    <!-- Text mode -->
    <span v-else class="text-sm text-gray-200">
      {{ displayed.join(separator) }}<span
        v-if="items.length > limit"
        class="text-gray-500 cursor-default"
        :title="remaining.join(', ')"
      > +{{ items.length - limit }}</span>
    </span>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** Array or JSON string containing array */
  value: unknown[] | string | null | undefined
  separator?: string
  asBadges?: boolean
  /** Max items to show before "+N more" */
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  separator: ', ', asBadges: false, limit: 5,
})

const items = computed<unknown[]>(() => {
  if (!props.value) return []
  if (Array.isArray(props.value)) return props.value
  try { const p = JSON.parse(String(props.value)); return Array.isArray(p) ? p : [] } catch { return [] }
})

const displayed  = computed(() => items.value.slice(0, props.limit).map(String))
const remaining  = computed(() => items.value.slice(props.limit).map(String))
</script>
