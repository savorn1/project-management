<template>
  <FieldWrapper :label="label" :hint="hint" :error="error || validationError" :required="required" :input-id="uid" :tooltip="tooltip">
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
          error || validationError ? 'border-rose-500 focus:border-rose-500 pr-9' : 'border-slate-600 focus:border-indigo-500 pr-3',
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
        <svg v-else-if="touched" class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
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
  /** Validate on input instead of waiting for blur */
  validateOnInput?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'name@example.com',
  autocomplete: 'email',
})

const _autoId = useId()
const uid = computed(() => _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const touched = ref(false)
const validationError = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValid = computed(() =>
  !props.modelValue || EMAIL_RE.test(props.modelValue)
)

function validate(val: string) {
  if (!val) { validationError.value = ''; return }
  validationError.value = EMAIL_RE.test(val) ? '' : 'Enter a valid email address'
}

function onInput(val: string) {
  emit('update:modelValue', val)
  if (props.validateOnInput || touched.value) validate(val)
}

function onBlur(e: FocusEvent) {
  touched.value = true
  validate(props.modelValue)
  emit('blur', e)
}
</script>
