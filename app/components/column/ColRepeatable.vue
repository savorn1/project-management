<template>
  <div v-if="rows.length" class="space-y-1.5 max-w-full">
    <div
      v-for="(row, i) in displayed"
      :key="i"
      class="rounded-lg border border-slate-700/60 bg-slate-800/30 text-xs overflow-hidden"
    >
      <!-- Card header — click to collapse -->
      <button
        type="button"
        class="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-700/30 transition-colors"
        @click="toggle(i)"
      >
        <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">#{{ i + 1 }}</span>
        <svg
          class="w-3 h-3 text-gray-600 transition-transform duration-200"
          :class="openCards.has(i) ? '' : '-rotate-90'"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <!-- Card body -->
      <div v-if="openCards.has(i)" class="px-3 pb-2.5 border-t border-slate-700/40">
        <div class="mt-2 grid gap-x-4 gap-y-1.5" :style="{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }">
          <div v-for="field in resolvedFields" :key="field.key" class="min-w-0">
            <span class="text-[10px] text-gray-500 uppercase tracking-wide block mb-0.5">{{ field.label }}</span>
            <span class="text-gray-200 truncate block">
              {{ field.prefix }}{{ row[field.key] ?? '—' }}{{ field.suffix }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="rows.length > maxRows" class="text-xs text-gray-500 px-1">
      +{{ rows.length - maxRows }} more
    </div>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface FieldDef {
  key: string
  label?: string
  prefix?: string
  suffix?: string
}

interface Props {
  /** JSON string or array of objects */
  value: string | Record<string, unknown>[] | null | undefined
  /** Field definitions. Defaults to auto-detected keys from first row. */
  fields?: FieldDef[]
  /** Max items to show */
  maxRows?: number
  /** Number of columns in the grid layout per card */
  cols?: number
  /** Which card indices start expanded (default: first card only) */
  defaultOpen?: number[]
}

const props = withDefaults(defineProps<Props>(), { maxRows: 3, cols: 0 })

const rows = computed<Record<string, unknown>[]>(() => {
  if (!props.value) return []
  if (Array.isArray(props.value)) return props.value
  try {
    const p = JSON.parse(String(props.value))
    return Array.isArray(p) ? p : []
  } catch { return [] }
})

// First card open by default; rest collapsed
const openCards = ref<Set<number>>(new Set(props.defaultOpen ?? [0]))

function toggle(i: number) {
  const s = new Set(openCards.value)
  s.has(i) ? s.delete(i) : s.add(i)
  openCards.value = s
}

const resolvedFields = computed<Required<FieldDef>[]>(() => {
  if (props.fields?.length) {
    return props.fields.map(f => ({
      key: f.key,
      label: f.label ?? f.key,
      prefix: f.prefix ?? '',
      suffix: f.suffix ?? '',
    }))
  }
  if (!rows.value.length) return []
  return Object.keys(rows.value[0]).map(k => ({ key: k, label: k, prefix: '', suffix: '' }))
})

const gridCols = computed(() => {
  if (props.cols > 0) return props.cols
  const n = resolvedFields.value.length
  if (n <= 2) return n
  if (n <= 4) return 2
  return 3
})

const displayed = computed(() => rows.value.slice(0, props.maxRows))
</script>
