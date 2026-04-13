<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="space-y-2">
      <!-- Rows -->
      <div
        v-for="(row, idx) in modelValue"
        :key="rowKeys[idx]"
        class="group relative flex gap-2 p-3 bg-slate-700/50 border border-slate-600/60 rounded-lg"
      >
        <!-- Row number -->
        <div class="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
          <span class="text-xs font-medium text-gray-600 w-5 text-center">{{ idx + 1 }}</span>
          <!-- Reorder buttons -->
          <div class="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              :disabled="idx === 0"
              class="text-gray-600 hover:text-gray-300 disabled:opacity-30 transition-colors"
              @click="moveRow(idx, -1)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              :disabled="idx === modelValue.length - 1"
              class="text-gray-600 hover:text-gray-300 disabled:opacity-30 transition-colors"
              @click="moveRow(idx, 1)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Slot content -->
        <div class="flex-1 min-w-0">
          <slot :row="row" :index="idx" :update="(field: string, val: unknown) => updateField(idx, field, val)" />
        </div>

        <!-- Remove -->
        <button
          v-if="!disabled && (!minRows || modelValue.length > minRows)"
          type="button"
          class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-start p-1 text-gray-600 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
          @click="removeRow(idx)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="modelValue.length === 0"
        class="flex flex-col items-center justify-center py-6 bg-slate-700/30 border border-dashed border-slate-600 rounded-lg"
      >
        <svg class="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-sm text-gray-500">No items. Click "Add" to get started.</p>
      </div>

      <!-- Add button -->
      <div class="flex items-center gap-3">
        <button
          v-if="!disabled && (!maxRows || modelValue.length < maxRows)"
          type="button"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-dashed border-indigo-500/40 hover:border-indigo-500/60 rounded-lg transition-all"
          @click="addRow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ addLabel }}
        </button>
        <span v-if="maxRows" class="text-xs text-gray-500">
          {{ modelValue.length }} / {{ maxRows }}
        </span>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: Record<string, unknown>[]
  /** Factory function to create a new empty row object */
  newRow?: () => Record<string, unknown>
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  addLabel?: string
  minRows?: number
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  newRow: () => ({}),
  addLabel: 'Add item',
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]]
}>()

// Stable keys for each row so Vue can track them through reorders
let _keyCounter = 0
const rowKeys = ref<number[]>((props.modelValue ?? []).map(() => _keyCounter++))

watch(() => props.modelValue, (val) => {
  const len = val?.length ?? 0
  // Grow: add new keys for appended rows
  while (rowKeys.value.length < len) rowKeys.value.push(_keyCounter++)
  // Shrink: drop keys for removed rows
  if (rowKeys.value.length > len) rowKeys.value.splice(len)
  // If the array was replaced wholesale with a different length, the
  // splice/push above already corrects the key list length. Keys for
  // surviving positions remain stable, which is the desired behaviour.
}, { deep: false })

function addRow() {
  rowKeys.value.push(_keyCounter++)
  emit('update:modelValue', [...props.modelValue, props.newRow!()])
}

function removeRow(idx: number) {
  rowKeys.value.splice(idx, 1)
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}

function updateField(idx: number, field: string, val: unknown) {
  const next = props.modelValue.map((row, i) =>
    i === idx ? { ...row, [field]: val } : row
  )
  emit('update:modelValue', next)
}

function moveRow(idx: number, dir: -1 | 1) {
  const newIdx = idx + dir
  if (newIdx < 0 || newIdx >= props.modelValue.length) return
  const rows = [...props.modelValue]
  const keys = [...rowKeys.value]
  ;[rows[idx], rows[newIdx]] = [rows[newIdx]!, rows[idx]!]
  ;[keys[idx], keys[newIdx]] = [keys[newIdx]!, keys[idx]!]
  rowKeys.value = keys
  emit('update:modelValue', rows)
}
</script>
