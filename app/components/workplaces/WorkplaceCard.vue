<template>
  <NuxtLink :to="`/workplaces/${workplace._id}`">
    <div class="group relative bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 rounded-2xl overflow-hidden transition-all duration-200 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/20">
      <!-- Top accent strip (plan-colored) -->
      <div class="h-0.5 w-full" :class="accentClass"></div>

      <!-- Card body -->
      <div class="px-5 pt-4 pb-4">
        <!-- Header row: avatar + name/slug + plan badge -->
        <div class="flex items-start gap-3.5">
          <!-- Gradient initials avatar -->
          <div
            :class="`w-11 h-11 rounded-xl bg-gradient-to-br ${workplaceGradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md`"
          >
            {{ getInitials(workplace.name) }}
          </div>

          <!-- Name + slug -->
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold truncate leading-snug">{{ workplace.name }}</h3>
            <p class="text-[11px] font-mono text-gray-500 mt-0.5 truncate">taskflow.io/{{ workplace.slug }}</p>
          </div>

          <!-- Plan badge -->
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize flex-shrink-0 mt-0.5"
            :class="planBadgeClass"
          >
            {{ workplace.plan }}
          </span>
        </div>

        <!-- Footer stats -->
        <div class="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-700/30">
          <div class="flex items-center gap-1.5 text-xs">
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="font-semibold text-gray-300">{{ projectCount }}</span>
            <span class="text-gray-500">projects</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-semibold text-gray-300">{{ memberCount }}</span>
            <span class="text-gray-500">members</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Workplace } from '~/types'

interface Props {
  workplace: Workplace
  projectCount?: number
  memberCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  projectCount: 0,
  memberCount: 0
})

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const workplaceGradient = computed(() => {
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ]
  const seed = (props.workplace.name.charCodeAt(0) || 0) + (props.workplace.name.charCodeAt(1) || 0)
  return gradients[seed % gradients.length]!
})

const accentClass = computed(() => {
  const map: Record<string, string> = {
    free: 'bg-gradient-to-r from-emerald-500/60 to-teal-500/60',
    pro: 'bg-gradient-to-r from-indigo-500/70 to-blue-500/70',
    enterprise: 'bg-gradient-to-r from-amber-500/70 to-orange-500/70',
  }
  return map[props.workplace.plan] || 'bg-slate-500/40'
})

const planBadgeClass = computed(() => {
  const map: Record<string, string> = {
    free: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    pro: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20',
    enterprise: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  }
  return map[props.workplace.plan] || 'bg-slate-600/30 text-gray-400'
})
</script>
