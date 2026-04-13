<template>
  <!-- select2_from_array: options sourced from a static array — delegates to FieldSelect2 -->
  <FieldSelect2
    :model-value="modelValue"
    :options="normalizedOptions"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :error="error"
    :required="required"
    :disabled="disabled"
    :clearable="clearable"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
  />
</template>

<script setup lang="ts">
import type { SelectOption } from './FieldSelect2.vue'

type ArrayOption = string | number | { value: string | number; label: string }

interface Props {
  modelValue: string | number | null
  /** Accepts plain strings/numbers or {value, label} objects */
  options: ArrayOption[]
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [option: SelectOption | null]
}>()

const normalizedOptions = computed((): SelectOption[] =>
  props.options.map(o =>
    typeof o === 'object' ? o : { value: o, label: String(o) }
  )
)
</script>
