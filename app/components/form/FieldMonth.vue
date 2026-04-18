<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip">
    <div ref="containerRef" class="relative">
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 border rounded-lg text-sm transition-colors focus:outline-none"
        :class="[
          error ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        :disabled="disabled"
        @click="toggle"
      >
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span :class="modelValue ? 'text-white' : 'text-gray-400'" class="flex-1 text-left">
          {{ display }}
        </span>
        <button
          v-if="clearable && modelValue"
          type="button"
          class="p-0.5 text-gray-500 hover:text-gray-300 rounded"
          @click.stop="emit('update:modelValue', null)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </button>

      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div
          v-if="isOpen"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          style="z-index:99999; width:280px;"
          :style="panelStyle"
          @click.stop
        >
          <!-- Year nav -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
            <button type="button" class="p-1 text-gray-400 hover:text-white rounded transition-colors" @click="localYear--">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-white tabular-nums">{{ localYear }}</span>
            <button type="button" class="p-1 text-gray-400 hover:text-white rounded transition-colors" @click="localYear++">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <!-- Month grid -->
          <div class="grid grid-cols-4 gap-1 p-3">
            <button
              v-for="(m, idx) in MONTH_NAMES"
              :key="idx"
              type="button"
              class="py-2 text-xs rounded-lg transition-colors text-center"
              :class="isSelected(idx) ? 'bg-indigo-600 text-white font-medium' : 'text-gray-300 hover:bg-slate-700'"
              @click="select(idx)"
            >{{ m }}</button>
          </div>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Props {
  /** ISO month string "YYYY-MM" or null */
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const panelStyle = ref<Record<string, string>>({})
const localYear = ref(new Date().getFullYear())

const display = computed(() => {
  if (!props.modelValue) return 'Select month'
  const [y, m] = props.modelValue.split('-').map(Number)
  return `${MONTH_FULL[(m ?? 1) - 1]} ${y}`
})

function isSelected(monthIdx: number) {
  if (!props.modelValue) return false
  const [y, m] = props.modelValue.split('-').map(Number)
  return y === localYear.value && (m ?? 1) - 1 === monthIdx
}

function select(monthIdx: number) {
  const m = String(monthIdx + 1).padStart(2, '0')
  emit('update:modelValue', `${localYear.value}-${m}`)
  isOpen.value = false
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let top = rect.bottom + 4
  if (top + 230 > window.innerHeight - 8) top = rect.top - 234
  panelStyle.value = { top: `${top}px`, left: `${rect.left}px` }
}

function toggle() {
  if (isOpen.value) { isOpen.value = false; return }
  if (props.modelValue) {
    const [y] = props.modelValue.split('-').map(Number)
    localYear.value = y ?? new Date().getFullYear()
  }
  computePosition()
  isOpen.value = true
}
</script>
