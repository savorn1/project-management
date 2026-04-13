<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="flex items-center gap-2">
      <!-- From -->
      <div
        class="flex-1 flex items-center px-3 py-2 bg-slate-700 border rounded-lg transition-colors"
        :class="[
          error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : '',
        ]"
      >
        <DatePicker
          :model-value="modelValue.from"
          placeholder="Start date"
          :clearable="true"
          trigger-class="flex-1"
          @update:model-value="onFromChange"
        />
      </div>

      <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>

      <!-- To -->
      <div
        class="flex-1 flex items-center px-3 py-2 bg-slate-700 border rounded-lg transition-colors"
        :class="[
          error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : '',
        ]"
      >
        <DatePicker
          :model-value="modelValue.to"
          placeholder="End date"
          :clearable="true"
          trigger-class="flex-1"
          @update:model-value="onToChange"
        />
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface DateRangeValue {
  from: string | null
  to: string | null
}

interface Props {
  modelValue: DateRangeValue
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ from: null, to: null }),
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRangeValue]
}>()

function onFromChange(from: string | null) {
  emit('update:modelValue', { ...props.modelValue, from })
}

function onToChange(to: string | null) {
  emit('update:modelValue', { ...props.modelValue, to })
}
</script>
