<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div :class="inline ? 'flex flex-wrap gap-x-5 gap-y-2' : 'space-y-2'">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="inline-flex items-start gap-3 cursor-pointer group"
        :class="disabled || opt.disabled ? 'opacity-50 cursor-not-allowed' : ''"
      >
        <div class="relative flex-shrink-0 mt-0.5">
          <input
            type="radio"
            class="sr-only peer"
            :name="name"
            :value="opt.value"
            :checked="modelValue === opt.value"
            :disabled="disabled || opt.disabled"
            @change="emit('update:modelValue', opt.value)"
          />
          <!-- Outer ring -->
          <div
            class="w-[18px] h-[18px] rounded-full border-2 transition-all flex items-center justify-center"
            :class="modelValue === opt.value
              ? 'border-indigo-500 bg-slate-700'
              : 'border-slate-500 bg-slate-700 group-hover:border-slate-400'"
          >
            <!-- Inner dot -->
            <div
              v-if="modelValue === opt.value"
              class="w-2 h-2 rounded-full bg-indigo-500 transition-transform"
            />
          </div>
        </div>
        <div class="select-none">
          <span class="text-sm text-gray-200 group-hover:text-white transition-colors">
            {{ opt.label }}
          </span>
          <p v-if="opt.description" class="text-xs text-gray-500 mt-0.5">{{ opt.description }}</p>
        </div>
      </label>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface RadioOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: RadioOption[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Render options in a horizontal row */
  inline?: boolean
  /** HTML name attribute shared across all radio inputs */
  name?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: null,
  inline: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
