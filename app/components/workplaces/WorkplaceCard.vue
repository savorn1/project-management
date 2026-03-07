<template>
  <NuxtLink :to="`/workplaces/${workplace._id}`">
    <BaseCard noPadding class="overflow-hidden hover:border-indigo-500/40 transition-all duration-200 cursor-pointer group">

      <!-- Cover Area -->
      <div class="relative h-24 overflow-hidden">
        <div
          v-if="workplace.coverImage"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          :style="{ backgroundImage: `url(${workplace.coverImage})` }"
        />
        <div
          v-else
          :class="`absolute inset-0 bg-gradient-to-br ${getCoverGradient(workplace.slug)} transition-transform duration-500 group-hover:scale-105`"
        />
        <!-- Scrim -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <!-- Action buttons (top-right, visible on hover) -->
        <div class="absolute top-2 right-2 flex items-center gap-1 transition-opacity duration-200"
          :class="isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
          <button
            @click.prevent.stop="copyLink"
            class="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
            title="Copy link"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            @click.prevent.stop="toggleFavorite"
            class="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all"
            :class="isFavorite ? 'text-amber-400 hover:bg-black/60' : 'text-white/70 hover:text-white hover:bg-black/60'"
            title="Favorite"
          >
            <svg class="w-3 h-3" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Avatar + Badges row (overlapping cover) -->
      <div class="relative px-4 -mt-6 flex items-end justify-between">
        <!-- Avatar -->
        <div
          :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${getWorkplaceGradient(workplace.name)} flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-slate-900 shrink-0`"
        >
          {{ initials }}
        </div>

        <!-- Plan + Status badges -->
        <div class="flex items-center gap-1.5 mb-1">
          <BaseBadge size="xs" variant="soft" :color="planBadgeColor">{{ formatPlan(workplace.plan) }}</BaseBadge>
          <BaseBadge size="xs" variant="soft" :color="workplace.status === 'active' ? 'emerald' : 'slate'">{{ formatStatus(workplace.status) }}</BaseBadge>
        </div>
      </div>

      <!-- Info Area -->
      <div class="px-4 pt-2.5 pb-3">
        <!-- Name & slug -->
        <div class="min-w-0">
          <h3 class="text-white font-semibold truncate leading-tight">{{ workplace.name }}</h3>
          <div class="flex items-center gap-1 mt-0.5">
            <svg class="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span class="text-[11px] font-mono text-gray-500 truncate">taskflow.io/{{ workplace.slug }}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <svg class="w-3.5 h-3.5 text-indigo-400/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-200 leading-none">{{ projectCount }}</div>
              <div class="text-[11px] text-gray-500 leading-none mt-0.5">projects</div>
            </div>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <svg class="w-3.5 h-3.5 text-indigo-400/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-200 leading-none">{{ memberCount }}</div>
              <div class="text-[11px] text-gray-500 leading-none mt-0.5">members</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
          <span class="text-[11px] text-gray-600">Created on {{ formatDate(workplace.createdAt) }}</span>
          <svg class="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Workplace } from '~/types';

interface Props {
  workplace: Workplace
  projectCount?: number
  memberCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  projectCount: 0,
  memberCount: 0
})

const isFavorite = ref(false)

const initials = computed(() => getInitials(props.workplace.name))

const planBadgeColor = computed(() => {
  const map: Record<string, 'emerald' | 'indigo' | 'amber' | 'slate'> = {
    free: 'emerald',
    pro: 'indigo',
    enterprise: 'amber',
  }
  return map[props.workplace.plan] || 'slate'
})

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getCoverGradient(seedStr: string): string {
  const gradients = [
    'from-blue-950 via-blue-900 to-sky-800',
    'from-violet-950 via-purple-900 to-indigo-800',
    'from-slate-900 via-slate-800 to-slate-700',
    'from-emerald-950 via-teal-900 to-cyan-800',
    'from-rose-950 via-rose-900 to-pink-800',
    'from-amber-950 via-orange-900 to-amber-800',
  ]
  return gradients[(seedStr.charCodeAt(0) || 0) % gradients.length]!
}

function getWorkplaceGradient(seedStr: string): string {
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ]
  const seed = (seedStr.charCodeAt(0) || 0) + (seedStr.charCodeAt(1) || 0)
  return gradients[seed % gradients.length]!
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    archived: 'Archived',
  }
  return map[status] || status
}

function formatPlan(plan: string): string {
  const map: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return map[plan] || plan
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/workplaces/${props.workplace._id}`)
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
}
</script>
