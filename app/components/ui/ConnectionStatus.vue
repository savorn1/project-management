<template>
  <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/40">
    <!-- Status indicator -->
    <div
      class="w-2 h-2 rounded-full transition-all duration-300"
      :class="statusClass"
    ></div>
    <span class="text-xs font-medium text-gray-400">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
const socket = useSocket()

const statusClass = computed(() => {
  if (socket.isConnected.value) {
    return 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse'
  }
  return 'bg-gray-500'
})

const statusText = computed(() => {
  if (socket.isConnected.value) {
    return 'Live'
  }
  return 'Offline'
})
</script>
