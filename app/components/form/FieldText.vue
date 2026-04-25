<template>
  <FieldWrapper :label="label" :hint="hint" :error="visibleError" :required="required" :input-id="uid" :tooltip="tooltip">
    <!-- Flex row: [prefix] [input] [suffix/counter] — no absolute overlays -->
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        visibleError ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled || readonly ? 'opacity-50' : '',
      ]"
    >
      <!-- Prefix -->
      <span
        v-if="$slots.prefix || prefix"
        class="flex items-center pl-3 pr-1.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0 select-none pointer-events-none"
      >
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <input
        :id="uid"
        :value="modelValue"
        type="text"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        class="flex-1 min-w-0 bg-transparent py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
        :class="[
          $slots.prefix || prefix ? 'pl-1.5' : 'pl-3',
          $slots.suffix || suffix || showCounter ? 'pr-1.5' : 'pr-3',
          readonly ? 'cursor-not-allowed' : '',
        ]"
        @input="onInput"
        @blur="onBlur"
        @focus="emit('focus', $event)"
        @keydown.enter="emit('enter', ($event.target as HTMLInputElement).value)"
      />

      <!-- Suffix / counter -->
      <span
        v-if="$slots.suffix || suffix || showCounter"
        class="flex items-center pr-3 pl-1.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0 pointer-events-none select-none"
      >
        <slot name="suffix">
          <template v-if="suffix">{{ suffix }}</template>
          <span v-else-if="showCounter" class="text-xs text-gray-500">
            {{ modelValue?.length ?? 0 }}<span v-if="maxlength">/{{ maxlength }}</span>
          </span>
        </slot>
      </span>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
// A rule returns true (or nothing) when valid, or a non-empty string as the error message.
type Rule = (value: string) => string | boolean | null | undefined

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
  /** External error message — overridden by a failing rule when rules are present. */
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  id?: string
  name?: string
  prefix?: string
  suffix?: string
  maxlength?: number
  showCounter?: boolean
  autocomplete?: string
  tooltip?: string
  /**
   * Array of validator functions.
   * Each receives the current value and returns either `true` (valid)
   * or an error string (invalid). The first failing rule's message is shown.
   *
   * @example
   * :rules="[
   *   v => !!v || 'Required',
   *   v => v.length >= 3 || 'Minimum 3 characters',
   *   v => /^[a-z]+$/.test(v) || 'Lowercase letters only',
   * ]"
   */
  rules?: Rule[]
  /**
   * When to trigger rule validation.
   * - 'blur'  — on first blur, then live on every input (default)
   * - 'input' — on every keystroke immediately
   * - 'none'  — only when validate() is called programmatically
   */
  validateOn?: 'blur' | 'input' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  autocomplete: 'off',
  validateOn: 'blur',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'enter': [value: string]
}>()

// ─── Internal validation state ────────────────────────────────────────────────

const innerError  = ref('')
const everBlurred = ref(false)

/** Run all rules against a value; set innerError and return whether valid. */
function runRules(value: string): boolean {
  if (!props.rules?.length) { innerError.value = ''; return true }
  for (const rule of props.rules) {
    const result = rule(value)
    if (result !== true && result !== null && result !== undefined && result !== '') {
      innerError.value = result === false ? 'Invalid value' : String(result)
      return false
    }
  }
  innerError.value = ''
  return true
}

/** The error shown in the UI: rule error takes priority over external error prop. */
const visibleError = computed(() => innerError.value || props.error || '')

// ─── Event handlers ───────────────────────────────────────────────────────────

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  if (props.validateOn === 'input' || (props.validateOn === 'blur' && everBlurred.value)) {
    runRules(value)
  }
}

function onBlur(event: FocusEvent) {
  everBlurred.value = true
  if (props.validateOn !== 'none') runRules(props.modelValue)
  emit('blur', event)
}

// ─── Programmatic API ─────────────────────────────────────────────────────────

/** Call from a parent form's submit handler to trigger validation immediately. */
function validate(): boolean {
  everBlurred.value = true
  return runRules(props.modelValue)
}

/** Clear the internal rule error (external error prop is unaffected). */
function clearValidation() {
  innerError.value = ''
  everBlurred.value = false
}

defineExpose({ validate, clearValidation })
</script>
