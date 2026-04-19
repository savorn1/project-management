<template>
  <span
    v-if="value !== null && value !== undefined"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
    :class="value ? trueClass : falseClass"
  >
    <svg v-if="value" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
    {{ value ? trueLabel : falseLabel }}
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: boolean | number | null | undefined
  trueLabel?: string
  falseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  trueLabel: 'Yes',
  falseLabel: 'No',
})

const trueClass  = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
const falseClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400'
</script>
