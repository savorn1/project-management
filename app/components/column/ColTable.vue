<template>
  <div v-if="rows.length && cols.length" class="overflow-auto rounded-lg border border-slate-700/60 text-xs max-w-full">
    <table class="w-full">
      <thead>
        <tr class="bg-slate-800/70 border-b border-slate-700/60">
          <th
            v-for="col in cols"
            :key="col"
            class="px-2.5 py-1.5 text-left text-gray-400 font-semibold whitespace-nowrap select-none"
            :class="sortable ? 'cursor-pointer hover:text-gray-200 transition-colors' : ''"
            @click="sortable && toggleSort(col)"
          >
            <span class="inline-flex items-center gap-1">
              {{ col }}
              <span v-if="sortable" class="text-gray-600">
                <svg v-if="sortCol === col && sortDir === 'asc'" class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                <svg v-else-if="sortCol === col && sortDir === 'desc'" class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <svg v-else class="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60">
        <tr v-for="(row, i) in displayed" :key="i" class="hover:bg-slate-800/30 transition-colors">
          <td
            v-for="col in cols"
            :key="col"
            class="px-2.5 py-1.5 text-gray-300 whitespace-nowrap"
          >{{ row[col] ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length > maxRows" class="px-3 py-1.5 text-xs text-gray-500 bg-slate-800/40 border-t border-slate-700/40">
      +{{ rows.length - maxRows }} more rows
    </div>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  /** JSON string or array of objects */
  value: string | Record<string, unknown>[] | null | undefined
  /** Columns to display. Defaults to all keys from the first row. */
  columns?: string[]
  /** Max rows before truncation */
  maxRows?: number
  /** Enable click-to-sort on column headers */
  sortable?: boolean
}

const props = withDefaults(defineProps<Props>(), { maxRows: 5, sortable: true })

const sortCol = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(col: string) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = col
    sortDir.value = 'asc'
  }
}

const rows = computed<Record<string, unknown>[]>(() => {
  if (!props.value) return []
  if (Array.isArray(props.value)) return props.value
  try {
    const p = JSON.parse(String(props.value))
    return Array.isArray(p) ? p : []
  } catch { return [] }
})

const cols = computed(() => {
  if (props.columns?.length) return props.columns
  if (!rows.value.length) return []
  return Object.keys(rows.value[0] ?? {})
})

const sorted = computed(() => {
  if (!sortCol.value) return rows.value
  const col = sortCol.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => {
    const av = a[col] ?? ''
    const bv = b[col] ?? ''
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir
  })
})

const displayed = computed(() => sorted.value.slice(0, props.maxRows))
</script>
