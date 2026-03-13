<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="text-sm font-semibold text-white">Reminders</h3>
        <span v-if="pending.length" class="px-1.5 py-0.5 rounded-full bg-amber-600/30 text-amber-300 text-[10px] font-semibold">{{ pending.length }}</span>
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
        <div class="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>

      <div v-else-if="pending.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">No pending reminders</p>
        <p class="text-xs text-gray-600 mt-1">Right-click a message to set a reminder</p>
      </div>

      <div
        v-else
        v-for="r in pending"
        :key="r._id"
        class="group flex gap-3 p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl hover:border-slate-600/60 transition-colors"
        @click="$emit('jump', r.conversationId, r.messageId)"
      >
        <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div class="flex-1 min-w-0 cursor-pointer">
          <p v-if="r.note" class="text-sm font-medium text-amber-200 truncate">{{ r.note }}</p>
          <p v-if="r.messageContent" class="text-xs text-gray-400 line-clamp-1 mt-0.5">{{ r.messageContent }}</p>
          <p class="text-[11px] text-amber-400 mt-1">{{ formatRemindAt(r.remindAt) }}</p>
        </div>
        <button
          @click.stop="cancel(r._id)"
          :disabled="cancelling === r._id"
          class="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          title="Cancel reminder"
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
defineEmits<{ close: []; jump: [conversationId: string, messageId: string] }>()

const { reminders, loadReminders, cancelReminder } = useChat()

const loading = ref(false)
const cancelling = ref<string | null>(null)

const pending = computed(() =>
  reminders.value.filter(r => r.status === 'pending').sort(
    (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()
  )
)

async function cancel(id: string) {
  cancelling.value = id
  try { await cancelReminder(id) } finally { cancelling.value = null }
}

function formatRemindAt(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  if (diffMs < 0) return 'Due now'
  const mins = Math.round(diffMs / 60_000)
  if (mins < 60) return `In ${mins} min`
  const hours = Math.round(diffMs / 3_600_000)
  if (hours < 24) return `In ${hours}h`
  return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  loading.value = true
  try { await loadReminders() } finally { loading.value = false }
})
</script>
