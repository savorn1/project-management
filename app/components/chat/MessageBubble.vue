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

      <!-- Normal message -->
      <div
        v-else
        class="px-3.5 py-2 rounded-2xl text-xs leading-relaxed"
        :class="mine
          ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
          : 'bg-slate-800/80 text-gray-200 rounded-tl-sm border border-slate-700/40'"
      >
        {{ message.content }}
      </div>

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
import type { ChatMessage } from '~/types'

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
</script>
