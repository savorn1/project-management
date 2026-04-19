<template>
  <div v-if="parsed !== null">
    <div class="flex items-center gap-2 mb-1">
      <button
        v-if="collapsible"
        type="button"
        class="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        @click="expanded = !expanded"
      >
        <svg class="w-3 h-3 transition-transform" :class="expanded ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        {{ expanded ? 'Collapse' : 'Expand JSON' }}
      </button>
      <button
        v-if="!collapsible || expanded"
        type="button"
        class="inline-flex items-center gap-1 text-xs transition-colors ml-auto"
        :class="copied ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'"
        @click="copy"
      >
        <svg v-if="!copied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <pre
      v-if="!collapsible || expanded"
      class="text-xs font-mono bg-slate-900/60 border border-slate-700/60 rounded-lg p-3 overflow-auto leading-relaxed"
      :style="{ maxHeight: maxHeight + 'px' }"
      v-html="highlighted"
    />
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** JSON string or object */
  value: string | object | null | undefined
  collapsible?: boolean
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: true,
  maxHeight: 200,
})

const expanded = ref(false)
const copied   = ref(false)

const parsed = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return null
  if (typeof props.value === 'object') return props.value
  try { return JSON.parse(String(props.value)) } catch { return null }
})

const formatted = computed(() => parsed.value !== null ? JSON.stringify(parsed.value, null, 2) : '')

const highlighted = computed(() => {
  if (!formatted.value) return ''
  const escaped = formatted.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="text-indigo-300">${match}</span>`
        return `<span class="text-amber-300">${match}</span>`
      }
      if (match === 'true')  return `<span class="text-emerald-400">${match}</span>`
      if (match === 'false') return `<span class="text-rose-400">${match}</span>`
      if (match === 'null')  return `<span class="text-slate-400">${match}</span>`
      return `<span class="text-sky-300">${match}</span>`
    },
  )
})

async function copy() {
  if (!formatted.value) return
  try {
    await navigator.clipboard.writeText(formatted.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
