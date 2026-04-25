<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="border rounded-lg overflow-hidden transition-colors"
      :class="[
        error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500 focus-within:border-indigo-500',
        disabled ? 'opacity-50' : '',
      ]"
    >
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/70 border-b border-slate-700/60">
        <div class="flex items-center gap-2">
          <!-- Language selector -->
          <select
            v-if="showLanguageSelector"
            :value="language"
            class="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
            @change="emit('update:language', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="lang in LANGUAGES" :key="lang" :value="lang">{{ lang }}</option>
          </select>
          <span v-else class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono">{{ language }}</span>
        </div>
        <div class="flex items-center gap-3 text-[10px] text-gray-500">
          <span class="tabular-nums">{{ lineCount }} lines</span>
          <button
            v-if="!disabled && modelValue"
            type="button"
            class="hover:text-gray-300 transition-colors"
            @click="emit('update:modelValue', '')"
          >Clear</button>
        </div>
      </div>

      <!-- Code area -->
      <div class="flex bg-slate-950/60 font-mono" :style="{ minHeight: minLines * 1.625 + 3.5 + 'rem' }">
        <!-- Line numbers -->
        <div
          class="select-none flex-shrink-0 py-3 pr-2 pl-3 text-right text-slate-600 text-xs bg-slate-900/40 border-r border-slate-700/60"
          style="line-height:1.625rem;"
          aria-hidden="true"
        >
          <div v-for="n in lineCount" :key="n" style="height:1.625rem;">{{ n }}</div>
        </div>

        <!-- Textarea -->
        <textarea
          :id="uid"
          :value="modelValue"
          :disabled="disabled"
          :placeholder="placeholder"
          :rows="lineCount"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          class="flex-1 w-full bg-transparent px-4 py-3 text-sm font-mono text-indigo-200 placeholder-slate-700 focus:outline-none resize-none"
          style="line-height:1.625rem;"
          @input="onInput"
          @keydown.tab.prevent="onTab"
        />
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'html', 'css', 'scss',
  'json', 'bash', 'shell', 'sql', 'python', 'php', 'go', 'rust', 'yaml', 'markdown',
]

interface Props {
  modelValue: string
  /** Programming language label shown in the toolbar */
  language?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Minimum visible lines */
  minLines?: number
  placeholder?: string
  showLanguageSelector?: boolean
  tooltip?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  minLines: 8,
  showLanguageSelector: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:language': [value: string]
}>()

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const lineCount = computed(() => Math.max(props.modelValue.split('\n').length, props.minLines))

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

function onTab(e: KeyboardEvent) {
  const el = e.target as HTMLTextAreaElement
  const s = el.selectionStart
  const newVal = el.value.substring(0, s) + '  ' + el.value.substring(el.selectionEnd)
  emit('update:modelValue', newVal)
  nextTick(() => { el.selectionStart = el.selectionEnd = s + 2 })
}
</script>
