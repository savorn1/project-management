<template>
  <div class="relative px-4 py-3 border-t border-slate-800/60">

    <!-- Reply preview strip -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="replyingTo"
        class="flex items-center gap-2 mb-2 px-3 py-2 bg-slate-700/40 border border-slate-600/30 rounded-xl"
      >
        <div class="w-0.5 h-8 rounded-full bg-indigo-400/60 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-indigo-300 mb-0.5">{{ replyingTo.senderName }}</p>
          <p class="text-[11px] text-gray-500 truncate">{{ replyingTo.content || '📎 Attachment' }}</p>
        </div>
        <button
          @click="$emit('cancel-reply')"
          class="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- File validation error -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="fileError" class="flex items-center gap-2 mb-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ fileError }}
      </div>
    </Transition>

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
        class="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-10"
      >
        <div class="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Mention</div>
        <div
          v-for="(option, i) in filteredOptions"
          :key="option.id"
          @mousedown.prevent="selectOption(option)"
          class="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
          :class="i === selectedIndex ? 'bg-indigo-500/15' : 'hover:bg-slate-700/40'"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            :class="option.type === 'everyone'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-slate-500 to-slate-700'"
          >
            {{ option.type === 'everyone' ? '✦' : option.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium truncate" :class="i === selectedIndex ? 'text-indigo-200' : 'text-gray-300'">
              {{ option.name }}
            </p>
            <p v-if="option.type === 'everyone'" class="text-[10px] text-gray-600">Notify all members</p>
          </div>
        </div>
        <div class="h-1" />
      </div>
    </Transition>

    <!-- Emoji picker -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showEmojiPicker"
        ref="emojiPickerRef"
        class="absolute bottom-full left-4 mb-2 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 z-20 w-72"
        @click.stop
      >
        <!-- Category tabs -->
        <div class="flex gap-1 p-2 border-b border-slate-700/40">
          <button
            v-for="cat in emojiCategories"
            :key="cat.name"
            @mousedown.prevent="activeCategory = cat.name"
            class="flex-1 py-1 rounded-lg text-base transition-colors"
            :class="activeCategory === cat.name ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'"
          >{{ cat.icon }}</button>
        </div>
        <!-- Emoji grid -->
        <div class="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
          <button
            v-for="emoji in currentEmojis"
            :key="emoji"
            @mousedown.prevent="insertEmoji(emoji)"
            class="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-slate-700/50 transition-colors"
          >{{ emoji }}</button>
        </div>
      </div>
    </Transition>

    <!-- Main input container -->
    <div
      class="relative bg-slate-800/50 border rounded-2xl transition-all duration-200"
      :class="isFocused
        ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
        : 'border-slate-700/40 shadow-sm'"
    >

      <!-- File preview strip (inside container) -->
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="selectedFiles.length > 0" class="flex items-center gap-2 px-3 pt-3 flex-wrap">
          <div
            v-for="(file, i) in selectedFiles"
            :key="i"
            class="relative flex items-center gap-1.5 bg-slate-700/60 border border-slate-600/40 rounded-lg overflow-hidden group/file"
            :class="file.type.startsWith('image/') && previewUrls[i] ? 'pr-6' : 'pl-2 pr-6 py-1'"
          >
            <!-- Image thumbnail -->
            <template v-if="file.type.startsWith('image/') && previewUrls[i]">
              <img
                :src="previewUrls[i]"
                class="w-16 h-12 object-cover"
                alt=""
              />
              <span class="absolute bottom-0 left-0 right-6 truncate text-[9px] text-white/70 bg-black/50 px-1 py-0.5 leading-tight">{{ file.name }}</span>
            </template>
            <!-- File chip -->
            <template v-else>
              <svg class="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="truncate text-xs text-gray-300 max-w-[120px]">{{ file.name }}</span>
            </template>
            <!-- Remove button -->
            <button
              @click="removeFile(i)"
              class="absolute right-0.5 top-0.5 w-5 h-5 rounded flex items-center justify-center bg-slate-900/70 text-gray-500 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover/file:opacity-100"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Textarea -->
      <textarea
        ref="textareaRef"
        v-model="text"
        @keydown="onKeydown"
        @input="onInput"
        @focus="isFocused = true"
        @blur="onBlur"
        rows="1"
        placeholder="Message…"
        class="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none overflow-hidden leading-relaxed max-h-48"
      />

      <!-- Bottom toolbar -->
      <div class="flex items-center gap-1 px-2 pb-2">

        <!-- Emoji button -->
        <button
          @click.stop="toggleEmojiPicker"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          :class="showEmojiPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
          title="Emoji"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Attach file button -->
        <button
          @click="fileInputRef?.click()"
          :disabled="selectedFiles.length >= 5"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
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

        <!-- Formatting help button -->
        <div class="relative">
          <button
            @click.stop="showFormatHelp = !showFormatHelp"
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-[11px] font-bold"
            :class="showFormatHelp ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10'"
            title="Formatting help"
          >Aa</button>

          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showFormatHelp"
              class="absolute bottom-full left-0 mb-2 w-52 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-3 z-20"
              @click.stop
            >
              <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">Formatting</p>
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">**bold**</code>
                  <strong class="text-[11px] text-gray-300">bold</strong>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">*italic*</code>
                  <em class="text-[11px] text-gray-300">italic</em>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">`inline code`</code>
                  <code class="text-[11px] text-indigo-300">code</code>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">```code block```</code>
                  <span class="text-[11px] text-gray-500">block</span>
                </div>
                <div class="border-t border-slate-700/40 pt-1.5">
                  <code class="text-[11px] text-gray-400 bg-slate-900/60 px-1.5 py-0.5 rounded">@name</code>
                  <span class="text-[11px] text-gray-500 ml-1">to mention</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex-1" />

        <!-- Hint -->
        <span class="hidden sm:block text-[10px] text-gray-700 pr-1 select-none">Enter to send</span>

        <!-- Send button -->
        <button
          @click="submit"
          :disabled="(!text.trim() && selectedFiles.length === 0) || loading"
          class="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          :class="(text.trim() || selectedFiles.length > 0) && !loading
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/30'
            : 'text-gray-700 cursor-not-allowed'"
        >
          <svg v-if="!loading" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
          <div v-else class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

const props = defineProps<{
  members: TeamMember[]
  replyingTo?: { _id: string; content: string; senderName: string }
}>()

const emit = defineEmits<{
  send: [content: string, files: File[]]
  typing: [isTyping: boolean]
  'cancel-reply': []
}>()

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_FILES = 5

const text = ref('')
const loading = ref(false)
const isFocused = ref(false)
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
  el.style.height = Math.min(el.scrollHeight, 192) + 'px'
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
  isFocused.value = false
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

  input.value = ''
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

// ── Formatting help ──────────────────────────────────────────────────────────
const showFormatHelp = ref(false)

// ── Emoji picker ────────────────────────────────────────────────────────────
const showEmojiPicker = ref(false)
const activeCategory = ref('smileys')
const emojiPickerRef = ref<HTMLElement | null>(null)

const emojiCategories = [
  { name: 'smileys', icon: '😀', emojis: ['😀','😂','😍','😎','😭','😊','😉','🥰','😅','🤣','😆','😋','🤩','😏','😒','😢','😤','😡','🥺','🤔','😴','🥳','😇','🫡','🤗','😬','🙄','😳','🤯','🥸'] },
  { name: 'hands',   icon: '👋', emojis: ['👋','👍','👎','✌️','🤞','🙌','👏','🤝','🙏','💪','🫶','☝️','👌','🤌','🤏','🫰','🖖','🤙','💅','🫵','👈','👉','👆','👇','✋','🤚','🖐️','🖕'] },
  { name: 'hearts',  icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💯','💞','💓','💗','💖','💘','💝','🩷','🩵','🩶','❣️','💔','❤️‍🔥','❤️‍🩹','🫀'] },
  { name: 'nature',  icon: '🌸', emojis: ['🌸','🌺','🌻','🌹','🍀','🌈','⭐','🌙','☀️','🌊','🔥','❄️','🌿','🍃','🌾','🦋','🐶','🐱','🐸','🦊','🐼','🐨','🦁','🐯','🦄','🌍','🌴','🍄'] },
  { name: 'food',    icon: '🍕', emojis: ['🍕','🍔','🍟','🌮','🍣','🍜','🍩','🍪','🎂','🍺','☕','🧋','🍓','🍇','🍎','🥑','🍿','🧇','🥗','🫕','🍱','🥐','🧆','🌯','🥤','🧃','🍦','🍰'] },
  { name: 'objects', icon: '🎉', emojis: ['🎉','🎊','🎁','🏆','🎯','💡','💎','💰','📱','💻','⚡','🚀','✨','🌟','💫','🎶','🎵','📸','🔑','🎮','⚽','🏀','🎸','🎨','📚','🔮','🛸','💣'] },
]

const currentEmojis = computed(() =>
  emojiCategories.find((c) => c.name === activeCategory.value)?.emojis ?? []
)

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function insertEmoji(emoji: string) {
  const el = textareaRef.value
  if (!el) {
    text.value += emoji
    return
  }
  const start = el.selectionStart ?? text.value.length
  const end = el.selectionEnd ?? text.value.length
  text.value = text.value.slice(0, start) + emoji + text.value.slice(end)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + emoji.length, start + emoji.length)
    autoResize()
  })
}

function onDocMouseDown(e: MouseEvent) {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(e.target as Node)) {
    showEmojiPicker.value = false
  }
}

watch(showEmojiPicker, (val) => {
  if (val) nextTick(() => document.addEventListener('mousedown', onDocMouseDown))
  else document.removeEventListener('mousedown', onDocMouseDown)
})

onUnmounted(() => document.removeEventListener('mousedown', onDocMouseDown))
// ────────────────────────────────────────────────────────────────────────────

defineExpose({ focus: () => textareaRef.value?.focus() })
</script>
