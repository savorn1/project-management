<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip">
    <div ref="containerRef" class="relative">
      <!-- Trigger -->
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-700 border rounded-lg text-sm transition-colors focus:outline-none"
        :class="[
          error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-600 focus:border-indigo-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500',
        ]"
        :disabled="disabled"
        @click="toggle"
      >
        <span :class="selectedOption ? 'text-white' : 'text-gray-400'">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button
            v-if="clearable && selectedOption"
            type="button"
            class="p-0.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
            @click.stop="clear"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg
            class="w-4 h-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': isOpen }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <!-- Dropdown -->
      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div
          v-if="isOpen"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
          style="z-index:99999;"
          :style="panelStyle"
          @click.stop
        >
          <!-- Search -->
          <div class="p-2 border-b border-slate-700/60">
            <input
              ref="searchRef"
              v-model="search"
              type="text"
              class="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="Search..."
              @click.stop
            />
          </div>
          <!-- Options -->
          <ul class="overflow-y-auto max-h-52 py-1">
            <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
              No options found
            </li>
            <li
              v-for="opt in filteredOptions"
              :key="opt.value"
              class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors"
              :class="isSelected(opt.value) ? 'bg-indigo-600 text-white' : 'text-gray-200 hover:bg-slate-700'"
              @click="select(opt)"
            >
              <svg v-if="isSelected(opt.value)" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="w-4 flex-shrink-0" />
              {{ opt.label }}
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
  [key: string]: unknown
}

interface Props {
  modelValue: string | number | null
  options: SelectOption[]
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [option: SelectOption | null]
}>()

const containerRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const search = ref('')
const panelStyle = ref<Record<string, string>>({})

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue) ?? null
)

const filteredOptions = computed(() => {
  const q = search.value.toLowerCase()
  return q ? props.options.filter(o => o.label.toLowerCase().includes(q)) : props.options
})

function isSelected(val: string | number) {
  return props.modelValue === val
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelW = rect.width
  const panelH = 280
  let top = rect.bottom + 4
  if (top + panelH > window.innerHeight - 8) top = rect.top - panelH - 4
  if (top < 8) top = 8
  let left = rect.left
  if (left + panelW > window.innerWidth - 16) left = window.innerWidth - panelW - 16
  if (left < 8) left = 8
  panelStyle.value = { top: `${top}px`, left: `${left}px`, width: `${panelW}px` }
}

function toggle() {
  if (props.disabled) return
  if (isOpen.value) { isOpen.value = false; return }
  computePosition()
  isOpen.value = true
  search.value = ''
  nextTick(() => searchRef.value?.focus())
}

function select(opt: SelectOption) {
  emit('update:modelValue', opt.value)
  emit('change', opt)
  isOpen.value = false
}

function clear() {
  emit('update:modelValue', null)
  emit('change', null)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) isOpen.value = false
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
