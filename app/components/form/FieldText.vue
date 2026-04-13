<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <!-- Flex row: [prefix] [input] [suffix/counter] — no absolute overlays -->
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        error    ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
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
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur', $event)"
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
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
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
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  autocomplete: 'off',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'enter': [value: string]
}>()
</script>
