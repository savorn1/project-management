<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip" :input-id="uid">
    <div class="flex items-center gap-3">
      <button
        :id="uid"
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800"
        :class="[
          modelValue
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 focus:ring-emerald-500'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 focus:ring-rose-500',
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        ]"
        :disabled="disabled"
        @click="emit('update:modelValue', !modelValue)"
      >
        <svg v-if="modelValue" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ modelValue ? trueLabel : falseLabel }}
      </button>
      <span class="text-xs text-gray-500">{{ modelValue ? trueHint : falseHint }}</span>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  tooltip?: string
  trueLabel?: string
  falseLabel?: string
  /** Extra descriptive text shown beside the button when true */
  trueHint?: string
  /** Extra descriptive text shown beside the button when false */
  falseHint?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  trueLabel: 'Yes',
  falseLabel: 'No',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
