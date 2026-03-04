<template>
  <div
    class="shadow-xl shadow-black/10 transition-all duration-300 hover:brightness-105"
    :class="[padding, radius]"
    :style="{
      background:     'linear-gradient(to bottom right, var(--card-from), var(--card-to))',
      border:         '1px solid var(--card-border)',
      backdropFilter: 'blur(var(--card-blur))',
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  noPadding: false,
})

const padding = computed(() => props.noPadding ? '' : 'p-[var(--card-p)]')
const radius  = computed(() => 'rounded-[var(--r-card)]')
</script>
