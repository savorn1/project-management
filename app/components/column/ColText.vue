<template>
  <span
    v-if="display !== null"
    class="group inline-flex items-center gap-1 text-sm text-gray-200"
    :class="{ 'font-medium text-white': bold, 'text-gray-400': muted }"
    :title="isTruncated ? String(props.value) : undefined"
  >
    <span v-if="prefix" class="text-gray-500 mr-0.5">{{ prefix }}</span>
    {{ display }}
    <span v-if="suffix" class="text-gray-500 ml-0.5">{{ suffix }}</span>
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-gray-500 hover:text-gray-300"
      @click.stop="copy"
    >
      <svg v-if="!copied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: string | number | null | undefined
  prefix?: string
  suffix?: string
  /** Max characters before truncation */
  limit?: number
  bold?: boolean
  muted?: boolean
}

const props = withDefaults(defineProps<Props>(), { limit: 0 })

const copied = ref(false)

const isTruncated = computed(() => {
  if (!props.value || !props.limit) return false
  return String(props.value).length > props.limit
})

const display = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return null
  const str = String(props.value)
  return props.limit && str.length > props.limit ? str.slice(0, props.limit) + '…' : str
})

async function copy() {
  if (props.value === null || props.value === undefined) return
  try {
    await navigator.clipboard.writeText(String(props.value))
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
