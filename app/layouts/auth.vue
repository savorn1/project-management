<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
    <!-- Background radial glow -->
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]"></div>

    <!-- Ambient blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-48 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-48 -left-48 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-4xl">
      <slot />
    </div>
    <BaseToast />
  </div>
</template>

<script setup lang="ts">
</script>
