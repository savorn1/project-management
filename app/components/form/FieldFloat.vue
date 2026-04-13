<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        error    ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled || readonly ? 'opacity-50' : '',
      ]"
    >
      <!-- Prefix -->
      <span v-if="$slots.prefix || prefix" class="pl-3 pr-1.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0 pointer-events-none select-none">
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <input
        :id="uid"
        ref="inputRef"
        :value="rawText"
        type="text"
        inputmode="decimal"
        :placeholder="placeholder ?? `0.${'0'.repeat(decimals)}`"
        :disabled="disabled"
        :readonly="readonly"
        class="flex-1 min-w-0 bg-transparent py-2 text-sm text-white placeholder-gray-400 focus:outline-none text-right tabular-nums"
        :class="[
          $slots.prefix || prefix ? 'pl-1.5' : 'pl-3',
          showStepper || $slots.suffix || suffix ? 'pr-1.5' : 'pr-3',
          readonly ? 'cursor-not-allowed' : '',
        ]"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @blur="onBlur"
        @keydown.up.prevent="step(1)"
        @keydown.down.prevent="step(-1)"
      />

      <!-- Suffix -->
      <span v-if="($slots.suffix || suffix) && !showStepper" class="pr-3 pl-1.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0 pointer-events-none select-none">
        <slot name="suffix">{{ suffix }}</slot>
      </span>

      <!-- +/- stepper -->
      <div v-if="showStepper" class="flex flex-col self-stretch border-l border-slate-600 flex-shrink-0">
        <button
          type="button"
          :disabled="disabled || (max !== undefined && (modelValue ?? 0) >= max)"
          class="flex-1 px-2.5 text-gray-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 transition-colors"
          @click="step(1)"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          :disabled="disabled || (min !== undefined && (modelValue ?? 0) <= min)"
          class="flex-1 px-2.5 text-gray-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 transition-colors border-t border-slate-600"
          @click="step(-1)"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number | null
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  min?: number
  max?: number
  /** Increment/decrement step amount */
  step?: number
  /** Number of decimal places to enforce on blur */
  decimals?: number
  prefix?: string
  suffix?: string
  showStepper?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  step: 0.1,
  decimals: 2,
  showStepper: true,
})

const _autoId = useId()
const uid = computed(() => _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

// raw string lets user type "3." without it snapping to "3"
const rawText = ref(
  props.modelValue !== null && props.modelValue !== undefined
    ? String(props.modelValue)
    : ''
)

watch(() => props.modelValue, (val) => {
  const cur = parseFloat(rawText.value)
  if (val === null || val === undefined) { rawText.value = ''; return }
  if (isNaN(cur) || cur !== val) rawText.value = String(val)
})

function clamp(n: number) {
  let v = n
  if (props.min !== undefined) v = Math.max(props.min, v)
  if (props.max !== undefined) v = Math.min(props.max, v)
  return v
}

function roundDecimals(n: number) {
  return parseFloat(n.toFixed(props.decimals))
}

function onInput(raw: string) {
  // Allow digits, one dot, leading minus
  const cleaned = raw.replace(/[^\d.-]/g, '').replace(/(?<!^)-/g, '').replace(/(\..*)\./g, '$1')
  rawText.value = cleaned
  const num = parseFloat(cleaned)
  emit('update:modelValue', isNaN(num) ? null : num)
}

function onBlur() {
  if (props.modelValue !== null && props.modelValue !== undefined) {
    const clamped = roundDecimals(clamp(props.modelValue))
    rawText.value = String(clamped)
    if (clamped !== props.modelValue) emit('update:modelValue', clamped)
  } else {
    rawText.value = ''
  }
}

function step(dir: 1 | -1) {
  const current = props.modelValue ?? 0
  const next = roundDecimals(clamp(current + dir * (props.step ?? 0.1)))
  rawText.value = String(next)
  emit('update:modelValue', next)
}
</script>
