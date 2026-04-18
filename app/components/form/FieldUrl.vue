<template>
  <FieldWrapper :label="label" :hint="hint" :error="error || internalError" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex items-center bg-slate-700 border rounded-lg transition-colors overflow-hidden"
      :class="[
        (error || internalError) ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled || readonly ? 'opacity-50' : '',
      ]"
    >
      <!-- Link icon -->
      <span class="pl-3 pr-1.5 flex-shrink-0 pointer-events-none text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </span>

      <input
        :id="uid"
        :value="modelValue"
        type="url"
        inputmode="url"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        autocomplete="off"
        class="flex-1 min-w-0 bg-transparent pl-1.5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
        :class="openable ? 'pr-1.5' : 'pr-3'"
        @input="onInput"
        @blur="validate"
      />

      <!-- Open in new tab -->
      <a
        v-if="openable"
        :href="modelValue || '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="pr-3 pl-1.5 flex-shrink-0 transition-colors"
        :class="modelValue && !internalError && !error ? 'text-indigo-400 hover:text-indigo-300' : 'text-gray-600 pointer-events-none'"
        tabindex="-1"
        @click.prevent="openUrl"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  /** Show the "open in new tab" button when a valid URL is entered */
  openable?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'https://example.com',
  openable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)
const internalError = ref('')

function isValidUrl(s: string): boolean {
  if (!s) return true
  try { new URL(s); return true } catch { return false }
}

function onInput(e: Event) {
  internalError.value = ''
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function validate(e: FocusEvent) {
  const v = props.modelValue
  if (v && !isValidUrl(v)) {
    internalError.value = 'Enter a valid URL (e.g. https://example.com)'
  } else {
    internalError.value = ''
  }
  emit('blur', e)
}

function openUrl() {
  if (props.modelValue && !internalError.value && !props.error && import.meta.client) {
    window.open(props.modelValue, '_blank', 'noopener,noreferrer')
  }
}
</script>
