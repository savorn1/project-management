<template>
  <div class="relative flex flex-col border-t border-slate-800/60">

    <!-- File validation error -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="fileError" class="flex items-center gap-2 px-4 pt-2.5 text-xs text-red-400">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ fileError }}
      </div>
    </Transition>

    <!-- File preview strip -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="selectedFiles.length > 0" class="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
        <div
          v-for="(file, i) in selectedFiles"
          :key="i"
          class="relative flex items-center gap-1.5 pl-2 pr-6 py-1 bg-slate-800/80 border border-slate-700/40 rounded-lg text-xs text-gray-300 max-w-[160px] group/file"
        >
          <!-- Image thumbnail -->
          <img
            v-if="file.type.startsWith('image/')"
            :src="previewUrls[i]"
            class="w-5 h-5 rounded object-cover flex-shrink-0"
            alt=""
          />
          <!-- File icon -->
          <svg v-else class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="truncate flex-1">{{ file.name }}</span>
          <!-- Remove button -->
          <button
            @click="removeFile(i)"
            class="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <div class="flex items-end gap-2 px-4 py-3">

      <!-- Mention dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="showDropdown && filteredOptions.length > 0"
          class="absolute bottom-full left-4 right-20 mb-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden z-10"
        >
          <div
            v-for="(option, i) in filteredOptions"
            :key="option.id"
            @mousedown.prevent="selectOption(option)"
            class="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
            :class="i === selectedIndex ? 'bg-indigo-500/20' : 'hover:bg-slate-700/40'"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              :class="option.type === 'everyone'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'"
            >
              {{ option.type === 'everyone' ? '✦' : option.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-xs font-medium" :class="i === selectedIndex ? 'text-indigo-200' : 'text-gray-300'">
                {{ option.name }}
              </p>
              <p v-if="option.type === 'everyone'" class="text-[10px] text-gray-500">Notify all members</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Attach file button -->
      <button
        @click="fileInputRef?.click()"
        :disabled="selectedFiles.length >= 5"
        class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        :class="selectedFiles.length >= 5
          ? 'text-gray-700 cursor-not-allowed'
          : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
        title="Attach files (max 5 × 20 MB)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        class="hidden"
        @change="onFileChange"
      />

      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="text"
          @keydown="onKeydown"
          @input="onInput"
          @blur="onBlur"
          rows="1"
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          class="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none overflow-hidden leading-relaxed max-h-32"
        />
      </div>

      <button
        @click="submit"
        :disabled="(!text.trim() && selectedFiles.length === 0) || loading"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        :class="(text.trim() || selectedFiles.length > 0) && !loading
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/25'
          : 'bg-slate-800/60 text-gray-600 cursor-not-allowed'"
      >
        <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

const props = defineProps<{
  members: TeamMember[]
}>()

const emit = defineEmits<{
  send: [content: string, files: File[]]
  typing: [isTyping: boolean]
}>()

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_FILES = 5

const text = ref('')
const loading = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const fileError = ref('')
let errorTimer: ReturnType<typeof setTimeout> | null = null

function showError(message: string) {
  fileError.value = message
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => { fileError.value = '' }, 4000)
}

const { showDropdown, filteredOptions, selectedIndex, handleInput, handleKeydown: mentionKeydown, selectOption } =
  useMentionInput(textareaRef, toRef(props, 'members'), text)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
}

function onInput() {
  handleInput()
  autoResize()
}

function onKeydown(e: KeyboardEvent) {
  const dropdownWasOpen = showDropdown.value
  mentionKeydown(e)

  if (dropdownWasOpen && ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
    e.preventDefault()
    return
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
    return
  }

  if (['Enter', 'Escape', 'Tab'].includes(e.key)) return
  autoResize()
  emit('typing', true)
}

function onBlur() {
  emit('typing', false)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  const candidates = Array.from(input.files)
  const tooBig = candidates.filter((f) => f.size > MAX_FILE_SIZE)
  const fits   = candidates.filter((f) => f.size <= MAX_FILE_SIZE)

  if (tooBig.length > 0) {
    const names = tooBig.map((f) => f.name).join(', ')
    showError(`File${tooBig.length > 1 ? 's' : ''} exceed 20 MB limit: ${names}`)
  }

  const slots = MAX_FILES - selectedFiles.value.length
  if (slots <= 0) {
    showError(`Maximum ${MAX_FILES} files per message.`)
    input.value = ''
    return
  }

  const accepted = fits.slice(0, slots)
  if (fits.length > slots) {
    showError(`Only ${slots} more file${slots > 1 ? 's' : ''} can be added (max ${MAX_FILES}).`)
  }

  for (const file of accepted) {
    selectedFiles.value.push(file)
    previewUrls.value.push(file.type.startsWith('image/') ? URL.createObjectURL(file) : '')
  }

  input.value = '' // reset so same file can be re-added after removal
}

function removeFile(index: number) {
  const url = previewUrls.value[index]
  if (url) URL.revokeObjectURL(url)
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

function clearFiles() {
  previewUrls.value.forEach((url) => { if (url) URL.revokeObjectURL(url) })
  selectedFiles.value = []
  previewUrls.value = []
}

async function submit() {
  const content = text.value.trim()
  if (!content && selectedFiles.value.length === 0) return
  if (loading.value) return

  loading.value = true
  emit('typing', false)

  const files = [...selectedFiles.value]
  text.value = ''
  clearFiles()
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })

  emit('send', content, files)
  loading.value = false
}

defineExpose({ focus: () => textareaRef.value?.focus() })
</script>
