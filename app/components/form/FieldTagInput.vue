<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid" :tooltip="tooltip">
    <div
      class="flex flex-wrap items-center gap-1.5 px-2 py-1.5 bg-slate-700 border rounded-lg transition-colors cursor-text"
      :class="[
        error    ? 'border-rose-500'   : isFocused ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      ]"
      @click="inputRef?.focus()"
    >
      <!-- Tags -->
      <span
        v-for="(tag, i) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-md text-xs font-medium"
        :class="error ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          class="hover:text-white transition-colors leading-none"
          :aria-label="`Remove ${tag}`"
          @click.stop="remove(i)"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>

      <!-- Input -->
      <input
        :id="uid"
        ref="inputRef"
        v-model="inputVal"
        type="text"
        class="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none py-0.5"
        :placeholder="modelValue.length === 0 ? placeholder : addMorePlaceholder"
        :disabled="disabled"
        @keydown="onKeydown"
        @blur="isFocused = false; commitOnBlur && commitTag()"
        @focus="isFocused = true"
        @paste.prevent="onPaste"
      />

      <!-- Clear all -->
      <button
        v-if="modelValue.length > 0 && !disabled"
        type="button"
        class="ml-auto text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
        @click.stop="emit('update:modelValue', [])"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Suggestions dropdown -->
    <Teleport v-if="filteredSuggestions.length > 0 && isFocused" to="body">
      <div
        class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        style="z-index:99999;"
        :style="panelStyle"
        @mousedown.prevent
      >
        <ul class="overflow-y-auto max-h-40 py-1">
          <li
            v-for="s in filteredSuggestions"
            :key="s"
            class="px-3 py-2 text-sm cursor-pointer transition-colors text-gray-200 hover:bg-slate-700 hover:text-white"
            @click="addTag(s)"
          >{{ s }}</li>
        </ul>
      </div>
    </Teleport>

    <p v-if="maxTags && modelValue.length >= maxTags" class="mt-1 text-xs text-gray-500">
      Maximum {{ maxTags }} tags reached
    </p>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string[]
  label?: string
  placeholder?: string
  addMorePlaceholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  tooltip?: string
  /** Keys that commit the current input as a tag */
  delimiters?: string[]
  /** Predefined suggestion list */
  suggestions?: string[]
  /** Maximum number of tags */
  maxTags?: number
  /** Commit the typed value on blur (default false) */
  commitOnBlur?: boolean
  /** Prevent duplicate tags */
  allowDuplicates?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Add tags…',
  addMorePlaceholder: 'Add more…',
  delimiters: () => ['Enter', ',', 'Tab'],
  suggestions: () => [],
  allowDuplicates: false,
  commitOnBlur: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const _autoId = useId()
const uid = computed(() => _autoId)

const inputRef = ref<HTMLInputElement | null>(null)
const inputVal = ref('')
const isFocused = ref(false)
const panelStyle = ref<Record<string, string>>({})

const filteredSuggestions = computed(() => {
  if (!inputVal.value.trim() || !props.suggestions.length) return []
  const q = inputVal.value.toLowerCase()
  return props.suggestions.filter(
    s => s.toLowerCase().includes(q) && (props.allowDuplicates || !props.modelValue.includes(s))
  ).slice(0, 8)
})

watch(isFocused, (focused) => {
  if (focused && inputRef.value) {
    const rect = inputRef.value.closest('.field-wrapper')?.querySelector('div')?.getBoundingClientRect()
      ?? inputRef.value.getBoundingClientRect()
    const w = rect.width
    let top = rect.bottom + 4
    if (top + 180 > window.innerHeight - 8) top = rect.top - 184
    panelStyle.value = { top: `${top}px`, left: `${rect.left}px`, width: `${w}px` }
  }
})

function addTag(tag: string) {
  const t = tag.trim()
  if (!t) return
  if (!props.allowDuplicates && props.modelValue.includes(t)) { inputVal.value = ''; return }
  if (props.maxTags && props.modelValue.length >= props.maxTags) return
  emit('update:modelValue', [...props.modelValue, t])
  inputVal.value = ''
}

function commitTag() {
  addTag(inputVal.value)
}

function remove(i: number) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}

function onKeydown(e: KeyboardEvent) {
  if (props.delimiters.includes(e.key)) {
    e.preventDefault()
    commitTag()
    return
  }
  if (e.key === 'Backspace' && inputVal.value === '' && props.modelValue.length > 0) {
    remove(props.modelValue.length - 1)
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  // Split on common delimiters: comma, newline, semicolon, tab
  const parts = text.split(/[,\n;\t]+/).map(p => p.trim()).filter(Boolean)
  for (const p of parts) addTag(p)
}
</script>
