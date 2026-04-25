<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <div class="space-y-2">
      <!-- Track + thumb -->
      <div class="relative flex items-center" :style="{ height: '20px' }">
        <!-- Background track -->
        <div class="absolute inset-x-0 h-1.5 rounded-full bg-slate-600" />
        <!-- Filled track -->
        <div
          class="absolute h-1.5 rounded-full pointer-events-none transition-all"
          :class="disabled ? 'bg-slate-500' : 'bg-indigo-500'"
          :style="{ left: `${leftPct}%`, width: `${widthPct}%` }"
        />
        <!-- Hidden range inputs for dual-thumb -->
        <input
          v-if="range"
          type="range"
          class="range-thumb absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
          :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
          :min="min" :max="max" :step="step" :disabled="disabled"
          :value="Array.isArray(modelValue) ? modelValue[0] : min"
          @input="onFromInput"
        />
        <input
          :id="uid"
          type="range"
          class="range-thumb absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
          :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
          :min="min" :max="max" :step="step" :disabled="disabled"
          :value="Array.isArray(modelValue) ? modelValue[1] : (typeof modelValue === 'number' ? modelValue : min)"
          @input="onToInput"
        />
      </div>

      <!-- Labels row -->
      <div class="flex items-center justify-between text-xs text-gray-400 select-none">
        <span>{{ formatVal(min) }}</span>
        <span class="font-medium text-indigo-300">
          <template v-if="range && Array.isArray(modelValue)">
            {{ formatVal(modelValue[0]!) }} – {{ formatVal(modelValue[1]!) }}
          </template>
          <template v-else>
            {{ formatVal(typeof modelValue === 'number' ? modelValue : min) }}
          </template>
        </span>
        <span>{{ formatVal(max) }}</span>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** Single mode: number. Range mode: [from, to] */
  modelValue: number | [number, number]
  min?: number
  max?: number
  step?: number
  /** Enable dual-thumb range selection */
  range?: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Optional unit suffix shown in the value label (e.g. "px", "%", " kg") */
  unit?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  range: false,
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: number | [number, number]]
}>()

const leftPct = computed(() => {
  const from = props.range && Array.isArray(props.modelValue)
    ? props.modelValue[0]!
    : props.min
  return ((from - props.min) / (props.max - props.min)) * 100
})

const widthPct = computed(() => {
  const to = props.range && Array.isArray(props.modelValue)
    ? props.modelValue[1]!
    : (typeof props.modelValue === 'number' ? props.modelValue : props.min)
  const from = props.range && Array.isArray(props.modelValue)
    ? props.modelValue[0]!
    : props.min
  return ((to - from) / (props.max - props.min)) * 100
})

function formatVal(v: number) {
  return props.unit ? `${v}${props.unit}` : String(v)
}

function onFromInput(e: Event) {
  const raw = Number((e.target as HTMLInputElement).value)
  const to = Array.isArray(props.modelValue) ? props.modelValue[1]! : props.max
  emit('update:modelValue', [Math.min(raw, to), to])
}

function onToInput(e: Event) {
  const raw = Number((e.target as HTMLInputElement).value)
  if (props.range && Array.isArray(props.modelValue)) {
    const from = props.modelValue[0]!
    emit('update:modelValue', [from, Math.max(raw, from)])
  } else {
    emit('update:modelValue', raw)
  }
}
</script>

<style scoped>
.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
  cursor: pointer;
  transition: background .15s, transform .1s;
}
.range-thumb::-webkit-slider-thumb:hover {
  background: #818cf8;
  transform: scale(1.15);
}
.range-thumb:disabled::-webkit-slider-thumb {
  background: #64748b;
  cursor: not-allowed;
}
.range-thumb::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
  cursor: pointer;
}
</style>
