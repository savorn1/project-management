<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="easymde-field border border-slate-600 rounded-lg overflow-hidden" :class="error ? 'border-rose-500' : ''">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-800 border-b border-slate-700">
        <button v-for="b in toolbarBtns" :key="b.label" type="button" :title="b.label"
          class="mde-btn"
          @click="b.fn">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="b.icon" />
          </svg>
        </button>

        <span class="w-px h-5 bg-slate-600 mx-1" />

        <!-- Preview toggle -->
        <button
          type="button"
          :class="['mde-btn px-2 text-xs', { 'bg-indigo-600 text-white': showPreview }]"
          @click="showPreview = !showPreview"
        >
          {{ showPreview ? 'Edit' : 'Preview' }}
        </button>

        <!-- Side-by-side -->
        <button
          type="button"
          :class="['mde-btn px-2 text-xs', { 'bg-indigo-600 text-white': sideBySide }]"
          @click="sideBySide = !sideBySide; showPreview = false"
        >
          Side by side
        </button>
      </div>

      <!-- Editor area -->
      <div :class="['flex', sideBySide ? 'divide-x divide-slate-700' : '']">
        <!-- Textarea -->
        <textarea
          v-show="!showPreview || sideBySide"
          ref="textareaRef"
          :value="modelValue"
          class="flex-1 px-4 py-3 bg-slate-700 text-white text-sm font-mono placeholder-gray-400 focus:outline-none resize-none"
          :style="{ minHeight: `${minHeight}px` }"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          @keydown="handleKeydown"
        />

        <!-- Preview pane -->
        <div
          v-show="showPreview || sideBySide"
          class="flex-1 px-4 py-3 bg-slate-800 overflow-y-auto prose-sm"
          :style="{ minHeight: `${minHeight}px` }"
          v-html="renderedMarkdown"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-3 py-1 bg-slate-800 border-t border-slate-700/60 text-xs text-gray-500">
        <span>Markdown supported</span>
        <span>{{ wordCount }} words · {{ modelValue.length }} chars</span>
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
  disabled?: boolean
  minHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Write in Markdown...',
  minHeight: 200,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showPreview = ref(false)
const sideBySide = ref(false)

const wordCount = computed(() => {
  return props.modelValue.trim() ? props.modelValue.trim().split(/\s+/).length : 0
})

/** Minimal Markdown → HTML renderer (no external deps) */
const renderedMarkdown = computed(() => {
  let html = props.modelValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered list items
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Paragraphs (double newline)
    .replace(/\n\n+/g, '</p><p>')
  return `<p>${html}</p>`
})

const toolbarBtns = [
  {
    label: 'Bold', icon: 'M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z',
    fn: () => wrap('**', '**', 'bold text')
  },
  {
    label: 'Italic', icon: 'M10 20l4-16m4 4l-4 4m-4 4l-4 4',
    fn: () => wrap('*', '*', 'italic text')
  },
  {
    label: 'Strikethrough', icon: 'M9 15l6-6m-6 0l6 6M4 12h16',
    fn: () => wrap('~~', '~~', 'strikethrough text')
  },
  {
    label: 'Heading', icon: 'M4 6h16M4 12h8m-8 6h16',
    fn: () => insertAtLineStart('## ')
  },
  {
    label: 'Quote', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    fn: () => insertAtLineStart('> ')
  },
  {
    label: 'Unordered list', icon: 'M4 6h16M4 12h16M4 18h16',
    fn: () => insertAtLineStart('- ')
  },
  {
    label: 'Ordered list', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    fn: () => insertAtLineStart('1. ')
  },
  {
    label: 'Code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    fn: () => wrap('`', '`', 'code')
  },
  {
    label: 'Code block', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    fn: () => wrap('\n```\n', '\n```\n', 'code block')
  },
  {
    label: 'Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.657-5.656l-1.1 1.1',
    fn: () => insertLink()
  },
  {
    label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    fn: () => insertImage()
  },
  {
    label: 'Horizontal rule', icon: 'M4 12h16',
    fn: () => insert('\n\n---\n\n')
  },
]

function getTextarea() {
  return textareaRef.value
}

function wrap(before: string, after: string, placeholder: string) {
  const ta = getTextarea()
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = ta.value.slice(start, end) || placeholder
  const next = ta.value.slice(0, start) + before + selected + after + ta.value.slice(end)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.selectionStart = start + before.length
    ta.selectionEnd = start + before.length + selected.length
    ta.focus()
  })
}

function insertAtLineStart(prefix: string) {
  const ta = getTextarea()
  if (!ta) return
  const start = ta.selectionStart
  const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1
  const next = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + prefix.length
    ta.focus()
  })
}

function insert(text: string) {
  const ta = getTextarea()
  if (!ta) return
  const start = ta.selectionStart
  const next = ta.value.slice(0, start) + text + ta.value.slice(ta.selectionEnd)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + text.length
    ta.focus()
  })
}

function insertLink() {
  const url = import.meta.client ? prompt('URL:') : null
  if (!url) return
  const ta = getTextarea()
  if (!ta) return
  const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || 'link text'
  const md = `[${sel}](${url})`
  const start = ta.selectionStart
  emit('update:modelValue', ta.value.slice(0, start) + md + ta.value.slice(ta.selectionEnd))
}

function insertImage() {
  const url = import.meta.client ? prompt('Image URL:') : null
  if (!url) return
  insert(`![image](${url})`)
}

function handleKeydown(e: KeyboardEvent) {
  // Tab inserts spaces
  if (e.key === 'Tab') {
    e.preventDefault()
    insert('  ')
  }
}
</script>

<style scoped>
.mde-btn {
  @apply h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:bg-slate-600 hover:text-white transition-colors;
}
/* Markdown preview styles */
:deep(pre) { @apply bg-slate-900 p-3 rounded my-2 font-mono text-sm text-emerald-400 overflow-x-auto; }
:deep(code) { @apply bg-slate-900 px-1 py-0.5 rounded font-mono text-xs text-emerald-400; }
:deep(h1) { @apply text-2xl font-bold text-white mt-4 mb-2; }
:deep(h2) { @apply text-xl font-semibold text-white mt-3 mb-2; }
:deep(h3) { @apply text-lg font-semibold text-white mt-2 mb-1; }
:deep(h4) { @apply text-base font-semibold text-white mt-2 mb-1; }
:deep(blockquote) { @apply border-l-4 border-indigo-500 pl-4 py-1 my-2 text-gray-300 italic bg-slate-800/50 rounded-r; }
:deep(li) { @apply ml-4 mb-1 text-gray-200; }
:deep(a) { @apply text-indigo-400 hover:underline; }
:deep(hr) { @apply border-slate-600 my-4; }
:deep(strong) { @apply text-white font-semibold; }
:deep(del) { @apply line-through text-gray-400; }
:deep(img) { @apply max-w-full rounded my-2; }
:deep(p) { @apply text-gray-200 mb-2; }
</style>
