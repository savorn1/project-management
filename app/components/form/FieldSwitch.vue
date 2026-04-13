<template>
  <FieldWrapper :hint="hint" :error="error">
    <div class="flex items-center justify-between gap-4">
      <div v-if="label || description" class="flex-1 min-w-0">
        <span class="text-sm font-medium text-gray-200">
          {{ label }}
          <span v-if="required" class="text-rose-400 ml-0.5">*</span>
        </span>
        <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="!!modelValue"
        :disabled="disabled"
        class="relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        :class="[
          size === 'sm' ? 'h-5 w-9' : size === 'lg' ? 'h-7 w-14' : 'h-6 w-11',
          modelValue ? (color === 'indigo' ? 'bg-indigo-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-' + color + '-600') : 'bg-slate-600',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
        ]"
        @click="!disabled && emit('update:modelValue', !modelValue)"
      >
        <span
          class="pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out"
          :class="[
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
            modelValue
              ? (size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-7' : 'translate-x-5')
              : 'translate-x-0',
          ]"
        />
      </button>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  description?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky'
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  color: 'indigo',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
