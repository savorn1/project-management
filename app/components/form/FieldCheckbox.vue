<template>
  <FieldWrapper :hint="hint" :error="error">
    <!-- Single checkbox -->
    <label
      v-if="!options"
      class="inline-flex items-start gap-3 cursor-pointer group"
      :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
    >
      <div class="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="!!modelValue"
          :disabled="disabled"
          :required="required"
          @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <!-- Custom box -->
        <div
          class="w-4.5 h-4.5 rounded border-2 transition-all flex items-center justify-center"
          :class="modelValue
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-slate-700 border-slate-500 group-hover:border-slate-400'"
          style="width: 18px; height: 18px;"
        >
          <svg
            v-if="modelValue"
            class="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div class="select-none">
        <span class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
          {{ label }}
          <span v-if="required" class="text-rose-400 ml-0.5">*</span>
        </span>
        <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
      </div>
    </label>

    <!-- Checkbox group -->
    <div v-else class="space-y-2">
      <p v-if="label" class="text-sm font-medium text-gray-300 mb-2">
        {{ label }}
        <span v-if="required" class="text-rose-400 ml-0.5">*</span>
      </p>
      <label
        v-for="opt in options"
        :key="opt.value"
        class="flex items-start gap-3 cursor-pointer group"
        :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
      >
        <div class="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            class="sr-only"
            :value="opt.value"
            :checked="groupValue.includes(opt.value)"
            :disabled="disabled || opt.disabled"
            @change="toggleGroup(opt.value)"
          />
          <div
            class="rounded border-2 transition-all flex items-center justify-center"
            :class="groupValue.includes(opt.value)
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-slate-700 border-slate-500 group-hover:border-slate-400'"
            style="width: 18px; height: 18px;"
          >
            <svg
              v-if="groupValue.includes(opt.value)"
              class="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div class="select-none">
          <span class="text-sm text-gray-200 group-hover:text-white transition-colors">{{ opt.label }}</span>
          <p v-if="opt.description" class="text-xs text-gray-500">{{ opt.description }}</p>
        </div>
      </label>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface CheckboxOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  /** Single mode: boolean. Group mode: not used (use groupValue). */
  modelValue?: boolean
  /** Group mode: selected values array */
  groupValue?: (string | number)[]
  /** Provide options for checkbox group mode */
  options?: CheckboxOption[]
  label?: string
  description?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  groupValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:groupValue': [value: (string | number)[]]
}>()

function toggleGroup(val: string | number) {
  const next = props.groupValue.includes(val)
    ? props.groupValue.filter(v => v !== val)
    : [...props.groupValue, val]
  emit('update:groupValue', next)
}
</script>
