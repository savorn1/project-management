<template>
  <span
    v-if="value !== null && value !== undefined && value !== ''"
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
    :class="resolvedClass"
  >
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="dotClass" />
    {{ label }}
  </span>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
/** Map of value → Tailwind color name (badge/dot classes are pre-defined) */
type ColorName = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'orange' | 'slate'

const BADGE: Record<ColorName, string> = {
  indigo:  'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  rose:    'bg-rose-500/10 border-rose-500/30 text-rose-400',
  amber:   'bg-amber-500/10 border-amber-500/30 text-amber-400',
  sky:     'bg-sky-500/10 border-sky-500/30 text-sky-400',
  violet:  'bg-violet-500/10 border-violet-500/30 text-violet-400',
  orange:  'bg-orange-500/10 border-orange-500/30 text-orange-400',
  slate:   'bg-slate-700/60 border-slate-600/60 text-gray-300',
}
const DOT: Record<ColorName, string> = {
  indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', rose: 'bg-rose-400',
  amber: 'bg-amber-400', sky: 'bg-sky-400', violet: 'bg-violet-400',
  orange: 'bg-orange-400', slate: 'bg-gray-400',
}

interface Props {
  value: string | number | null | undefined
  /** Map of value → display label */
  options?: Record<string, string>
  /** Map of value → color name */
  colors?: Partial<Record<string, ColorName>>
  /** Fallback color when no mapping exists */
  defaultColor?: ColorName
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
  colors: () => ({}),
  defaultColor: 'slate',
})

const label         = computed(() => props.options[String(props.value)] ?? String(props.value))
const resolvedColor = computed<ColorName>(() => (props.colors[String(props.value)] as ColorName) ?? props.defaultColor)
const resolvedClass = computed(() => BADGE[resolvedColor.value])
const dotClass      = computed(() => DOT[resolvedColor.value])
</script>
