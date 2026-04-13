<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div class="relative">
      <input
        :id="uid"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        class="w-full pl-3 pr-10 py-2 bg-slate-700 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none transition-colors"
        :class="[
          error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-600 focus:border-indigo-500',
          disabled || readonly ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Show / hide toggle -->
      <button
        v-if="!disabled && !readonly"
        type="button"
        tabindex="-1"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200 transition-colors"
        @click="showPassword = !showPassword"
      >
        <!-- Eye (show) -->
        <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <!-- Eye-off (hide) -->
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>
    </div>

    <!-- Strength meter -->
    <div v-if="showStrength && modelValue" class="mt-2">
      <div class="flex gap-1 mb-1">
        <div
          v-for="i in 4"
          :key="i"
          class="h-1 flex-1 rounded-full transition-colors duration-300"
          :class="i <= strength.score ? strength.color : 'bg-slate-700'"
        />
      </div>
      <p class="text-xs" :class="strength.textColor">{{ strength.label }}</p>
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
  autocomplete?: string
  /** Show a 4-segment password strength meter */
  showStrength?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  autocomplete: 'current-password',
  showStrength: false,
})

const _autoId = useId()
const uid = computed(() => _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const showPassword = ref(false)

const strength = computed(() => {
  const v = props.modelValue
  if (!v) return { score: 0, label: '', color: '', textColor: '' }

  let score = 0
  if (v.length >= 8)  score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++

  const levels = [
    { label: 'Weak',    color: 'bg-rose-500',   textColor: 'text-rose-400' },
    { label: 'Fair',    color: 'bg-amber-500',  textColor: 'text-amber-400' },
    { label: 'Good',    color: 'bg-yellow-400', textColor: 'text-yellow-400' },
    { label: 'Strong',  color: 'bg-emerald-500',textColor: 'text-emerald-400' },
  ]
  const level = levels[score - 1] ?? levels[0]!
  return { score, ...level }
})
</script>
