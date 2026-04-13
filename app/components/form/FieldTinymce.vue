<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="tinymce-field border border-slate-600 rounded-lg overflow-hidden" :class="error ? 'border-rose-500' : isFocused ? 'border-indigo-500' : ''">
      <!-- TinyMCE-style multi-row toolbar -->
      <div class="bg-slate-800 border-b border-slate-700">
        <!-- Row 1: format, font, size -->
        <div class="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-slate-700/60">
          <select class="tny-select" @change="execCommand('formatBlock', ($event.target as HTMLSelectElement).value)">
            <option value="p">Paragraph</option>
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="blockquote">Blockquote</option>
            <option value="pre">Code</option>
          </select>

          <span class="w-px h-5 bg-slate-600 mx-1" />

          <button v-for="b in row1Btns" :key="b.cmd" type="button" :title="b.title"
            :class="['tny-btn', { active: activeFormats[b.cmd] }]"
            @click="execCommand(b.cmd)">
            <span v-html="b.html" />
          </button>

          <span class="w-px h-5 bg-slate-600 mx-1" />

          <!-- Text color (simplified) -->
          <button type="button" title="Text color" class="tny-btn relative overflow-hidden" @click="showColorPicker = !showColorPicker">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <text x="3" y="17" font-size="16" font-weight="bold" font-family="serif">A</text>
            </svg>
            <span class="absolute bottom-0 left-0 right-0 h-1 bg-current" />
          </button>
        </div>
        <!-- Row 2: insert, align, lists -->
        <div class="flex flex-wrap items-center gap-0.5 px-2 py-1">
          <button v-for="b in row2Btns" :key="b.cmd" type="button" :title="b.title"
            :class="['tny-btn', { active: activeFormats[b.cmd] }]"
            @click="b.fn ? b.fn() : execCommand(b.cmd)">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="b.path" />
            </svg>
          </button>

          <span class="w-px h-5 bg-slate-600 mx-1" />

          <button type="button" title="Undo" class="tny-btn" @click="execCommand('undo')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </button>
          <button type="button" title="Redo" class="tny-btn" @click="execCommand('redo')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
          </button>

          <span class="w-px h-5 bg-slate-600 mx-1" />

          <!-- Fullscreen toggle -->
          <button type="button" :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'" class="tny-btn ml-auto" @click="isFullscreen = !isFullscreen">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isFullscreen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4H4v5h5zm6 0h5V4h-5v5zM4 15h5v5H4v-5zm11 5h5v-5h-5v5z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div
        ref="editorRef"
        contenteditable="true"
        class="editor-content w-full overflow-y-auto px-5 py-4 bg-slate-700 text-white focus:outline-none"
        :style="{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : `${minHeight}px`, maxHeight: isFullscreen ? 'none' : `${maxHeight}px` }"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup="updateFormats"
        @mouseup="updateFormats"
        @paste="handlePaste"
      />

      <!-- Status bar -->
      <div class="flex items-center justify-between px-3 py-1 bg-slate-800 border-t border-slate-700/60 text-xs text-gray-500">
        <span>Words: {{ wordCount }}</span>
        <span>{{ modelValue.length }} chars</span>
      </div>
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
  minHeight?: number
  maxHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  minHeight: 200,
  maxHeight: 500,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const isFullscreen = ref(false)
const showColorPicker = ref(false)
const activeFormats = ref<Record<string, boolean>>({ bold: false, italic: false, underline: false, strikeThrough: false, unorderedList: false, orderedList: false })

const wordCount = computed(() => {
  const text = props.modelValue.replace(/<[^>]*>/g, ' ').trim()
  return text ? text.split(/\s+/).length : 0
})

const row1Btns = [
  { cmd: 'bold', title: 'Bold', html: '<strong class="text-xs">B</strong>' },
  { cmd: 'italic', title: 'Italic', html: '<em class="text-xs">I</em>' },
  { cmd: 'underline', title: 'Underline', html: '<span class="text-xs underline">U</span>' },
  { cmd: 'strikeThrough', title: 'Strikethrough', html: '<span class="text-xs line-through">S</span>' },
] as const

const row2Btns = [
  { cmd: 'justifyLeft', title: 'Align left', path: 'M4 6h16M4 12h10M4 18h16' },
  { cmd: 'justifyCenter', title: 'Align center', path: 'M4 6h16M7 12h10M4 18h16' },
  { cmd: 'justifyRight', title: 'Align right', path: 'M4 6h16M10 12h10M4 18h16' },
  { cmd: 'justifyFull', title: 'Justify', path: 'M4 6h16M4 12h16M4 18h16' },
  { cmd: 'insertUnorderedList', title: 'Bullet list', path: 'M4 6h16M4 12h16M4 18h7' },
  { cmd: 'insertOrderedList', title: 'Numbered list', path: 'M10 6h11M10 12h11M10 18h11' },
  { cmd: 'insertHorizontalRule', title: 'Horizontal rule', path: 'M4 12h16' },
  { cmd: 'createLink', title: 'Link', path: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.657-5.656l-1.1 1.1', fn: () => insertLink() },
  { cmd: 'removeFormat', title: 'Clear formatting', path: 'M6 18L18 6M6 6l12 12' },
]

function execCommand(cmd: string, val?: string) {
  if (!import.meta.client) return
  if (cmd === 'formatBlock' && val) document.execCommand(cmd, false, `<${val}>`)
  else document.execCommand(cmd, false, val)
  editorRef.value?.focus()
  updateFormats()
  emitContent()
}

function insertLink() {
  if (!import.meta.client) return
  const url = prompt('Enter URL:')
  if (url) { document.execCommand('createLink', false, url); emitContent() }
}

function handleInput() { emitContent() }

function handlePaste(e: ClipboardEvent) {
  if (!import.meta.client) return
  e.preventDefault()
  document.execCommand('insertText', false, e.clipboardData?.getData('text/plain') ?? '')
}

function emitContent() { emit('update:modelValue', editorRef.value?.innerHTML ?? '') }

function updateFormats() {
  if (!import.meta.client) return
  activeFormats.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikeThrough: document.queryCommandState('strikeThrough'),
    unorderedList: document.queryCommandState('insertUnorderedList'),
    orderedList: document.queryCommandState('insertOrderedList'),
  }
}

onMounted(() => {
  if (editorRef.value && props.modelValue) editorRef.value.innerHTML = props.modelValue
  watch(() => props.modelValue, (val) => {
    if (editorRef.value && editorRef.value.innerHTML !== val) editorRef.value.innerHTML = val
  })
})
</script>

<style scoped>
.tny-btn {
  @apply w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:bg-slate-600 hover:text-white transition-colors;
}
.tny-btn.active { @apply bg-indigo-600 text-white; }
.tny-select {
  @apply h-7 px-1.5 text-xs bg-slate-700 border border-slate-600 text-gray-300 rounded focus:outline-none focus:border-indigo-500;
}
.editor-content { line-height: 1.7; }
.editor-content :deep(h1) { @apply text-2xl font-bold text-white mt-4 mb-2; }
.editor-content :deep(h2) { @apply text-xl font-semibold text-white mt-3 mb-2; }
.editor-content :deep(h3) { @apply text-lg font-semibold text-white mt-3 mb-1; }
.editor-content :deep(p) { @apply mb-2; }
.editor-content :deep(ul) { @apply list-disc pl-6 mb-2; }
.editor-content :deep(ol) { @apply list-decimal pl-6 mb-2; }
.editor-content :deep(blockquote) { @apply border-l-4 border-yellow-500 pl-4 py-1 my-2 text-gray-300 italic bg-slate-800/50 rounded-r; }
.editor-content :deep(pre) { @apply bg-slate-900 p-3 rounded my-2 font-mono text-sm text-emerald-400 overflow-x-auto; }
.editor-content :deep(a) { @apply text-blue-400 hover:underline; }
.editor-content :deep(hr) { @apply border-slate-600 my-4; }
.editor-content :deep(table) { @apply w-full border-collapse my-3; }
.editor-content :deep(td), .editor-content :deep(th) { @apply border border-slate-600 px-3 py-2; }
.editor-content :deep(th) { @apply bg-slate-800 font-semibold; }
</style>
