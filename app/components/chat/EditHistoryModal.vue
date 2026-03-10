<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

      <div class="relative w-[420px] max-w-[92vw] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden max-h-[70vh]">
        <!-- Header -->
        <div class="px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p class="text-sm font-semibold text-white">Edit History</p>
          </div>
          <button
            @click="$emit('close')"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- History list -->
        <div class="overflow-y-auto flex-1">
          <!-- No history state -->
          <div v-if="!history.length" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-xs text-gray-500">No edit history available</p>
          </div>

          <div v-else class="divide-y divide-slate-800/60">
            <!-- Current version (always first) -->
            <div class="px-4 py-3">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Current version</span>
                <span class="text-[10px] text-gray-600">{{ formatTime(props.message.editedAt!) }}</span>
              </div>
              <p class="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap break-words">{{ props.message.content || '(empty)' }}</p>
            </div>

            <!-- Previous versions (newest-first) -->
            <div
              v-for="(entry, idx) in reversedHistory"
              :key="idx"
              class="px-4 py-3"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  {{ idx === reversedHistory.length - 1 ? 'Original' : `Version ${reversedHistory.length - idx}` }}
                </span>
                <span class="text-[10px] text-gray-600">{{ formatTime(entry.editedAt) }}</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap break-words">{{ entry.content || '(empty)' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageEditHistoryEntry } from '~/types'

const props = defineProps<{
  message: ChatMessage
}>()

defineEmits<{ close: [] }>()

const { formatTime } = useChat()

const history = computed<MessageEditHistoryEntry[]>(() => props.message.editHistory ?? [])

// Show newest edits first (last item in array is most recent previous version)
const reversedHistory = computed(() => [...history.value].reverse())
</script>
