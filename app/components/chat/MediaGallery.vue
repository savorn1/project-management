<template>
  <div class="w-60 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">
    <!-- Header -->
    <div class="px-3 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Media & Files</span>
      <button
        @click="$emit('close')"
        class="text-gray-600 hover:text-gray-300 transition-colors"
        title="Close"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex px-2 pt-2 pb-1 gap-1 flex-shrink-0">
      <button
        @click="tab = 'images'"
        class="flex-1 py-1 rounded-lg text-[11px] font-semibold transition-colors"
        :class="tab === 'images' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/40'"
      >Photos ({{ imageAttachments.length }})</button>
      <button
        @click="tab = 'files'"
        class="flex-1 py-1 rounded-lg text-[11px] font-semibold transition-colors"
        :class="tab === 'files' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/40'"
      >Files ({{ fileAttachments.length }})</button>
    </div>

    <!-- Images grid -->
    <div v-if="tab === 'images'" class="flex-1 overflow-y-auto">
      <div
        v-if="imageAttachments.length === 0"
        class="flex flex-col items-center justify-center h-32 text-center px-4"
      >
        <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-xs text-gray-600">No photos yet</p>
      </div>
      <div v-else class="grid grid-cols-3 gap-0.5 p-1">
        <button
          v-for="(img, i) in imageAttachments"
          :key="i"
          @click="$emit('open-image', img, imageAttachments)"
          class="aspect-square overflow-hidden rounded hover:opacity-80 transition-opacity cursor-zoom-in"
        >
          <img :src="img.url" :alt="img.originalName" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>

    <!-- Files list -->
    <div v-else class="flex-1 overflow-y-auto p-2">
      <div
        v-if="fileAttachments.length === 0"
        class="flex flex-col items-center justify-center h-32 text-center px-4"
      >
        <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-xs text-gray-600">No files yet</p>
      </div>
      <div v-else class="flex flex-col gap-1.5">
        <a
          v-for="(file, i) in fileAttachments"
          :key="i"
          :href="file.url"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:bg-slate-800 transition-colors"
        >
          <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] text-gray-300 truncate">{{ file.originalName }}</p>
            <p v-if="file.size" class="text-[9px] text-gray-600">{{ formatBytes(file.size) }}</p>
          </div>
          <svg class="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageAttachment } from '~/types'

const props = defineProps<{
  messages: ChatMessage[]
}>()

defineEmits<{
  close: []
  'open-image': [attachment: MessageAttachment, images: MessageAttachment[]]
}>()

const tab = ref<'images' | 'files'>('images')

const imageAttachments = computed<MessageAttachment[]>(() =>
  props.messages
    .slice()
    .reverse()
    .flatMap((m) => (m.attachments ?? []).filter((a) => a.mimeType.startsWith('image/'))),
)

const fileAttachments = computed<MessageAttachment[]>(() =>
  props.messages
    .slice()
    .reverse()
    .flatMap((m) => (m.attachments ?? []).filter((a) => !a.mimeType.startsWith('image/'))),
)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
