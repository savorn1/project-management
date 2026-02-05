<template>
  <div class="wysiwyg-editor">
    <label v-if="label" class="block text-gray-300 text-sm font-medium mb-2">{{ label }}</label>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 p-2 bg-slate-800 border border-slate-600 border-b-0 rounded-t-lg">
      <!-- Text Formatting -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-600">
        <button
          type="button"
          @click="execCommand('bold')"
          :class="['toolbar-btn', { active: activeFormats.bold }]"
          title="Bold (Ctrl+B)"
        >
          <span class="font-bold">B</span>
        </button>
        <button
          type="button"
          @click="execCommand('italic')"
          :class="['toolbar-btn', { active: activeFormats.italic }]"
          title="Italic (Ctrl+I)"
        >
          <span class="italic">I</span>
        </button>
        <button
          type="button"
          @click="execCommand('underline')"
          :class="['toolbar-btn', { active: activeFormats.underline }]"
          title="Underline (Ctrl+U)"
        >
          <span class="underline">U</span>
        </button>
        <button
          type="button"
          @click="execCommand('strikeThrough')"
          :class="['toolbar-btn', { active: activeFormats.strikeThrough }]"
          title="Strikethrough"
        >
          <span class="line-through">S</span>
        </button>
      </div>

      <!-- Headings -->
      <div class="flex items-center gap-1 px-2 border-r border-slate-600">
        <button
          type="button"
          @click="execCommand('formatBlock', 'h2')"
          class="toolbar-btn"
          title="Heading 2"
        >
          <span class="text-xs font-bold">H2</span>
        </button>
        <button
          type="button"
          @click="execCommand('formatBlock', 'h3')"
          class="toolbar-btn"
          title="Heading 3"
        >
          <span class="text-xs font-bold">H3</span>
        </button>
        <button
          type="button"
          @click="execCommand('formatBlock', 'p')"
          class="toolbar-btn"
          title="Paragraph"
        >
          <span class="text-xs">P</span>
        </button>
      </div>

      <!-- Lists -->
      <div class="flex items-center gap-1 px-2 border-r border-slate-600">
        <button
          type="button"
          @click="execCommand('insertUnorderedList')"
          :class="['toolbar-btn', { active: activeFormats.unorderedList }]"
          title="Bullet List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('insertOrderedList')"
          :class="['toolbar-btn', { active: activeFormats.orderedList }]"
          title="Numbered List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Alignment -->
      <div class="flex items-center gap-1 px-2 border-r border-slate-600">
        <button
          type="button"
          @click="execCommand('justifyLeft')"
          class="toolbar-btn"
          title="Align Left"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('justifyCenter')"
          class="toolbar-btn"
          title="Align Center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('justifyRight')"
          class="toolbar-btn"
          title="Align Right"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Insert -->
      <div class="flex items-center gap-1 px-2 border-r border-slate-600">
        <button
          type="button"
          @click="insertLink"
          class="toolbar-btn"
          title="Insert Link"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('insertHorizontalRule')"
          class="toolbar-btn"
          title="Horizontal Line"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16" />
          </svg>
        </button>
      </div>

      <!-- Quote & Code -->
      <div class="flex items-center gap-1 pl-2">
        <button
          type="button"
          @click="execCommand('formatBlock', 'blockquote')"
          class="toolbar-btn"
          title="Quote"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('formatBlock', 'pre')"
          class="toolbar-btn"
          title="Code Block"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          @click="execCommand('removeFormat')"
          class="toolbar-btn"
          title="Clear Formatting"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div
      ref="editorRef"
      contenteditable="true"
      class="editor-content w-full min-h-[120px] max-h-[300px] overflow-y-auto px-4 py-3 bg-slate-700 border border-slate-600 rounded-b-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
      :class="{ 'border-indigo-500': isFocused }"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup="updateActiveFormats"
      @mouseup="updateActiveFormats"
      @paste="handlePaste"
    ></div>

    <!-- Placeholder -->
    <div
      v-if="isEmpty && !isFocused"
      class="pointer-events-none absolute bottom-3 left-4 text-gray-400"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start typing...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const isEmpty = ref(true)

const activeFormats = ref({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  unorderedList: false,
  orderedList: false
})

function execCommand(command: string, value?: string) {
  if (!import.meta.client) return
  if (command === 'formatBlock' && value) {
    document.execCommand(command, false, `<${value}>`)
  } else {
    document.execCommand(command, false, value)
  }
  editorRef.value?.focus()
  updateActiveFormats()
  emitContent()
}

function insertLink() {
  if (!import.meta.client) return
  const url = prompt('Enter URL:')
  if (url) {
    document.execCommand('createLink', false, url)
    emitContent()
  }
}

function handleInput() {
  isEmpty.value = !editorRef.value?.textContent?.trim()
  emitContent()
}

function handlePaste(event: ClipboardEvent) {
  if (!import.meta.client) return
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

function emitContent() {
  const content = editorRef.value?.innerHTML || ''
  emit('update:modelValue', content)
}

function updateActiveFormats() {
  if (!import.meta.client) return
  activeFormats.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikeThrough: document.queryCommandState('strikeThrough'),
    unorderedList: document.queryCommandState('insertUnorderedList'),
    orderedList: document.queryCommandState('insertOrderedList')
  }
}

onMounted(() => {
  // Set initial content
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
    isEmpty.value = !props.modelValue.trim()
  }

  // Watch for external changes after mount
  watch(() => props.modelValue, (newVal) => {
    if (editorRef.value && editorRef.value.innerHTML !== newVal) {
      editorRef.value.innerHTML = newVal
      isEmpty.value = !newVal?.trim()
    }
  })
})
</script>

<style scoped>
.wysiwyg-editor {
  position: relative;
}

.toolbar-btn {
  @apply w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:bg-slate-600 hover:text-white transition-colors;
}

.toolbar-btn.active {
  @apply bg-indigo-600 text-white;
}

.editor-content {
  line-height: 1.6;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  @apply text-gray-400;
}

/* Editor content styles */
.editor-content :deep(h2) {
  @apply text-lg font-semibold text-white mt-4 mb-2;
}

.editor-content :deep(h3) {
  @apply text-base font-semibold text-white mt-3 mb-2;
}

.editor-content :deep(p) {
  @apply mb-2;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  @apply pl-5 mb-2;
}

.editor-content :deep(ul) {
  @apply list-disc;
}

.editor-content :deep(ol) {
  @apply list-decimal;
}

.editor-content :deep(li) {
  @apply mb-1;
}

.editor-content :deep(blockquote) {
  @apply border-l-4 border-indigo-500 pl-4 py-1 my-2 text-gray-300 italic bg-slate-800/50 rounded-r;
}

.editor-content :deep(pre) {
  @apply bg-slate-800 p-3 rounded my-2 font-mono text-sm text-emerald-400 overflow-x-auto;
}

.editor-content :deep(a) {
  @apply text-indigo-400 hover:text-indigo-300 underline;
}

.editor-content :deep(hr) {
  @apply border-slate-600 my-4;
}
</style>
