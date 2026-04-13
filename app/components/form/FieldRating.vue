<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="flex items-center gap-1" @mouseleave="hovered = 0">
      <button
        v-for="i in max"
        :key="i"
        type="button"
        :disabled="disabled || readonly"
        :title="`${allowHalf ? i - 0.5 : i} – ${i} ${i === 1 ? 'star' : 'stars'}`"
        class="focus:outline-none transition-transform relative"
        :class="[
          disabled || readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus:scale-110',
        ]"
        @mousemove="onStarHover(i, $event)"
        @click="select(hovered || i)"
      >
        <!-- Half-star hit area (left 50%) -->
        <span
          v-if="allowHalf && !disabled && !readonly"
          class="absolute inset-y-0 left-0 w-1/2 z-10"
          @mousemove.stop="hovered = i - 0.5"
        />
        <!-- Full / half / empty star -->
        <svg
          :class="[
            'transition-colors',
            active(i) === 'full'  ? (colorClass) : '',
            active(i) === 'half'  ? (colorClass) : '',
            active(i) === 'empty' ? 'text-slate-600' : '',
          ]"
          :style="{ width: iconSize, height: iconSize }"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <defs>
            <clipPath :id="`half-${i}`">
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <!-- Empty background -->
          <path
            class="text-slate-600"
            fill="currentColor"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
          <!-- Filled foreground (full or half via clip) -->
          <path
            :fill="active(i) !== 'empty' ? 'currentColor' : 'transparent'"
            :class="active(i) !== 'empty' ? colorClass : ''"
            :clip-path="active(i) === 'half' ? `url(#half-${i})` : undefined"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </button>

      <span v-if="showValue && modelValue" class="ml-2 text-sm font-medium text-gray-300">
        {{ modelValue }}<span class="text-gray-500"> / {{ max }}</span>
      </span>

      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="ml-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        @click="emit('update:modelValue', null)"
      >Clear</button>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number | null
  max?: number
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** Allow half-star values */
  allowHalf?: boolean
  /** Show numeric value next to the stars */
  showValue?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'amber' | 'indigo' | 'rose' | 'emerald'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  max: 5,
  size: 'md',
  color: 'amber',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const hovered = ref(0)

function onStarHover(i: number, _e: MouseEvent) {
  if (props.disabled || props.readonly) return
  hovered.value = i
}

const display = computed(() => hovered.value || props.modelValue || 0)

const colorClass = computed(() => ({
  amber: 'text-amber-400',
  indigo: 'text-indigo-400',
  rose: 'text-rose-400',
  emerald: 'text-emerald-400',
}[props.color ?? 'amber']))

const iconSize = computed(() => ({ sm: '20px', md: '28px', lg: '36px' }[props.size ?? 'md']))

function active(i: number): 'full' | 'half' | 'empty' {
  const val = display.value
  if (props.allowHalf) {
    if (i <= Math.floor(val)) return 'full'
    if (i === Math.ceil(val) && val % 1 >= 0.5) return 'half'
    return 'empty'
  }
  return i <= val ? 'full' : 'empty'
}

function select(val: number) {
  if (props.disabled || props.readonly) return
  if (props.clearable && props.modelValue === val) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', val)
  }
}
</script>
