<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
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
          error    ? 'border-rose-500 focus:border-rose-500'       : 'border-slate-600 focus:border-indigo-500',
          disabled || readonly ? 'opacity-50 cursor-not-allowed'   : 'hover:border-slate-500',
          autoResize ? 'resize-none overflow-hidden'               : 'resize-y',
          showCounter ? 'pb-6' : '',
        ]"
        :style="autoResize ? { height: autoHeight } : {}"
        @input="onInput"
        @blur="emit('blur', $event)"
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
  /** Grow to fit content instead of showing a scrollbar */
  autoResize?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
})

const _autoId = useId()
const uid = computed(() => _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const autoHeight = ref('auto')

const charCount = computed(() => props.modelValue?.length ?? 0)
const atLimit = computed(() => !!props.maxlength && charCount.value >= props.maxlength)

function onInput(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  emit('update:modelValue', ta.value)
  if (props.autoResize) {
    autoHeight.value = 'auto'
    nextTick(() => { autoHeight.value = `${ta.scrollHeight}px` })
  }
}
</script>
