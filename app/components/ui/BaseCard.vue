<template>
  <div
    class="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300"
    :class="padding"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  noPadding: false
})

const padding = computed(() => props.noPadding ? '' : 'p-6')
</script>
