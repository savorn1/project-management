<template>
  <FieldWrapper :label="label" :hint="hint" :error="visibleError" :required="required" :input-id="uid" :tooltip="tooltip">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <input
        :id="uid"
        :value="modelValue"
        type="email"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :multiple="multiple"
        class="w-full pl-9 py-2 bg-slate-700 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none transition-colors"
        :class="[
          visibleError ? 'border-rose-500 focus:border-rose-500 pr-9' : 'border-slate-600 focus:border-indigo-500 pr-3',
          disabled || readonly ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500',
        ]"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @blur="onBlur"
      />

      <!-- Valid / invalid indicator -->
      <div v-if="modelValue" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg v-if="isValid" class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="everBlurred" class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
type Rule = (value: string) => string | boolean | null | undefined

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  multiple?: boolean
  autocomplete?: string
  tooltip?: string
  id?: string
  rules?: Rule[]
  validateOn?: 'blur' | 'input' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'name@example.com',
  autocomplete: 'email',
  validateOn: 'blur',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const innerError  = ref('')
const everBlurred = ref(false)
const visibleError = computed(() => innerError.value || props.error || '')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValid  = computed(() => !props.modelValue || EMAIL_RE.test(props.modelValue))

function runRules(value: string): boolean {
  // Built-in format check first
  if (value && !EMAIL_RE.test(value)) {
    innerError.value = 'Enter a valid email address'
    return false
  }
  // Custom rules
  if (props.rules?.length) {
    for (const rule of props.rules) {
      const result = rule(value)
      if (result !== true && result !== null && result !== undefined && result !== '') {
        innerError.value = result === false ? 'Invalid value' : String(result)
        return false
      }
    }
  }
  innerError.value = ''
  return true
}

function onInput(val: string) {
  emit('update:modelValue', val)
  if (props.validateOn === 'input' || (props.validateOn === 'blur' && everBlurred.value)) {
    runRules(val)
  }
}

function onBlur(e: FocusEvent) {
  everBlurred.value = true
  if (props.validateOn !== 'none') runRules(props.modelValue)
  emit('blur', e)
}

function validate(): boolean {
  everBlurred.value = true
  return runRules(props.modelValue)
}

function clearValidation() {
  innerError.value = ''
  everBlurred.value = false
}

defineExpose({ validate, clearValidation })
</script>
