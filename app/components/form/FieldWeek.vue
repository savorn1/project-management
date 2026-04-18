<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled ? 'opacity-50' : '',
      ]"
    >
      <span class="pl-3 pr-1.5 pointer-events-none text-gray-400 flex-shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
      <input
        :id="uid"
        :value="modelValue ?? ''"
        type="week"
        :disabled="disabled"
        :min="min"
        :max="max"
        class="flex-1 min-w-0 bg-transparent pl-1.5 pr-3 py-2 text-sm text-white focus:outline-none [color-scheme:dark]"
        @input="onInput"
        @change="onInput"
      />
      <button
        v-if="clearable && modelValue"
        type="button"
        class="pr-3 pl-1.5 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
        @click="emit('update:modelValue', null)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <!-- Friendly display -->
    <p v-if="modelValue" class="mt-1 text-xs text-gray-500">{{ friendly }}</p>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** ISO week string "YYYY-Www" e.g. "2025-W18", or null */
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  min?: string
  max?: string
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)

/** Friendly label e.g. "Week 18 of 2025 (Apr 28 – May 4)" */
const friendly = computed(() => {
  if (!props.modelValue) return ''
  const match = props.modelValue.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return props.modelValue
  const [, y, w] = match
  // ISO week to date: Jan 4 of year is always in week 1
  const jan4 = new Date(Number(y), 0, 4)
  const startOfW1 = new Date(jan4)
  startOfW1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const monday = new Date(startOfW1)
  monday.setDate(startOfW1.getDate() + (Number(w) - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Week ${w} of ${y} · ${fmt(monday)} – ${fmt(sunday)}`
})

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v || null)
}
</script>
