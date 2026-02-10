<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <!-- Subtle background pattern -->
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none z-0"></div>

    <AppSidebar />
    <div class="fixed top-0 left-64 right-0 bottom-0 flex flex-col z-10">
      <AppHeader />
      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
    <BaseToast />
  </div>
</template>

<script setup lang="ts">
</script>
