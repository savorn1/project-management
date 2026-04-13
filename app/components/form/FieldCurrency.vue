<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        error    ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled ? 'opacity-50'        : '',
      ]"
    >
      <!-- Currency symbol -->
      <span class="pl-3 pr-1.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0 select-none pointer-events-none font-medium">
        {{ currencySymbol }}
      </span>

      <input
        :id="uid"
        ref="inputRef"
        :value="rawText"
        type="text"
        inputmode="decimal"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="flex-1 min-w-0 bg-transparent py-2 pr-1.5 text-sm text-white placeholder-gray-400 focus:outline-none text-right tabular-nums"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown.up.prevent="step(1)"
        @keydown.down.prevent="step(-1)"
      />

      <!-- Currency code badge -->
      <span class="pr-3 pl-1.5 text-xs text-gray-500 whitespace-nowrap flex-shrink-0 select-none pointer-events-none font-mono uppercase">
        {{ currency }}
      </span>
    </div>

    <!-- Formatted display hint below input -->
    <p v-if="modelValue !== null && !isFocused" class="mt-1 text-xs text-gray-500 text-right tabular-nums">
      {{ formatted }}
    </p>
  </FieldWrapper>
</template>

<script setup lang="ts">
const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  KHR: '៛', THB: '฿', VND: '₫', SGD: 'S$', MYR: 'RM',
  INR: '₹', BRL: 'R$', AUD: 'A$', CAD: 'C$', CHF: 'Fr',
  KRW: '₩', AED: 'د.إ', SAR: '﷼',
}

interface Props {
  modelValue: number | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  /** ISO 4217 currency code */
  currency?: string
  /** Decimal places (default 2, 0 for JPY/KRW/KHR) */
  decimals?: number
  /** BCP 47 locale for number formatting */
  locale?: string
  min?: number
  max?: number
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  currency: 'USD',
  decimals: 2,
  locale: 'en-US',
  placeholder: '0.00',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)
const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const rawText = ref(props.modelValue !== null ? String(props.modelValue) : '')

const currencySymbol = computed(() => SYMBOLS[props.currency.toUpperCase()] ?? props.currency)

const formatted = computed(() => {
  if (props.modelValue === null) return ''
  try {
    return new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    }).format(props.modelValue)
  } catch {
    return String(props.modelValue)
  }
})

watch(() => props.modelValue, (val) => {
  if (isFocused.value) return
  rawText.value = val !== null ? String(val) : ''
})

function clamp(n: number) {
  let v = n
  if (props.min !== undefined) v = Math.max(props.min, v)
  if (props.max !== undefined) v = Math.min(props.max, v)
  return v
}

function round(n: number) {
  return parseFloat(n.toFixed(props.decimals))
}

function onFocus() {
  isFocused.value = true
  rawText.value = props.modelValue !== null ? String(props.modelValue) : ''
}

function onBlur() {
  isFocused.value = false
  if (props.modelValue !== null) {
    const clamped = round(clamp(props.modelValue))
    rawText.value = String(clamped)
    if (clamped !== props.modelValue) emit('update:modelValue', clamped)
  } else {
    rawText.value = ''
  }
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const cleaned = raw.replace(/[^\d.-]/g, '').replace(/(?<!^)-/g, '').replace(/(\..*)\./g, '$1')
  rawText.value = cleaned
  const num = parseFloat(cleaned)
  emit('update:modelValue', isNaN(num) ? null : num)
}

function step(dir: 1 | -1) {
  const step = Math.pow(10, -props.decimals)
  const current = props.modelValue ?? 0
  const next = round(clamp(current + dir * step * 100)) // step = 1 unit
  rawText.value = String(next)
  emit('update:modelValue', next)
}
</script>
