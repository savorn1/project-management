<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip" :input-id="uid">
    <div class="flex items-center gap-3">
      <!-- Swatch + native picker -->
      <label
        class="relative flex-shrink-0 cursor-pointer group"
        :class="disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
        :title="disabled ? '' : 'Click to open colour picker'"
      >
        <input
          type="color"
          class="sr-only"
          :value="modelValue ?? '#6366f1'"
          :disabled="disabled"
          @input="onNativePick"
        />
        <div
          class="w-10 h-10 rounded-lg border-2 border-slate-600 group-hover:border-indigo-500 transition-colors shadow-inner"
          :style="{ backgroundColor: modelValue ?? 'transparent' }"
        >
          <div
            v-if="!modelValue"
            class="w-full h-full rounded-md flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
        </div>
        <div class="absolute inset-0 rounded-lg ring-2 ring-transparent group-focus-within:ring-indigo-500 pointer-events-none transition-all" />
      </label>

      <!-- Hex text input -->
      <div
        class="flex items-center flex-1 bg-slate-700 border rounded-lg transition-colors overflow-hidden"
        :class="[
          error    ? 'border-rose-500'   : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
          disabled ? 'opacity-50'        : '',
        ]"
      >
        <span class="pl-3 pr-1 text-sm text-gray-500 select-none">#</span>
        <input
          :id="uid"
          :value="hexWithoutHash"
          type="text"
          maxlength="6"
          placeholder="6366f1"
          :disabled="disabled"
          class="flex-1 min-w-0 bg-transparent pr-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none uppercase"
          @input="onHexInput"
          @blur="normaliseHex"
        />
      </div>

      <!-- Preset swatches (if provided) -->
      <div v-if="presets.length" class="flex items-center gap-1 flex-wrap">
        <button
          v-for="preset in presets"
          :key="preset"
          type="button"
          :title="preset"
          class="w-6 h-6 rounded-md border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="modelValue?.toLowerCase() === preset.toLowerCase() ? 'border-white' : 'border-slate-600'"
          :style="{ backgroundColor: preset }"
          :disabled="disabled"
          @click="emit('update:modelValue', preset)"
        />
      </div>

      <!-- Clear -->
      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
        @click="emit('update:modelValue', null)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  tooltip?: string
  clearable?: boolean
  /** Preset colour swatches shown as quick picks */
  presets?: string[]
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  clearable: true,
  presets: () => [],
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const hexWithoutHash = computed(() =>
  props.modelValue ? props.modelValue.replace(/^#/, '').toUpperCase() : ''
)

function onNativePick(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onHexInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
  ;(e.target as HTMLInputElement).value = raw
  if (raw.length === 6) emit('update:modelValue', `#${raw}`)
  else if (raw.length === 0) emit('update:modelValue', null)
}

function normaliseHex(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9a-fA-F]/g, '')
  if (raw.length > 0 && raw.length < 6) {
    // Expand short hex: e.g. "f0a" → "ff00aa"
    const expanded = raw.length === 3
      ? raw.split('').map(c => c + c).join('')
      : raw.padEnd(6, '0')
    emit('update:modelValue', `#${expanded}`)
  }
}
</script>
