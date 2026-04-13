<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="flex gap-3">
      <!-- Available options -->
      <div class="flex-1">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Available</p>
        <div class="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
          <div class="p-2 border-b border-slate-600/60">
            <input
              v-model="search"
              type="text"
              class="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="Search..."
            />
          </div>
          <ul class="max-h-48 overflow-y-auto py-1">
            <li v-if="availableOptions.length === 0" class="px-3 py-2 text-xs text-gray-500 text-center">
              {{ search ? 'No matches' : 'All options selected' }}
            </li>
            <li
              v-for="opt in availableOptions"
              :key="opt.value"
              class="flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-slate-600 cursor-pointer transition-colors"
              @click="addOption(opt)"
            >
              <span>{{ opt.label }}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
          </ul>
        </div>
      </div>

      <!-- Selected & ordered -->
      <div class="flex-1">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
          Selected
          <span v-if="modelValue.length > 0" class="text-indigo-400">({{ modelValue.length }})</span>
        </p>
        <div class="bg-slate-700 border border-slate-600 rounded-lg overflow-hidden">
          <ul class="max-h-56 overflow-y-auto py-1 min-h-[48px]">
            <li v-if="modelValue.length === 0" class="px-3 py-4 text-xs text-gray-500 text-center">
              Add items from the left
            </li>
            <li
              v-for="(opt, idx) in selectedOptions"
              :key="opt.value"
              class="flex items-center gap-2 px-2 py-2 group"
            >
              <!-- Drag handle area (up/down arrows as drag substitute) -->
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  :disabled="idx === 0"
                  class="text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
                  @click="moveUp(idx)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  :disabled="idx === modelValue.length - 1"
                  class="text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
                  @click="moveDown(idx)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <span class="flex-1 text-sm text-gray-200 truncate">{{ opt.label }}</span>
              <button
                type="button"
                class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-all"
                @click="removeOption(opt.value)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          </ul>
          <div v-if="modelValue.length > 0" class="px-3 py-2 border-t border-slate-600/60 flex justify-end">
            <button type="button" class="text-xs text-gray-500 hover:text-rose-400 transition-colors" @click="emit('update:modelValue', [])">
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import type { SelectOption } from './FieldSelect2.vue'

interface Props {
  modelValue: (string | number)[]
  options: SelectOption[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const search = ref('')

const availableOptions = computed(() => {
  const q = search.value.toLowerCase()
  return props.options.filter(o =>
    !props.modelValue.includes(o.value) &&
    (!q || o.label.toLowerCase().includes(q))
  )
})

const selectedOptions = computed(() =>
  props.modelValue.map(v => props.options.find(o => o.value === v)!).filter(Boolean)
)

function addOption(opt: SelectOption) {
  emit('update:modelValue', [...props.modelValue, opt.value])
}

function removeOption(val: string | number) {
  emit('update:modelValue', props.modelValue.filter(v => v !== val))
}

function moveUp(idx: number) {
  if (idx === 0) return
  const next = [...props.modelValue]
  ;[next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!]
  emit('update:modelValue', next)
}

function moveDown(idx: number) {
  if (idx === props.modelValue.length - 1) return
  const next = [...props.modelValue]
  ;[next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!]
  emit('update:modelValue', next)
}
</script>
