<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip">
    <div
      class="bg-slate-700 border rounded-lg overflow-hidden transition-colors"
      :class="error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500'"
    >
      <!-- Search -->
      <div v-if="searchable && options.length > 5" class="p-2 border-b border-slate-600/60">
        <input
          v-model="search"
          type="text"
          placeholder="Search…"
          class="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <!-- Select all / count -->
      <div v-if="showSelectAll" class="flex items-center justify-between px-3 py-2 border-b border-slate-600/60">
        <button
          type="button"
          class="text-xs transition-colors"
          :class="disabled ? 'text-gray-600 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'"
          :disabled="disabled"
          @click="toggleAll"
        >{{ allSelected ? 'Deselect all' : 'Select all' }}</button>
        <span class="text-xs text-gray-500 tabular-nums">{{ modelValue.length }}/{{ options.length }}</span>
      </div>

      <!-- List -->
      <ul class="overflow-y-auto divide-y divide-slate-600/30" :style="{ maxHeight: maxHeight + 'px' }">
        <li
          v-for="opt in filtered"
          :key="opt.value"
          class="flex items-center gap-3 px-3 py-2.5 transition-colors"
          :class="[
            disabled || opt.disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-slate-600/40',
            isChecked(opt.value) ? 'bg-slate-600/20' : '',
          ]"
          @click="!disabled && !opt.disabled && toggle(opt.value)"
        >
          <div
            class="w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors"
            :class="isChecked(opt.value) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'"
          >
            <svg v-if="isChecked(opt.value)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-200 truncate">{{ opt.label }}</p>
            <p v-if="opt.description" class="text-xs text-gray-500 truncate">{{ opt.description }}</p>
          </div>
        </li>
        <li v-if="filtered.length === 0" class="px-3 py-4 text-xs text-gray-500 text-center">
          No matches for "{{ search }}"
        </li>
      </ul>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface ChecklistOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue: (string | number)[]
  options: ChecklistOption[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  showSelectAll?: boolean
  maxHeight?: number
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  searchable: true,
  showSelectAll: true,
  maxHeight: 220,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? props.options.filter(o => o.label.toLowerCase().includes(q)) : props.options
})

const allSelected = computed(() => props.options.length > 0 && props.options.every(o => props.modelValue.includes(o.value)))

function isChecked(v: string | number) {
  return props.modelValue.includes(v)
}

function toggle(v: string | number) {
  const next = isChecked(v)
    ? props.modelValue.filter(x => x !== v)
    : [...props.modelValue, v]
  emit('update:modelValue', next)
}

function toggleAll() {
  emit('update:modelValue', allSelected.value ? [] : props.options.map(o => o.value))
}
</script>
