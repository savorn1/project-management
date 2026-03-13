<template>
  <div class="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden w-56 pointer-events-none">
    <!-- Top gradient strip -->
    <div class="h-8" :style="{ background: `${gradient}` }" />

    <!-- Avatar overlapping strip -->
    <div class="px-3 pb-3 -mt-5">
      <div class="flex items-end justify-between mb-2">
        <!-- Avatar -->
        <div class="relative">
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-slate-900"
            :style="{ background: gradient }"
          >
            {{ initials }}
          </div>
          <span
            class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900"
            :class="isOnline ? 'bg-emerald-400' : 'bg-slate-600'"
          />
        </div>
      </div>

      <!-- Name -->
      <p class="text-sm font-semibold text-white leading-tight truncate">{{ name }}</p>

      <!-- Custom status -->
      <p v-if="customStatus?.text" class="text-[11px] text-gray-400 mt-0.5 truncate">
        {{ customStatus.emoji }} {{ customStatus.text }}
      </p>

      <!-- Online / last seen -->
      <p v-else-if="isOnline" class="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Online
      </p>
      <p v-else class="text-[11px] text-gray-600 mt-0.5">{{ lastSeenText ?? 'Offline' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  isOnline: boolean
  /** Pre-formatted string from getLastSeen(), e.g. "Last seen 5m ago" */
  lastSeenText?: string
  customStatus?: { emoji: string; text: string } | null
}>()

const GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6d28d9)',
  'linear-gradient(135deg,#e11d48,#be185d)',
  'linear-gradient(135deg,#d97706,#b45309)',
  'linear-gradient(135deg,#059669,#0d9488)',
  'linear-gradient(135deg,#0284c7,#1d4ed8)',
  'linear-gradient(135deg,#c026d3,#9333ea)',
  'linear-gradient(135deg,#0891b2,#0ea5e9)',
  'linear-gradient(135deg,#65a30d,#16a34a)',
]

const gradient = computed(() => {
  let hash = 0
  for (const ch of props.name) hash = ((hash << 5) - hash) + ch.charCodeAt(0)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]!
})

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return props.name.charAt(0).toUpperCase()
})

</script>
