<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="overflow-x-auto rounded-lg border border-slate-600">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-800 border-b border-slate-700">
            <th class="w-8 px-2 py-2.5 text-center text-xs font-medium text-gray-500">#</th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              :style="col.width ? { width: col.width } : {}"
            >
              {{ col.label }}
              <span v-if="col.required" class="text-rose-400 ml-0.5">*</span>
            </th>
            <th v-if="!disabled" class="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700/60">
          <tr
            v-for="(row, rowIdx) in modelValue"
            :key="rowIdx"
            class="group bg-slate-700/20 hover:bg-slate-700/40 transition-colors"
          >
            <td class="px-2 py-2 text-center text-xs text-gray-600">{{ rowIdx + 1 }}</td>
            <td v-for="col in columns" :key="col.key" class="px-2 py-1.5">
              <!-- Text / Number -->
              <input
                v-if="col.type === 'text' || col.type === 'number' || !col.type"
                :value="row[col.key]"
                :type="col.type === 'number' ? 'number' : 'text'"
                :placeholder="col.placeholder"
                :disabled="disabled || col.disabled"
                class="w-full px-2 py-1 bg-slate-700 border border-transparent hover:border-slate-600 focus:border-indigo-500 rounded text-sm text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                @input="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).value)"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="col.type === 'textarea'"
                :value="String(row[col.key] ?? '')"
                :placeholder="col.placeholder"
                :disabled="disabled || col.disabled"
                rows="2"
                class="w-full px-2 py-1 bg-slate-700 border border-transparent hover:border-slate-600 focus:border-indigo-500 rounded text-sm text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50 resize-none"
                @input="updateCell(rowIdx, col.key, ($event.target as HTMLTextAreaElement).value)"
              />

              <!-- Select -->
              <select
                v-else-if="col.type === 'select'"
                :value="String(row[col.key] ?? '')"
                :disabled="disabled || col.disabled"
                class="w-full px-2 py-1 bg-slate-700 border border-transparent hover:border-slate-600 focus:border-indigo-500 rounded text-sm text-white focus:outline-none transition-colors disabled:opacity-50"
                @change="updateCell(rowIdx, col.key, ($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled>{{ col.placeholder || 'Select...' }}</option>
                <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>

              <!-- Checkbox -->
              <div v-else-if="col.type === 'checkbox'" class="flex justify-center">
                <input
                  :checked="Boolean(row[col.key])"
                  type="checkbox"
                  :disabled="disabled || col.disabled"
                  class="w-4 h-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                  @change="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).checked)"
                />
              </div>

              <!-- Date -->
              <input
                v-else-if="col.type === 'date'"
                :value="String(row[col.key] ?? '')"
                type="date"
                :disabled="disabled || col.disabled"
                class="w-full px-2 py-1 bg-slate-700 border border-transparent hover:border-slate-600 focus:border-indigo-500 rounded text-sm text-white focus:outline-none transition-colors disabled:opacity-50"
                @input="updateCell(rowIdx, col.key, ($event.target as HTMLInputElement).value)"
              />

              <!-- Custom slot per cell -->
              <slot v-else :name="`cell-${col.key}`" :row="row" :row-index="rowIdx" :column="col" :update="(val: unknown) => updateCell(rowIdx, col.key, val)" />
            </td>
            <td v-if="!disabled" class="px-2 py-1.5 text-center">
              <button
                type="button"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-rose-400 hover:bg-rose-400/10 rounded"
                @click="removeRow(rowIdx)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="modelValue.length === 0">
            <td :colspan="columns.length + (disabled ? 1 : 2)" class="px-4 py-6 text-center text-sm text-gray-500">
              No rows yet. Click "Add row" to start.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div v-if="!disabled" class="flex items-center justify-between px-3 py-2 bg-slate-800 border-t border-slate-700">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
            @click="addRow"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add row
          </button>
          <button
            v-if="modelValue.length > 0"
            type="button"
            class="text-xs text-gray-500 hover:text-rose-400 px-2 py-1.5 rounded-lg transition-colors"
            @click="emit('update:modelValue', [])"
          >
            Clear all
          </button>
        </div>
        <span class="text-xs text-gray-600">{{ modelValue.length }} row{{ modelValue.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'
  placeholder?: string
  width?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string | number; label: string }[]
  default?: unknown
}

interface Props {
  modelValue: Record<string, unknown>[]
  columns: TableColumn[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]]
}>()

function newEmptyRow(): Record<string, unknown> {
  return Object.fromEntries(
    props.columns.map(c => [c.key, c.default ?? (c.type === 'checkbox' ? false : '')])
  )
}

function addRow() {
  emit('update:modelValue', [...props.modelValue, newEmptyRow()])
}

function removeRow(idx: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}

function updateCell(rowIdx: number, key: string, val: unknown) {
  emit('update:modelValue', props.modelValue.map((row, i) =>
    i === rowIdx ? { ...row, [key]: val } : row
  ))
}
</script>
