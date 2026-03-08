<template>
  <div
    class="flex flex-col bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
    style="width:260px"
    @click.stop
  >
    <div class="px-3 pt-3 pb-2 border-b border-slate-700/40">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Set status</p>

      <!-- Emoji button + text input -->
      <div class="flex items-center gap-2">
        <button
          ref="emojiBtnRef"
          @click.stop="toggleEmojiPicker"
          class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-700/50 border border-slate-600/40 hover:bg-slate-700 transition-colors text-base"
        >{{ selectedEmoji || '😶' }}</button>
        <input
          v-model="statusText"
          placeholder="What's your status?"
          maxlength="80"
          class="flex-1 bg-slate-700/50 border border-slate-600/30 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          @keydown.enter="save"
          @keydown.escape="$emit('close')"
        />
      </div>
    </div>

    <!-- Presets -->
    <div class="py-1.5">
      <button
        v-for="preset in presets"
        :key="preset.text"
        @click="applyPreset(preset)"
        class="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-700/50 transition-colors text-left"
      >
        <span class="text-base">{{ preset.emoji }}</span>
        <span class="text-xs text-gray-300">{{ preset.text }}</span>
      </button>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-700/40">
      <button
        @click="clear"
        class="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
      >Clear status</button>
      <button
        @click="save"
        class="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/30 transition-colors"
      >Set status</button>
    </div>
  </div>

  <!-- Floating EmojiPicker — teleported to avoid clipping -->
  <Teleport to="body">
    <div
      v-if="showEmojiPicker"
      class="fixed z-[10000]"
      :style="emojiPickerStyle"
      @click.stop
    >
      <EmojiPicker @pick="pickEmoji" />
    </div>
    <div v-if="showEmojiPicker" class="fixed inset-0 z-[9999]" @click="showEmojiPicker = false" />
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentEmoji?: string
  currentText?: string
}>()

const emit = defineEmits<{
  close: []
  save: [emoji: string, text: string]
}>()

const selectedEmoji = ref(props.currentEmoji ?? '')
const statusText = ref(props.currentText ?? '')
const showEmojiPicker = ref(false)
const emojiBtnRef = ref<HTMLElement | null>(null)
const emojiPickerStyle = ref('')

const presets = [
  { emoji: '💼', text: 'In a meeting' },
  { emoji: '🎯', text: 'Focusing, do not disturb' },
  { emoji: '🏠', text: 'Working from home' },
  { emoji: '🌴', text: 'On vacation' },
  { emoji: '🤒', text: 'Out sick' },
  { emoji: '🚀', text: 'Shipping something' },
  { emoji: '☕', text: 'On a break' },
]

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    nextTick(() => {
      const btn = emojiBtnRef.value
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const pickerW = 300
      const pickerH = 360
      const left = Math.min(Math.max(rect.left - 4, 8), window.innerWidth - pickerW - 8)
      const top = rect.bottom + pickerH + 8 > window.innerHeight
        ? rect.top - pickerH - 8
        : rect.bottom + 6
      emojiPickerStyle.value = `top:${top}px;left:${left}px`
    })
  }
}

function pickEmoji(emoji: string) {
  selectedEmoji.value = emoji
  showEmojiPicker.value = false
}

function applyPreset(preset: { emoji: string; text: string }) {
  selectedEmoji.value = preset.emoji
  statusText.value = preset.text
}

function save() {
  emit('save', selectedEmoji.value, statusText.value.trim())
  emit('close')
}

function clear() {
  emit('save', '', '')
  emit('close')
}
</script>
