<template>
  <div class="relative flex items-end gap-2 p-4 border-t border-slate-800/60">

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
        class="absolute bottom-full left-4 right-16 mb-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden z-10"
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
      :disabled="!text.trim() || loading"
      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
      :class="text.trim() && !loading
        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/25'
        : 'bg-slate-800/60 text-gray-600 cursor-not-allowed'"
    >
      <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

const props = defineProps<{
  members: TeamMember[]
}>()

const emit = defineEmits<{
  send: [content: string]
  typing: [isTyping: boolean]
}>()

const text = ref('')
const loading = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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
  // Snapshot before mention handler may close the dropdown
  const dropdownWasOpen = showDropdown.value
  mentionKeydown(e)

  // Mention dropdown handled this key — don't do anything else
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

async function submit() {
  const content = text.value.trim()
  if (!content || loading.value) return
  loading.value = true
  emit('typing', false)
  text.value = ''
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })
  emit('send', content)
  loading.value = false
}

defineExpose({ focus: () => textareaRef.value?.focus() })
</script>
