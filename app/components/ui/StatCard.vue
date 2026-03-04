<template>
  <div
    class="relative overflow-hidden rounded-2xl border shadow-xl p-6 group transition-all duration-300 cursor-default"
    :class="cardClass"
  >
    <!-- Top accent bar -->
    <div class="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" :class="accentClass"></div>

    <!-- Background glow -->
    <div
      class="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-15 transition-opacity duration-300 group-hover:opacity-30"
      :class="glowClass"
    ></div>

    <!-- Bottom shimmer -->
    <div
      class="absolute bottom-0 left-0 right-0 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
      :class="glowClass"
      style="filter: blur(16px);"
    ></div>

    <div class="relative flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold uppercase tracking-widest mb-2" :class="labelClass">{{ label }}</p>
        <p class="text-4xl font-extrabold tracking-tight leading-none" :class="valueClass">{{ value }}</p>

        <p v-if="change" class="text-sm mt-3 flex items-center gap-1 font-medium" :class="changeColor">
          <span class="text-base">{{ changeIcon }}</span>
          {{ changeText }}
        </p>
        <div v-else class="mt-3 h-[3px] w-10 rounded-full opacity-50" :class="accentClass"></div>
      </div>

      <div
        class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
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

const cardClass = computed(() => {
  const map = {
    indigo:  'bg-gradient-to-br from-indigo-950/50 via-slate-800/70 to-slate-800/40 border-indigo-700/20 hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    emerald: 'bg-gradient-to-br from-emerald-950/50 via-slate-800/70 to-slate-800/40 border-emerald-700/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    amber:   'bg-gradient-to-br from-amber-950/50 via-slate-800/70 to-slate-800/40 border-amber-700/20 hover:border-amber-500/50 hover:shadow-amber-500/10',
    rose:    'bg-gradient-to-br from-rose-950/50 via-slate-800/70 to-slate-800/40 border-rose-700/20 hover:border-rose-500/50 hover:shadow-rose-500/10',
    blue:    'bg-gradient-to-br from-blue-950/50 via-slate-800/70 to-slate-800/40 border-blue-700/20 hover:border-blue-500/50 hover:shadow-blue-500/10',
    violet:  'bg-gradient-to-br from-violet-950/50 via-slate-800/70 to-slate-800/40 border-violet-700/20 hover:border-violet-500/50 hover:shadow-violet-500/10',
    cyan:    'bg-gradient-to-br from-cyan-950/50 via-slate-800/70 to-slate-800/40 border-cyan-700/20 hover:border-cyan-500/50 hover:shadow-cyan-500/10',
  }
  return map[props.color]
})

const accentClass = computed(() => {
  const map = {
    indigo:  'bg-gradient-to-r from-indigo-500 to-violet-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    amber:   'bg-gradient-to-r from-amber-500 to-orange-500',
    rose:    'bg-gradient-to-r from-rose-500 to-pink-500',
    blue:    'bg-gradient-to-r from-blue-500 to-cyan-500',
    violet:  'bg-gradient-to-r from-violet-500 to-purple-500',
    cyan:    'bg-gradient-to-r from-cyan-500 to-teal-500',
  }
  return map[props.color]
})

const glowClass = computed(() => {
  const map = {
    indigo:  'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    rose:    'bg-rose-500',
    blue:    'bg-blue-500',
    violet:  'bg-violet-500',
    cyan:    'bg-cyan-500',
  }
  return map[props.color]
})

const labelClass = computed(() => {
  const map = {
    indigo:  'text-indigo-300/70',
    emerald: 'text-emerald-300/70',
    amber:   'text-amber-300/70',
    rose:    'text-rose-300/70',
    blue:    'text-blue-300/70',
    violet:  'text-violet-300/70',
    cyan:    'text-cyan-300/70',
  }
  return map[props.color]
})

const valueClass = computed(() => {
  const map = {
    indigo:  'text-indigo-50',
    emerald: 'text-emerald-50',
    amber:   'text-amber-50',
    rose:    'text-rose-50',
    blue:    'text-blue-50',
    violet:  'text-violet-50',
    cyan:    'text-cyan-50',
  }
  return map[props.color]
})

const iconBgClass = computed(() => {
  const map = {
    indigo:  'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30',
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber:   'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
    rose:    'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
    blue:    'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30',
    violet:  'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30',
    cyan:    'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-500/30',
  }
  return map[props.color]
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
