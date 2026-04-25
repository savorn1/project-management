<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip" :input-id="uid">
    <div ref="containerRef" class="relative">
      <button
        :id="uid"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 border rounded-lg text-sm transition-colors focus:outline-none text-left"
        :class="[
          error ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        :disabled="disabled"
        @click="toggle"
      >
        <span v-if="selectedLabel !== null" class="flex-1 text-white truncate">{{ selectedLabel }}</span>
        <span v-else class="flex-1 text-gray-400">{{ placeholder }}</span>
        <button
          v-if="clearable && modelValue !== null && modelValue !== ''"
          type="button"
          class="p-0.5 text-gray-500 hover:text-gray-300 rounded flex-shrink-0"
          @click.stop="emit('update:modelValue', null)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg
          class="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform"
          :class="{ 'rotate-180': isOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div
          v-if="isOpen"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          style="z-index:99999;"
          :style="panelStyle"
          @click.stop
        >
          <ul class="py-1 max-h-52 overflow-y-auto">
            <li
              v-for="opt in normalised"
              :key="opt.value"
              class="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors"
              :class="String(opt.value) === String(modelValue) ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-200 hover:bg-slate-700'"
              @click="select(opt.value)"
            >
              <span class="flex-1">{{ opt.label }}</span>
              <code class="text-[10px] text-gray-500 font-mono bg-slate-700 px-1.5 py-0.5 rounded">{{ opt.value }}</code>
            </li>
            <li v-if="normalised.length === 0" class="px-3 py-3 text-xs text-gray-500 text-center">No options</li>
          </ul>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  /**
   * Options as:
   * - Record<value, label>  e.g. { active: 'Active', draft: 'Draft' }
   * - Array of strings/numbers  e.g. ['active', 'inactive']
   */
  options: Record<string, string> | (string | number)[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  tooltip?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  clearable: true,
  placeholder: 'Select a value',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const panelStyle = ref<Record<string, string>>({})

const normalised = computed(() => {
  if (Array.isArray(props.options)) {
    return props.options.map(v => ({ value: String(v), label: String(v) }))
  }
  return Object.entries(props.options).map(([value, label]) => ({ value, label }))
})

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === '') return null
  const opt = normalised.value.find(o => o.value === String(props.modelValue))
  return opt?.label ?? String(props.modelValue)
})

function select(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let top = rect.bottom + 4
  if (top + 230 > window.innerHeight - 8) top = rect.top - 234
  panelStyle.value = { top: `${top}px`, left: `${rect.left}px`, minWidth: `${rect.width}px` }
}

function toggle() {
  if (isOpen.value) { isOpen.value = false; return }
  computePosition()
  isOpen.value = true
}
</script>
