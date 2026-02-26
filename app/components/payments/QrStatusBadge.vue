<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    :class="cfg.classes"
  >
    <span>{{ cfg.icon }}</span>
    {{ cfg.label }}
  </span>
</template>

<script setup lang="ts">
import type { PaymentQrStatus } from '~/types'

const props = defineProps<{ status: PaymentQrStatus }>()

const MAP: Record<PaymentQrStatus, { icon: string; label: string; classes: string }> = {
  pending:   { icon: '⏳', label: 'Pending',   classes: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25' },
  paid:      { icon: '✅', label: 'Paid',      classes: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
  expired:   { icon: '⏰', label: 'Expired',   classes: 'bg-rose-500/15 text-rose-300 border border-rose-500/25' },
  cancelled: { icon: '🚫', label: 'Cancelled', classes: 'bg-slate-600/40 text-gray-400 border border-slate-600/40' },
}

const cfg = computed(() => MAP[props.status] ?? MAP.cancelled)
</script>
