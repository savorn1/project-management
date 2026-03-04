<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="accent-layout-glow fixed inset-0 pointer-events-none z-0"></div>

    <AppSidebar />

    <!-- Main area offset by sidebar width via CSS var -->
    <div
      class="fixed top-0 right-0 bottom-0 flex flex-col z-10 transition-[left] duration-300"
      style="left: var(--sidebar-w)"
    >
      <AppHeader />
      <main class="flex-1 overflow-y-auto" style="padding: var(--content-p)">
        <slot />
      </main>
    </div>

    <BaseToast />
  </div>
</template>

<script setup lang="ts">
const socket = useSocket()
const { initAuth } = useAuth()
const { startListening } = useNotifications()

onMounted(() => {
  initAuth()
  socket.connect()
  startListening()
})

onUnmounted(() => {
  socket.disconnect()
})
</script>
