<template>
  <div
    class="flex flex-col items-center justify-center px-4 text-center"
    :class="size === 'sm' ? 'py-6' : 'py-12'"
  >
    <div
      class="bg-slate-700/50 rounded-full flex items-center justify-center mb-3"
      :class="size === 'sm' ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl mb-4'"
    >
      {{ icon }}
    </div>
    <h3
      class="font-medium text-white mb-1"
      :class="size === 'sm' ? 'text-sm' : 'text-lg mb-2'"
    >
      {{ title }}
    </h3>
    <p
      class="text-gray-400 max-w-sm"
      :class="size === 'sm' ? 'text-xs mb-4' : 'mb-6'"
    >
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  size?: 'default' | 'sm'
}

withDefaults(defineProps<Props>(), {
  size: 'default'
})
</script>
