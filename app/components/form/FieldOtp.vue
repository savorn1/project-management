<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="flex items-center gap-2">
      <template v-for="(_, i) in length" :key="i">
        <input
          :ref="el => { if (el) inputs[i] = el as HTMLInputElement }"
          v-model="cells[i]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-11 h-12 text-center text-lg font-bold bg-slate-700 border-2 rounded-xl text-white focus:outline-none transition-all tabular-nums"
          :class="[
            error
              ? 'border-rose-500 focus:border-rose-400'
              : cells[i]
                ? 'border-indigo-500 focus:border-indigo-400'
                : 'border-slate-600 focus:border-indigo-500',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :disabled="disabled"
          @keydown="onKeydown(i, $event)"
          @input="onInput(i, $event)"
          @paste.prevent="onPaste($event)"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <!-- Separator after every `groupSize` digits -->
        <span
          v-if="separator && i < length - 1 && (i + 1) % groupSize === 0"
          class="text-gray-500 font-bold text-lg select-none"
        >{{ separator }}</span>
      </template>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  /** Number of OTP digits */
  length?: number
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Separator character shown between groups (e.g. "-") */
  separator?: string
  /** How many digits per group before showing the separator */
  groupSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 6,
  groupSize: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** Fires when all digits are filled */
  'complete': [value: string]
}>()

const inputs = ref<HTMLInputElement[]>([])
const cells = ref<string[]>(Array.from({ length: props.length }, (_, i) => props.modelValue[i] ?? ''))

watch(() => props.modelValue, (val) => {
  cells.value = Array.from({ length: props.length }, (_, i) => val[i] ?? '')
})

function emitValue() {
  const joined = cells.value.join('')
  emit('update:modelValue', joined)
  if (joined.length === props.length && !joined.includes('')) {
    emit('complete', joined)
  }
}

function onInput(i: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value
  // Keep only the last digit entered (handles browser autofill of single char)
  const digit = raw.replace(/\D/g, '').slice(-1)
  cells.value[i] = digit
  emitValue()
  if (digit && i < props.length - 1) {
    inputs.value[i + 1]?.focus()
  }
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace') {
    if (cells.value[i]) {
      cells.value[i] = ''
      emitValue()
    } else if (i > 0) {
      inputs.value[i - 1]?.focus()
    }
  } else if (e.key === 'ArrowLeft' && i > 0) {
    inputs.value[i - 1]?.focus()
  } else if (e.key === 'ArrowRight' && i < props.length - 1) {
    inputs.value[i + 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const digits = text.replace(/\D/g, '').slice(0, props.length)
  digits.split('').forEach((d, i) => { cells.value[i] = d })
  emitValue()
  const nextEmpty = digits.length < props.length ? digits.length : props.length - 1
  inputs.value[nextEmpty]?.focus()
}
</script>
