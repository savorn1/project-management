<template>
  <FieldWrapper :label="label" :hint="hint" :error="error || jsonError" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="border rounded-lg overflow-hidden transition-colors"
      :class="[
        (error || jsonError) ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled ? 'opacity-50' : '',
      ]"
    >
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-3 py-1.5 bg-slate-800/60 border-b border-slate-600/60">
        <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono">JSON</span>
        <div class="flex items-center gap-3">
          <span v-if="!jsonError && modelValue" class="text-[10px] text-emerald-500 font-medium">✓ valid</span>
          <button
            v-if="!disabled"
            type="button"
            class="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            @click="format"
          >Format</button>
          <button
            v-if="!disabled && modelValue"
            type="button"
            class="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            @click="emit('update:modelValue', '')"
          >Clear</button>
        </div>
      </div>

      <!-- Editor area with line numbers -->
      <div class="flex bg-slate-900/40 font-mono text-sm leading-relaxed">
        <div
          class="select-none flex-shrink-0 py-3 pr-2 pl-3 text-right text-slate-600 text-xs leading-[1.625rem] min-w-[2.5rem] bg-slate-900/30 border-r border-slate-700/60"
          aria-hidden="true"
        >
          <div v-for="n in lineCount" :key="n">{{ n }}</div>
        </div>
        <textarea
          :id="uid"
          :value="modelValue"
          :disabled="disabled"
          :rows="Math.max(lineCount, rows)"
          :placeholder="placeholder"
          spellcheck="false"
          autocomplete="off"
          class="flex-1 w-full bg-transparent px-4 py-3 text-sm font-mono text-emerald-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
          @input="onInput"
          @blur="onBlur"
          @keydown.tab.prevent="onTab"
        />
      </div>
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
  rows?: number
  placeholder?: string
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 6,
  placeholder: '{\n  "key": "value"\n}',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)
const jsonError = ref('')

const lineCount = computed(() => Math.max(props.modelValue.split('\n').length, props.rows))

function onInput(e: Event) {
  jsonError.value = ''
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

function onBlur() {
  const v = props.modelValue.trim()
  if (!v) { jsonError.value = ''; return }
  try { JSON.parse(v); jsonError.value = '' }
  catch (e: any) { jsonError.value = `Invalid JSON: ${e.message}` }
}

function format() {
  const v = props.modelValue.trim()
  if (!v) return
  try {
    emit('update:modelValue', JSON.stringify(JSON.parse(v), null, 2))
    jsonError.value = ''
  } catch (e: any) {
    jsonError.value = `Invalid JSON: ${e.message}`
  }
}

function onTab(e: KeyboardEvent) {
  const el = e.target as HTMLTextAreaElement
  const s = el.selectionStart
  const newVal = el.value.substring(0, s) + '  ' + el.value.substring(el.selectionEnd)
  emit('update:modelValue', newVal)
  nextTick(() => { el.selectionStart = el.selectionEnd = s + 2 })
}
</script>
