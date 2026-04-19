<template>
  <span v-if="value !== null && value !== undefined">
    <svg v-if="value" class="w-5 h-5" :class="trueColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg v-else-if="showFalse" class="w-5 h-5" :class="falseColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span v-else class="text-gray-600 text-sm">—</span>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: boolean | number | null | undefined
  /** Show an × icon for false values (default: show dash) */
  showFalse?: boolean
  trueColor?: string
  falseColor?: string
}

withDefaults(defineProps<Props>(), {
  showFalse: false,
  trueColor: 'text-emerald-400',
  falseColor: 'text-rose-400',
})
</script>
