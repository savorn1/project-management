<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div class="ckeditor-field" :class="error ? 'ring-1 ring-rose-500 rounded-lg' : ''">
      <!-- CKEditor-style toolbar -->
      <div class="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-800 border border-slate-600 border-b-0 rounded-t-lg">
        <!-- Styles dropdown -->
        <select
          class="h-7 px-1.5 text-xs bg-slate-700 border border-slate-600 text-gray-300 rounded focus:outline-none focus:border-indigo-500"
          @change="execCommand('formatBlock', ($event.target as HTMLSelectElement).value)"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Preformatted</option>
        </select>

        <span class="w-px h-5 bg-slate-600 mx-1" />

        <!-- Text format -->
        <button v-for="btn in textBtns" :key="btn.cmd" type="button"
          :title="btn.title"
          :class="['ck-btn', { active: activeFormats[btn.cmd] }]"
          @click="execCommand(btn.cmd)">
          <span v-html="btn.icon" />
        </button>

        <span class="w-px h-5 bg-slate-600 mx-1" />

        <!-- Align -->
        <button v-for="btn in alignBtns" :key="btn.cmd" type="button"
          :title="btn.title"
          class="ck-btn"
          @click="execCommand(btn.cmd)">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="btn.path" />
          </svg>
        </button>

        <span class="w-px h-5 bg-slate-600 mx-1" />

        <!-- Lists -->
        <button type="button" title="Bullet list" :class="['ck-btn', { active: activeFormats.unorderedList }]" @click="execCommand('insertUnorderedList')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /><circle cx="2" cy="6" r="1" fill="currentColor" /><circle cx="2" cy="12" r="1" fill="currentColor" /><circle cx="2" cy="18" r="1" fill="currentColor" /></svg>
        </button>
        <button type="button" title="Numbered list" :class="['ck-btn', { active: activeFormats.orderedList }]" @click="execCommand('insertOrderedList')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
        </button>

        <span class="w-px h-5 bg-slate-600 mx-1" />

        <!-- Link, image, table, hr -->
        <button type="button" title="Insert link" class="ck-btn" @click="insertLink">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.657l-1.1 1.1" /></svg>
        </button>
        <button type="button" title="Horizontal line" class="ck-btn" @click="execCommand('insertHorizontalRule')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16" /></svg>
        </button>
        <button type="button" title="Remove formatting" class="ck-btn" @click="execCommand('removeFormat')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Source toggle -->
        <span class="w-px h-5 bg-slate-600 mx-1" />
        <button type="button" title="Source" :class="['ck-btn text-xs font-mono', { active: showSource }]" @click="showSource = !showSource">
          &lt;/&gt;
        </button>
      </div>

      <!-- Source view -->
      <textarea
        v-if="showSource"
        :value="modelValue"
        class="w-full min-h-[160px] px-4 py-3 bg-slate-700 border border-slate-600 rounded-b-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 resize-y"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />

      <!-- Rich text editor -->
      <div
        v-else
        ref="editorRef"
        contenteditable="true"
        class="editor-body min-h-[160px] max-h-[400px] overflow-y-auto px-4 py-3 bg-slate-700 border border-slate-600 rounded-b-lg text-white focus:outline-none"
        :class="{ 'border-indigo-500': isFocused }"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup="updateFormats"
        @mouseup="updateFormats"
        @paste="handlePaste"
      />
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
}

const props = withDefaults(defineProps<Props>(), { modelValue: '' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const showSource = ref(false)

const activeFormats = ref({ bold: false, italic: false, underline: false, strikeThrough: false, unorderedList: false, orderedList: false })

const textBtns = [
  { cmd: 'bold', title: 'Bold', icon: '<strong class="text-xs">B</strong>' },
  { cmd: 'italic', title: 'Italic', icon: '<em class="text-xs">I</em>' },
  { cmd: 'underline', title: 'Underline', icon: '<span class="text-xs underline">U</span>' },
  { cmd: 'strikeThrough', title: 'Strikethrough', icon: '<span class="text-xs line-through">S</span>' },
] as const

const alignBtns = [
  { cmd: 'justifyLeft', title: 'Align left', path: 'M4 6h16M4 12h10M4 18h16' },
  { cmd: 'justifyCenter', title: 'Align center', path: 'M4 6h16M7 12h10M4 18h16' },
  { cmd: 'justifyRight', title: 'Align right', path: 'M4 6h16M10 12h10M4 18h16' },
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

function emitContent() {
  emit('update:modelValue', editorRef.value?.innerHTML ?? '')
}

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
    if (editorRef.value && !showSource.value && editorRef.value.innerHTML !== val) {
      editorRef.value.innerHTML = val
    }
  })
})
</script>

<style scoped>
.ck-btn {
  @apply w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:bg-slate-600 hover:text-white transition-colors text-xs;
}
.ck-btn.active {
  @apply bg-indigo-600 text-white;
}
.editor-body { line-height: 1.6; }
.editor-body :deep(h1) { @apply text-2xl font-bold text-white mt-4 mb-2; }
.editor-body :deep(h2) { @apply text-xl font-semibold text-white mt-3 mb-2; }
.editor-body :deep(h3) { @apply text-lg font-semibold text-white mt-3 mb-1; }
.editor-body :deep(h4) { @apply text-base font-semibold text-white mt-2 mb-1; }
.editor-body :deep(p) { @apply mb-2; }
.editor-body :deep(ul) { @apply list-disc pl-5 mb-2; }
.editor-body :deep(ol) { @apply list-decimal pl-5 mb-2; }
.editor-body :deep(blockquote) { @apply border-l-4 border-indigo-500 pl-4 py-1 my-2 text-gray-300 italic bg-slate-800/50 rounded-r; }
.editor-body :deep(pre) { @apply bg-slate-800 p-3 rounded my-2 font-mono text-sm text-emerald-400 overflow-x-auto; }
.editor-body :deep(a) { @apply text-indigo-400 hover:underline; }
.editor-body :deep(hr) { @apply border-slate-600 my-4; }
</style>
