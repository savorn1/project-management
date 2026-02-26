<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
    :class="config.class"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="config.dot"></span>
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import type { OrderStatus } from '~/types'

const props = defineProps<{ status: OrderStatus }>()

const STATUS_MAP: Record<OrderStatus, { label: string; class: string; dot: string }> = {
  pending:    { label: 'Pending',    class: 'bg-amber-500/15 text-amber-400',   dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmed',  class: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  processing: { label: 'Processing', class: 'bg-blue-500/15 text-blue-400',    dot: 'bg-blue-400 animate-pulse' },
  shipped:    { label: 'Shipped',    class: 'bg-violet-500/15 text-violet-400', dot: 'bg-violet-400' },
  delivered:  { label: 'Delivered',  class: 'bg-teal-500/15 text-teal-400',    dot: 'bg-teal-400' },
  cancelled:  { label: 'Cancelled',  class: 'bg-slate-600/30 text-gray-500',   dot: 'bg-gray-500' },
}

const config = computed(() => STATUS_MAP[props.status] ?? STATUS_MAP.pending)
</script>
