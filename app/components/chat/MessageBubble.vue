<template>
  <div class="flex gap-2 group" :class="mine ? 'flex-row-reverse' : 'flex-row'">
    <!-- Avatar (other person only) -->
    <div
      v-if="!mine"
      class="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0 self-end"
    >
      {{ senderInitials }}
    </div>

    <div class="max-w-[70%] flex flex-col" :class="mine ? 'items-end' : 'items-start'">
      <!-- Deleted message -->
      <div
        v-if="message.isDeleted"
        class="px-3 py-2 rounded-2xl text-xs text-gray-600 italic border border-slate-700/40"
        :class="mine ? 'rounded-tr-sm' : 'rounded-tl-sm'"
      >
        Message deleted
      </div>

      <template v-else>
        <!-- Text bubble (shown when there is content) -->
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

          <!-- Images grid -->
          <div
            v-if="imageAttachments.length"
            class="flex flex-wrap gap-1"
            :class="mine ? 'justify-end' : 'justify-start'"
          >
            <a
              v-for="img in imageAttachments"
              :key="img.url"
              :href="img.url"
              target="_blank"
              rel="noopener"
              class="block rounded-xl overflow-hidden border border-slate-700/40 hover:opacity-90 transition-opacity"
              :style="imageAttachments.length === 1 ? 'max-width:240px' : 'width:112px;height:112px'"
            >
              <img
                :src="img.url"
                :alt="img.originalName"
                class="object-cover w-full h-full"
                :style="imageAttachments.length === 1 ? 'max-height:200px' : ''"
              />
            </a>
          </div>

          <!-- File chips -->
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
      </template>

      <!-- Time + actions -->
      <div class="flex items-center gap-2 mt-1 px-1" :class="mine ? 'flex-row-reverse' : 'flex-row'">
        <span class="text-[10px] text-gray-600">{{ formatTime(message.createdAt) }}</span>

        <!-- Delete (mine only) -->
        <button
          v-if="mine && !message.isDeleted"
          @click="$emit('delete', message._id)"
          class="text-[10px] text-gray-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageAttachment } from '~/types'

const props = defineProps<{
  message: ChatMessage
  mine: boolean
  senderName?: string
}>()

defineEmits<{
  delete: [id: string]
}>()

const { formatTime } = useChat()

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function mentionChip(name: string, isEveryone: boolean): string {
  const cls = isEveryone
    ? 'background:rgba(245,158,11,0.15);color:rgb(252,211,77);border:1px solid rgba(245,158,11,0.25);'
    : 'background:rgba(99,102,241,0.15);color:rgb(165,180,252);border:1px solid rgba(99,102,241,0.25);'
  return `<span style="${cls}padding:0 4px;border-radius:4px;font-weight:600;font-size:11px;white-space:nowrap;">@${name}</span>`
}

const renderedContent = computed(() => {
  const escaped = props.message.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/@\[everyone\]/g, () => mentionChip('everyone', true))
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, (_, name: string) => mentionChip(name, false))
    .replace(/\n/g, '<br>')
})
</script>
