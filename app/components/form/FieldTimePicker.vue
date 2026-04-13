<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip">
    <div ref="containerRef" class="relative">
      <!-- Trigger -->
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 border rounded-lg text-sm transition-colors focus:outline-none"
        :class="[
          error   ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        :disabled="disabled"
        @click="toggle"
      >
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span :class="modelValue ? 'text-white' : 'text-gray-400'" class="flex-1 text-left tabular-nums">
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

      <!-- Dropdown panel -->
      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div
          v-if="isOpen"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          style="z-index:99999; width:240px;"
          :style="panelStyle"
          @click.stop
        >
          <!-- Scrollable columns -->
          <div class="flex divide-x divide-slate-700/60">
            <!-- Hours -->
            <div class="flex-1 flex flex-col">
              <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-center py-2 border-b border-slate-700/60">HH</p>
              <div class="overflow-y-auto max-h-44 py-1 scrollbar-hide">
                <button
                  v-for="h in hours"
                  :key="h"
                  type="button"
                  class="w-full py-1.5 text-sm text-center transition-colors tabular-nums"
                  :class="h === localH ? 'bg-indigo-600 text-white font-medium' : 'text-gray-300 hover:bg-slate-700'"
                  @click="localH = h; maybeCommit()"
                >{{ String(h).padStart(2, '0') }}</button>
              </div>
            </div>
            <!-- Minutes -->
            <div class="flex-1 flex flex-col">
              <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-center py-2 border-b border-slate-700/60">MM</p>
              <div class="overflow-y-auto max-h-44 py-1 scrollbar-hide">
                <button
                  v-for="m in minutes"
                  :key="m"
                  type="button"
                  class="w-full py-1.5 text-sm text-center transition-colors tabular-nums"
                  :class="m === localM ? 'bg-indigo-600 text-white font-medium' : 'text-gray-300 hover:bg-slate-700'"
                  @click="localM = m; maybeCommit()"
                >{{ String(m).padStart(2, '0') }}</button>
              </div>
            </div>
            <!-- AM/PM (12h only) -->
            <div v-if="!use24h" class="w-16 flex flex-col">
              <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-center py-2 border-b border-slate-700/60">AP</p>
              <div class="py-1 space-y-1 px-1">
                <button
                  v-for="ap in ['AM', 'PM']"
                  :key="ap"
                  type="button"
                  class="w-full py-2 text-xs text-center rounded-lg transition-colors"
                  :class="ap === localAP ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:bg-slate-700'"
                  @click="localAP = ap as 'AM'|'PM'; maybeCommit()"
                >{{ ap }}</button>
              </div>
            </div>
          </div>
          <!-- Confirm button -->
          <div class="border-t border-slate-700/60 p-2">
            <button
              type="button"
              class="w-full py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              @click="commit"
            >Set time</button>
          </div>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** "HH:mm" 24-hour string or null */
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  /** Use 24-hour format (default true) */
  use24h?: boolean
  /** Minute step granularity */
  minuteStep?: number
  placeholder?: string
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  use24h: true,
  minuteStep: 5,
  placeholder: 'Select time',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const panelStyle = ref<Record<string, string>>({})

// Local state
const localH = ref(0)
const localM = ref(0)
const localAP = ref<'AM' | 'PM'>('AM')

const hours = computed(() =>
  props.use24h ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 1)
)
const minutes = computed(() =>
  Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, i) => i * props.minuteStep)
)

const display = computed(() => {
  if (!props.modelValue) return props.placeholder
  const [h, m] = props.modelValue.split(':').map(Number)
  if (props.use24h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ap = h! < 12 ? 'AM' : 'PM'
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
})

function syncLocals() {
  if (!props.modelValue) return
  const [h, m] = props.modelValue.split(':').map(Number)
  if (props.use24h) {
    localH.value = h!
  } else {
    localAP.value = h! < 12 ? 'AM' : 'PM'
    localH.value = h === 0 ? 12 : h! > 12 ? h! - 12 : h!
  }
  localM.value = m!
}

function toValue(): string {
  let h = localH.value
  if (!props.use24h) {
    if (localAP.value === 'AM') h = h === 12 ? 0 : h
    else h = h === 12 ? 12 : h + 12
  }
  return `${String(h).padStart(2, '0')}:${String(localM.value).padStart(2, '0')}`
}

function maybeCommit() { /* auto-update preview only */ }

function commit() {
  emit('update:modelValue', toValue())
  isOpen.value = false
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let top = rect.bottom + 4
  if (top + 260 > window.innerHeight - 8) top = rect.top - 264
  panelStyle.value = { top: `${top}px`, left: `${rect.left}px` }
}

function toggle() {
  if (isOpen.value) { isOpen.value = false; return }
  syncLocals()
  computePosition()
  isOpen.value = true
}
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
