<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-sm font-semibold text-white">Scheduled Messages</h3>
        <span v-if="pending.length" class="px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-semibold">{{ pending.length }}</span>
      </div>
      <button @click="$emit('close')" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>

      <div v-else-if="pending.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">No scheduled messages</p>
        <p class="text-xs text-gray-600 mt-1">Use the clock icon in the message input</p>
      </div>

      <div
        v-else
        v-for="msg in pending"
        :key="msg._id"
        class="group flex gap-3 p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl hover:border-slate-600/60 transition-colors"
      >
        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 line-clamp-2">{{ msg.content }}</p>
          <p class="text-[11px] text-indigo-300 mt-1">
            <svg class="w-3 h-3 inline mr-0.5 -mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatScheduledFor(msg.scheduledFor) }}
          </p>
        </div>
        <button
          @click="cancel(msg._id)"
          :disabled="cancelling === msg._id"
          class="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          title="Cancel"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ close: [] }>()

const { scheduledMessages, loadScheduledMessages, cancelScheduledMessage } = useChat()

const loading = ref(false)
const cancelling = ref<string | null>(null)

const pending = computed(() =>
  scheduledMessages.value.filter(m => m.status === 'pending').sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  )
)

async function cancel(id: string) {
  cancelling.value = id
  try { await cancelScheduledMessage(id) } finally { cancelling.value = null }
}

function formatScheduledFor(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.round(diff / 3_600_000)
  if (hours < 24) return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  loading.value = true
  try { await loadScheduledMessages() } finally { loading.value = false }
})
</script>
