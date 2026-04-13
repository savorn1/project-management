<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div
      class="flex items-center px-3 py-2 bg-slate-700 border rounded-lg transition-colors"
      :class="[
        error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ]"
    >
      <DatePicker
        :model-value="modelValue"
        :placeholder="placeholder"
        :clearable="clearable"
        trigger-class="flex-1"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | null
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()
</script>
