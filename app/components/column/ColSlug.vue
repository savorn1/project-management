<template>
  <span v-if="value" class="group inline-flex items-center gap-0.5">
    <span class="text-gray-600 text-sm font-mono select-none">{{ prefix }}</span>
    <span
      class="font-mono text-sm text-gray-300 bg-slate-800/60 border border-slate-700/50 px-1.5 py-0.5 rounded"
      :title="value"
    >{{ value }}</span>
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-gray-500 hover:text-gray-300"
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
  value: string | null | undefined
  /** Character shown before the slug */
  prefix?: string
}

const props = withDefaults(defineProps<Props>(), { prefix: '/' })

const copied = ref(false)

async function copy() {
  if (!props.value) return
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
