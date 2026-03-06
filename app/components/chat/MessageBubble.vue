<template>
  <div
    :data-msg-id="message._id"
    class="flex gap-2 group/bubble rounded-2xl"
    :class="[mine ? 'flex-row-reverse' : 'flex-row', highlighted && 'msg-highlight']"
  >
    <!-- Avatar (other person only) -->
    <div
      v-if="!mine"
      class="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0 self-end"
    >
      {{ senderInitials }}
    </div>

    <div class="max-w-[70%] flex flex-col" :class="mine ? 'items-end' : 'items-start'">

      <!-- Reply preview (quoted message) -->
      <div
        v-if="replyToMessage && !message.isDeleted"
        class="flex items-start gap-1.5 mb-1 px-2.5 py-1.5 rounded-xl border-l-2 max-w-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        :class="mine
          ? 'bg-indigo-800/40 border-indigo-400/60 self-end'
          : 'bg-slate-800/60 border-slate-500/60'"
        @click="message.replyTo && $emit('scroll-to', message.replyTo)"
      >
        <div class="min-w-0">
          <p class="text-[10px] font-semibold mb-0.5" :class="mine ? 'text-indigo-300' : 'text-gray-400'">
            {{ replyToMessage.senderName }}
          </p>
          <p class="text-[11px] text-gray-400 truncate max-w-[220px]">
            {{ replyToMessage.content || '📎 Attachment' }}
          </p>
        </div>
      </div>

      <!-- Deleted message -->
      <div
        v-if="message.isDeleted"
        class="px-3 py-2 rounded-2xl text-xs text-gray-600 italic border border-slate-700/40"
        :class="mine ? 'rounded-tr-sm' : 'rounded-tl-sm'"
      >
        Message deleted
      </div>

      <template v-else>
        <!-- Edit mode -->
        <div v-if="isEditMode" class="w-full">
          <textarea
            ref="editTextareaRef"
            v-model="editContent"
            @keydown.enter.exact.prevent="saveEdit"
            @keydown.escape="cancelEdit"
            rows="2"
            class="w-full bg-slate-700/60 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none resize-none"
          />
          <div class="flex gap-1.5 mt-1" :class="mine ? 'justify-end' : 'justify-start'">
            <button
              @click="saveEdit"
              class="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium hover:bg-indigo-500/30 transition-colors"
            >Save</button>
            <button
              @click="cancelEdit"
              class="px-2.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/30 text-gray-400 text-[10px] hover:bg-slate-700/60 transition-colors"
            >Cancel</button>
          </div>
        </div>

        <template v-else>
          <!-- Text bubble -->
          <div
            v-if="message.content"
            class="px-3.5 py-2 rounded-2xl text-xs leading-relaxed"
            :class="mine
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
              : 'bg-slate-800/80 text-gray-200 rounded-tl-sm border border-slate-700/40'"
            v-html="renderedContent"
          />

          <!-- Attachments -->
          <div v-if="message.attachments?.length" class="flex flex-col gap-1.5 mt-1 w-full">
            <div
              v-if="imageAttachments.length"
              class="flex flex-wrap gap-1"
              :class="mine ? 'justify-end' : 'justify-start'"
            >
              <button
                v-for="img in imageAttachments"
                :key="img.url"
                @click="$emit('open-image', img)"
                class="block rounded-xl overflow-hidden border border-slate-700/40 hover:opacity-90 transition-opacity cursor-zoom-in"
                :style="imageAttachments.length === 1 ? 'max-width:240px' : 'width:112px;height:112px'"
              >
                <img :src="img.url" :alt="img.originalName" class="object-cover w-full h-full"
                  :style="imageAttachments.length === 1 ? 'max-height:200px' : ''" />
              </button>
            </div>
            <a
              v-for="file in fileAttachments"
              :key="file.url"
              :href="file.url"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors max-w-[240px]"
              :class="mine
                ? 'bg-indigo-700/50 border-indigo-500/30 text-indigo-100 hover:bg-indigo-700/70'
                : 'bg-slate-800/80 border-slate-700/40 text-gray-300 hover:bg-slate-700/60'"
            >
              <svg class="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="truncate flex-1">{{ file.originalName }}</span>
              <span v-if="file.size" class="opacity-50 flex-shrink-0">{{ formatBytes(file.size) }}</span>
            </a>
          </div>

          <!-- Read receipts (own messages only) -->
          <p
            v-if="mine && readCount > 0"
            class="text-[9px] text-indigo-300/50 mt-0.5 select-none"
          >Seen by {{ readCount }}</p>

          <!-- Reaction bar -->
          <div
            v-if="groupedReactions.length > 0"
            class="flex flex-wrap gap-1 mt-1.5"
            :class="mine ? 'justify-end' : 'justify-start'"
          >
            <button
              v-for="group in groupedReactions"
              :key="group.emoji"
              @click="$emit('react', message._id, group.emoji)"
              class="flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] transition-colors"
              :class="group.reacted
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700/40 text-gray-400 hover:bg-slate-700/50'"
              :title="group.emoji"
            >
              <span>{{ group.emoji }}</span>
              <span class="font-medium">{{ group.count }}</span>
            </button>
          </div>
        </template>
      </template>

      <!-- Time + actions row -->
      <div class="flex items-center gap-1.5 mt-1 px-0.5" :class="mine ? 'flex-row-reverse' : 'flex-row'">
        <span
          class="text-[10px] text-gray-600"
          :title="fullDateTime"
        >{{ formatTime(message.createdAt) }}{{ message.editedAt ? ' (edited)' : '' }}</span>

        <!-- Hover actions -->
        <div
          v-if="!message.isDeleted && !isEditMode"
          class="flex items-center gap-0.5 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
          :class="mine ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Copy -->
          <button
            v-if="message.content"
            @click="copyContent"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-700/50 transition-colors"
            :title="copied ? 'Copied!' : 'Copy'"
          >
            <svg v-if="!copied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Reply -->
          <button
            @click="$emit('reply', message)"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-700/50 transition-colors"
            title="Reply"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <!-- Edit (own messages only) -->
          <button
            v-if="mine && message.content"
            @click="startEdit"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-700/50 transition-colors"
            title="Edit"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <!-- React -->
          <div class="relative">
            <button
              @click.stop="showReactionPicker = !showReactionPicker"
              class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              title="React"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <!-- Quick emoji picker -->
            <Teleport to="body">
              <div
                v-if="showReactionPicker"
                class="fixed z-[9999] flex gap-1 px-2 py-1.5 bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40"
                :style="reactionPickerStyle"
                @click.stop
              >
                <button
                  v-for="emoji in quickEmojis"
                  :key="emoji"
                  @click="pickReaction(emoji)"
                  class="w-7 h-7 flex items-center justify-center text-base rounded-lg hover:bg-slate-700/60 transition-colors"
                >{{ emoji }}</button>
              </div>
              <div v-if="showReactionPicker" class="fixed inset-0 z-[9998]" @click="showReactionPicker = false" />
            </Teleport>
          </div>

          <!-- Pin -->
          <button
            @click="$emit('pin', message._id)"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Pin message"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <!-- Forward -->
          <button
            v-if="message.content"
            @click="$emit('forward', message)"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Forward"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <!-- Delete (own messages only) -->
          <button
            v-if="mine"
            @click="$emit('delete', message._id)"
            class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageAttachment } from '~/types'

interface ReplyPreview {
  _id: string
  content: string
  senderName: string
}

const props = defineProps<{
  message: ChatMessage
  mine: boolean
  senderName?: string
  replyToMessage?: ReplyPreview
  currentUserId?: string
  highlighted?: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
  reply: [message: ChatMessage]
  edit: [messageId: string, content: string]
  'scroll-to': [messageId: string]
  'open-image': [attachment: MessageAttachment]
  react: [messageId: string, emoji: string]
  pin: [messageId: string]
  forward: [message: ChatMessage]
}>()

const { formatTime } = useChat()

// ── Computed helpers ──────────────────────────────────────────────────────────

const senderInitials = computed(() => {
  const name = props.senderName ?? 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return name.charAt(0).toUpperCase()
})

const imageAttachments = computed<MessageAttachment[]>(() =>
  (props.message.attachments ?? []).filter((a) => a.mimeType.startsWith('image/')),
)

const fileAttachments = computed<MessageAttachment[]>(() =>
  (props.message.attachments ?? []).filter((a) => !a.mimeType.startsWith('image/')),
)

const groupedReactions = computed(() => {
  const map = new Map<string, { emoji: string; count: number; reacted: boolean }>()
  for (const r of (props.message.reactions ?? [])) {
    const entry = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, reacted: false }
    entry.count++
    if (r.userId === props.currentUserId) entry.reacted = true
    map.set(r.emoji, entry)
  }
  return [...map.values()]
})

const readCount = computed(() => {
  const count = (props.message.readBy ?? []).filter(
    (r) => r.userId !== props.currentUserId,
  ).length
  return count
})

const fullDateTime = computed(() =>
  new Date(props.message.createdAt).toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }),
)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Rendered content ──────────────────────────────────────────────────────────

function mentionChip(name: string, isEveryone: boolean): string {
  const cls = isEveryone
    ? 'background:rgba(245,158,11,0.15);color:rgb(252,211,77);border:1px solid rgba(245,158,11,0.25);'
    : 'background:rgba(99,102,241,0.15);color:rgb(165,180,252);border:1px solid rgba(99,102,241,0.25);'
  return `<span style="${cls}padding:0 4px;border-radius:4px;font-weight:600;font-size:11px;white-space:nowrap;">@${name}</span>`
}

function linkify(text: string): string {
  return text.replace(/https?:\/\/[^\s<>"]+/g, (rawUrl) => {
    const url = rawUrl.replace(/[.,;:!?)\]]+$/, '')
    const trailing = rawUrl.slice(url.length)
    const href = url.replace(/&amp;/g, '&')
    const link = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:rgb(129,140,248);text-decoration:underline;word-break:break-all;">${url}</a>`
    return link + trailing
  })
}

const renderedContent = computed(() => {
  const raw = props.message.content

  const codeBlocks: string[] = []
  let text = raw.replace(/```([\s\S]*?)```/g, (_, code: string) => {
    const escapedCode = code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^\n/, '')
    const idx = codeBlocks.length
    codeBlocks.push(
      `<pre style="background:rgba(15,23,42,0.85);border:1px solid rgba(71,85,105,0.4);border-radius:8px;padding:8px 12px;margin:4px 0;overflow-x:auto;font-family:'Courier New',monospace;font-size:11px;line-height:1.6;color:rgb(148,163,184);white-space:pre;">${escapedCode}</pre>`
    )
    return `\x00BLOCK${idx}\x00`
  })

  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  text = text.replace(/`([^`\n]+)`/g, (_, code: string) =>
    `<code style="background:rgba(15,23,42,0.7);border:1px solid rgba(71,85,105,0.4);border-radius:4px;padding:1px 5px;font-family:'Courier New',monospace;font-size:11px;color:rgb(148,163,184);">${code}</code>`
  )
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;">$1</strong>')
  text = text.replace(/\*([^*\n]+)\*/g, '<em style="font-style:italic;">$1</em>')
  text = text
    .replace(/@\[everyone\]/g, () => mentionChip('everyone', true))
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, (_, name: string) => mentionChip(name, false))
  text = linkify(text)
  text = text.replace(/\n/g, '<br>')
  text = text.replace(/\x00BLOCK(\d+)\x00/g, (_, idx: string) => codeBlocks[Number(idx)] ?? '')
  return text
})

// ── Copy ─────────────────────────────────────────────────────────────────────

const copied = ref(false)

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard not available
  }
}

// ── Reaction picker ───────────────────────────────────────────────────────────

const quickEmojis = ['👍','❤️','😂','😮','😢','🔥','👏','🙏']
const showReactionPicker = ref(false)
const reactionPickerStyle = ref('')

watch(showReactionPicker, (val) => {
  if (!val) return
  nextTick(() => {
    // Position picker near the action buttons using mouse position fallback
    const btn = document.activeElement as HTMLElement | null
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const top = rect.top - 48
    const left = Math.min(rect.left, window.innerWidth - 260)
    reactionPickerStyle.value = `top:${top}px;left:${left}px`
  })
})

function pickReaction(emoji: string) {
  emit('react', props.message._id, emoji)
  showReactionPicker.value = false
}

// ── Edit ─────────────────────────────────────────────────────────────────────

const isEditMode = ref(false)
const editContent = ref('')
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)

function startEdit() {
  editContent.value = props.message.content
  isEditMode.value = true
  nextTick(() => editTextareaRef.value?.focus())
}

function cancelEdit() {
  isEditMode.value = false
  editContent.value = ''
}

function saveEdit() {
  const trimmed = editContent.value.trim()
  if (!trimmed || trimmed === props.message.content) {
    cancelEdit()
    return
  }
  emit('edit', props.message._id, trimmed)
  isEditMode.value = false
}
</script>

<style scoped>
@keyframes msg-highlight {
  0%   {
    background-color: rgba(99, 102, 241, 0);
    box-shadow: none;
    transform: scale(1);
  }
  6%   {
    background-color: rgba(99, 102, 241, 0.28);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.55),
                0 0 28px rgba(99, 102, 241, 0.22),
                inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    transform: scale(1.009);
  }
  22%  {
    background-color: rgba(99, 102, 241, 0.18);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35),
                0 0 16px rgba(99, 102, 241, 0.14);
    transform: scale(1.003);
  }
  55%  {
    background-color: rgba(99, 102, 241, 0.08);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.18),
                0 0 8px  rgba(99, 102, 241, 0.07);
    transform: scale(1);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
}

.msg-highlight {
  animation: msg-highlight 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  border-radius: 1rem;
  padding: 4px 6px;
  margin: -4px -6px;
}
</style>
