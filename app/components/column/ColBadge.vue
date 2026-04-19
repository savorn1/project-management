<template>
  <span
    v-if="value !== null && value !== undefined && value !== ''"
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
    :class="colorClass"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dotClass" />
    {{ value }}
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
type BadgeColor = 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'orange'

const COLOR_MAP: Record<BadgeColor, { badge: string; dot: string }> = {
  slate:   { badge: 'bg-slate-700/60 border-slate-600/60 text-gray-300',          dot: 'bg-gray-400' },
  indigo:  { badge: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',      dot: 'bg-indigo-400' },
  emerald: { badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',   dot: 'bg-emerald-400' },
  rose:    { badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',            dot: 'bg-rose-400' },
  amber:   { badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',         dot: 'bg-amber-400' },
  sky:     { badge: 'bg-sky-500/10 border-sky-500/30 text-sky-400',               dot: 'bg-sky-400' },
  violet:  { badge: 'bg-violet-500/10 border-violet-500/30 text-violet-400',      dot: 'bg-violet-400' },
  orange:  { badge: 'bg-orange-500/10 border-orange-500/30 text-orange-400',      dot: 'bg-orange-400' },
}

interface Props {
  value: string | number | null | undefined
  color?: BadgeColor
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), { color: 'slate', dot: false })

const colorClass = computed(() => COLOR_MAP[props.color]?.badge ?? COLOR_MAP.slate.badge)
const dotClass   = computed(() => COLOR_MAP[props.color]?.dot   ?? COLOR_MAP.slate.dot)
</script>
