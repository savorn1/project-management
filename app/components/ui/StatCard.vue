<template>
  <div class="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10 p-6 group hover:border-slate-600/50 transition-all duration-300">
    <!-- Background glow -->
    <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30" :class="glowClass"></div>

    <div class="relative flex items-start justify-between">
      <div>
        <p class="text-gray-400 text-sm font-medium uppercase tracking-wide">{{ label }}</p>
        <p class="text-4xl font-bold text-white mt-2 tracking-tight">{{ value }}</p>
        <p v-if="change" class="text-sm mt-3 flex items-center gap-1" :class="changeColor">
          <span>{{ changeIcon }}</span>
          {{ changeText }}
        </p>
      </div>
      <div
        class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110"
        :class="iconBgClass"
      >
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  icon: string
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet' | 'cyan'
  change?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: 'indigo'
})

const iconBgClass = computed(() => {
  const colors = {
    indigo: 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30',
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
    rose: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30',
    violet: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30',
    cyan: 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-500/30'
  }
  return colors[props.color]
})

const glowClass = computed(() => {
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500'
  }
  return colors[props.color]
})

const changeColor = computed(() => {
  if (!props.change) return 'text-gray-400'
  return props.change > 0 ? 'text-emerald-400' : 'text-rose-400'
})

const changeIcon = computed(() => {
  if (!props.change) return ''
  return props.change > 0 ? '↑' : '↓'
})

const changeText = computed(() => {
  if (!props.change) return ''
  return `${Math.abs(props.change)}% from last week`
})
</script>
