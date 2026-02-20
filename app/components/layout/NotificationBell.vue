<template>
  <div class="relative" ref="bellRef">
    <!-- Bell button -->
    <button
      @click="toggle"
      class="w-10 h-10 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-200 relative group"
    >
      <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center shadow-lg shadow-rose-500/30"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown panel -->
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[9998]" @click="open = false" />
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="open"
          :style="panelStyle"
          class="fixed w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 z-[9999] overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-white">Notifications</span>
              <span v-if="unreadCount > 0" class="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded-full">
                {{ unreadCount }} new
              </span>
            </div>
            <button
              v-if="unreadCount > 0"
              @click="markAllRead"
              class="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Mark all read
            </button>
          </div>

          <!-- List -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="isLoading" class="flex items-center justify-center py-10">
              <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>

            <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-4">
              <div class="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center mb-2">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p class="text-sm text-gray-500 font-medium">All caught up!</p>
              <p class="text-xs text-gray-600 mt-0.5">No notifications yet</p>
            </div>

            <div v-else class="divide-y divide-slate-800/40">
              <button
                v-for="n in notifications"
                :key="n._id"
                @click="handleClick(n)"
                class="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-800/40 transition-colors text-left"
                :class="{ 'bg-indigo-500/5': !n.isRead }"
              >
                <!-- Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <span class="text-base" :class="n.type === 'mentioned' ? 'text-indigo-400' : 'text-amber-400'">
                    {{ n.type === 'mentioned' ? '💬' : '📌' }}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-200 leading-relaxed" :class="{ 'font-medium text-white': !n.isRead }">
                    {{ n.message }}
                  </p>
                  <p v-if="n.taskTitle" class="text-[11px] text-indigo-400/70 mt-0.5 truncate">{{ n.taskTitle }}</p>
                  <p class="text-[11px] text-gray-600 mt-0.5">{{ formatRelative(n.createdAt) }}</p>
                </div>

                <!-- Unread dot -->
                <div v-if="!n.isRead" class="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const bellRef = ref<HTMLElement | null>(null)
const open = ref(false)
const isLoading = ref(false)
const panelStyle = ref({})

const { notifications, unreadCount, loadNotifications, markRead, markAllRead } = useNotifications()

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => positionPanel())
    if (notifications.value.length === 0) fetchNotifications()
  }
}

function positionPanel() {
  if (!bellRef.value) return
  const rect = bellRef.value.getBoundingClientRect()
  panelStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
}

async function fetchNotifications() {
  isLoading.value = true
  await loadNotifications()
  isLoading.value = false
}

async function handleClick(n: { _id: string; isRead: boolean }) {
  if (!n.isRead) await markRead(n._id)
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  return new Date(dateStr).toLocaleDateString()
}
</script>
