<template>
  <span
    class="inline-flex items-center gap-1.5 font-semibold rounded-full transition-all duration-200 select-none"
    :class="[sizeClasses, colorClasses, { 'cursor-pointer hover:scale-105 hover:shadow-lg': clickable }]"
  >
    <!-- Dot indicator -->
    <span v-if="dot" class="relative flex h-2 w-2">
      <span
        v-if="pulse"
        class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        :class="dotColorClasses"
      />
      <span class="relative inline-flex h-2 w-2 rounded-full" :class="dotColorClasses" />
    </span>

    <!-- Icon slot -->
    <slot name="icon" />

    <!-- Content -->
    <slot />

    <!-- Removable X button -->
    <button
      v-if="removable"
      type="button"
      class="ml-0.5 -mr-1 inline-flex items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
      :class="removeButtonSizeClasses"
      @click.stop="$emit('remove')"
    >
      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  color?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'violet' | 'pink' | 'cyan' | 'teal' | 'orange' | 'lime' | 'sky' | 'fuchsia' | 'purple'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'soft' | 'solid' | 'outline' | 'gradient'
  dot?: boolean
  pulse?: boolean
  removable?: boolean
  clickable?: boolean
}

defineEmits<{
  remove: []
}>()

const props = withDefaults(defineProps<Props>(), {
  color: 'slate',
  size: 'sm',
  variant: 'soft',
  dot: false,
  pulse: false,
  removable: false,
  clickable: false
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  return sizes[props.size]
})

const removeButtonSizeClasses = computed(() => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colorMap: Record<string, Record<string, string>> = {
    soft: {
      slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 ring-1 ring-slate-200/50 dark:ring-slate-600/30',
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 ring-1 ring-blue-200/50 dark:ring-blue-500/30',
      emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-200/50 dark:ring-emerald-500/30',
      amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-200/50 dark:ring-amber-500/30',
      rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 ring-1 ring-rose-200/50 dark:ring-rose-500/30',
      indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-200/50 dark:ring-indigo-500/30',
      violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 ring-1 ring-violet-200/50 dark:ring-violet-500/30',
      pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 ring-1 ring-pink-200/50 dark:ring-pink-500/30',
      cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 ring-1 ring-cyan-200/50 dark:ring-cyan-500/30',
      teal: 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 ring-1 ring-teal-200/50 dark:ring-teal-500/30',
      orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 ring-1 ring-orange-200/50 dark:ring-orange-500/30',
      lime: 'bg-lime-50 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300 ring-1 ring-lime-200/50 dark:ring-lime-500/30',
      sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 ring-1 ring-sky-200/50 dark:ring-sky-500/30',
      fuchsia: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 ring-1 ring-fuchsia-200/50 dark:ring-fuchsia-500/30',
      purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 ring-1 ring-purple-200/50 dark:ring-purple-500/30'
    },
    solid: {
      slate: 'bg-slate-600 text-white shadow-sm shadow-slate-600/30',
      blue: 'bg-blue-500 text-white shadow-sm shadow-blue-500/30',
      emerald: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
      amber: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
      rose: 'bg-rose-500 text-white shadow-sm shadow-rose-500/30',
      indigo: 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30',
      violet: 'bg-violet-500 text-white shadow-sm shadow-violet-500/30',
      pink: 'bg-pink-500 text-white shadow-sm shadow-pink-500/30',
      cyan: 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30',
      teal: 'bg-teal-500 text-white shadow-sm shadow-teal-500/30',
      orange: 'bg-orange-500 text-white shadow-sm shadow-orange-500/30',
      lime: 'bg-lime-500 text-white shadow-sm shadow-lime-500/30',
      sky: 'bg-sky-500 text-white shadow-sm shadow-sky-500/30',
      fuchsia: 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30',
      purple: 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
    },
    outline: {
      slate: 'bg-transparent text-slate-600 dark:text-slate-400 ring-1 ring-slate-300 dark:ring-slate-600',
      blue: 'bg-transparent text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/50',
      emerald: 'bg-transparent text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-500/50',
      amber: 'bg-transparent text-amber-600 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-500/50',
      rose: 'bg-transparent text-rose-600 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-500/50',
      indigo: 'bg-transparent text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300 dark:ring-indigo-500/50',
      violet: 'bg-transparent text-violet-600 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-500/50',
      pink: 'bg-transparent text-pink-600 dark:text-pink-400 ring-1 ring-pink-300 dark:ring-pink-500/50',
      cyan: 'bg-transparent text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-300 dark:ring-cyan-500/50',
      teal: 'bg-transparent text-teal-600 dark:text-teal-400 ring-1 ring-teal-300 dark:ring-teal-500/50',
      orange: 'bg-transparent text-orange-600 dark:text-orange-400 ring-1 ring-orange-300 dark:ring-orange-500/50',
      lime: 'bg-transparent text-lime-600 dark:text-lime-400 ring-1 ring-lime-300 dark:ring-lime-500/50',
      sky: 'bg-transparent text-sky-600 dark:text-sky-400 ring-1 ring-sky-300 dark:ring-sky-500/50',
      fuchsia: 'bg-transparent text-fuchsia-600 dark:text-fuchsia-400 ring-1 ring-fuchsia-300 dark:ring-fuchsia-500/50',
      purple: 'bg-transparent text-purple-600 dark:text-purple-400 ring-1 ring-purple-300 dark:ring-purple-500/50'
    },
    gradient: {
      slate: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md shadow-slate-500/25',
      blue: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md shadow-blue-500/25',
      emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25',
      amber: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25',
      rose: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/25',
      indigo: 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-md shadow-indigo-500/25',
      violet: 'bg-gradient-to-r from-violet-400 to-purple-600 text-white shadow-md shadow-violet-500/25',
      pink: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md shadow-pink-500/25',
      cyan: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md shadow-cyan-500/25',
      teal: 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-md shadow-teal-500/25',
      orange: 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md shadow-orange-500/25',
      lime: 'bg-gradient-to-r from-lime-400 to-green-500 text-white shadow-md shadow-lime-500/25',
      sky: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/25',
      fuchsia: 'bg-gradient-to-r from-fuchsia-400 to-pink-600 text-white shadow-md shadow-fuchsia-500/25',
      purple: 'bg-gradient-to-r from-purple-400 to-violet-600 text-white shadow-md shadow-purple-500/25'
    }
  }
  return colorMap[props.variant]?.[props.color] ?? ''
})

const dotColorClasses = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
    lime: 'bg-lime-500',
    sky: 'bg-sky-500',
    fuchsia: 'bg-fuchsia-500',
    purple: 'bg-purple-500'
  }
  return colors[props.color]
})
</script>
