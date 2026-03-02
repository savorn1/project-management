<template>
  <div class="flex items-end gap-2 p-4 border-t border-slate-800/60">
    <div class="flex-1 relative">
      <textarea
        ref="textareaRef"
        v-model="text"
        @keydown.enter.exact.prevent="submit"
        @keydown.enter.shift.exact="newline"
        @keydown="onKeydown"
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
const emit = defineEmits<{
  send: [content: string]
  typing: [isTyping: boolean]
}>()

const text = ref('')
const loading = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
}

function onKeydown(e: KeyboardEvent) {
  // Don't count Enter/Shift/Ctrl/etc as typing
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

function newline() {
  text.value += '\n'
  nextTick(autoResize)
}

defineExpose({ focus: () => textareaRef.value?.focus() })
</script>
