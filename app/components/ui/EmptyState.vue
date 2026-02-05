<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl mb-4">
      {{ icon }}
    </div>
    <h3 class="text-lg font-medium text-white mb-2">{{ title }}</h3>
    <p class="text-gray-400 max-w-sm mb-6">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>
