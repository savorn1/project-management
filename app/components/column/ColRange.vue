<template>
  <div v-if="value !== null && value !== undefined" class="flex items-center gap-2 min-w-[100px]">
    <div class="relative flex-1 h-4 flex items-center">
      <!-- Track -->
      <div class="absolute inset-x-0 h-1.5 bg-slate-600 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full"
          :class="barClass"
          style="transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          :style="{ width: displayPct + '%' }"
        />
      </div>
      <!-- Value inside bar -->
      <span
        v-if="showValue && inBar"
        class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white leading-none pointer-events-none"
        style="text-shadow: 0 0 4px rgba(0,0,0,0.8)"
      >{{ showMax ? `${value}/${max}` : `${Math.round(displayPct)}%` }}</span>
    </div>
    <!-- Value beside bar -->
    <span v-if="showValue && !inBar" class="text-xs text-gray-400 tabular-nums flex-shrink-0 w-8 text-right">
      {{ showMax ? `${value}/${max}` : value }}
    </span>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface Props {
  value: number | null | undefined
  min?: number
  max?: number
  showValue?: boolean
  showMax?: boolean
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
  /** Show the value label inside the bar instead of beside it */
  inBar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0, max: 100, showValue: true, color: 'indigo', inBar: false,
})

const COLOR: Record<string, string> = {
  indigo: 'bg-indigo-500', emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',   rose: 'bg-rose-500', sky: 'bg-sky-500',
}

const pct      = computed(() => Math.min(100, Math.max(0, ((props.value! - props.min) / (props.max - props.min)) * 100)))
const barClass = computed(() => COLOR[props.color] ?? COLOR.indigo)

const displayPct = ref(0)

onMounted(() => {
  requestAnimationFrame(() => { displayPct.value = pct.value })
})

watch(pct, (v) => { displayPct.value = v })
</script>
