<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div :class="error ? 'ring-1 ring-rose-500 rounded-lg' : ''">
      <WysiwygEditor
        :model-value="modelValue"
        :placeholder="placeholder"
        @update:model-value="emit('update:modelValue', $event)"
      />
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
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Start typing...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
