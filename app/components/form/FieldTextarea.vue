<template>
  <FieldWrapper :label="label" :hint="hint" :error="visibleError" :required="required" :input-id="uid" :tooltip="tooltip">
    <div class="relative">
      <textarea
        :id="uid"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        class="w-full px-3 py-2 bg-slate-700 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none transition-colors leading-relaxed"
        :class="[
          visibleError ? 'border-rose-500 focus:border-rose-500'     : 'border-slate-600 focus:border-indigo-500',
          disabled || readonly ? 'opacity-50 cursor-not-allowed'     : 'hover:border-slate-500',
          autoResize ? 'resize-none overflow-hidden'                 : 'resize-y',
          showCounter ? 'pb-6' : '',
        ]"
        :style="autoResize ? { height: autoHeight } : {}"
        @input="onInput"
        @blur="onBlur"
        @focus="emit('focus', $event)"
      />

      <!-- Character counter -->
      <div
        v-if="showCounter"
        class="absolute bottom-2 right-3 text-xs pointer-events-none"
        :class="atLimit ? 'text-rose-400' : 'text-gray-500'"
      >
        {{ charCount }}<span v-if="maxlength">/{{ maxlength }}</span>
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
  rows?: number
  maxlength?: number
  showCounter?: boolean
  autoResize?: boolean
  tooltip?: string
  id?: string
  rules?: Rule[]
  validateOn?: 'blur' | 'input' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  validateOn: 'blur',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const autoHeight = ref('auto')
const innerError  = ref('')
const everBlurred = ref(false)

const charCount = computed(() => props.modelValue?.length ?? 0)
const atLimit   = computed(() => !!props.maxlength && charCount.value >= props.maxlength)
const visibleError = computed(() => innerError.value || props.error || '')

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

function onInput(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  emit('update:modelValue', ta.value)
  if (props.autoResize) {
    autoHeight.value = 'auto'
    nextTick(() => { autoHeight.value = `${ta.scrollHeight}px` })
  }
  if (props.validateOn === 'input' || (props.validateOn === 'blur' && everBlurred.value)) {
    runRules(ta.value)
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
