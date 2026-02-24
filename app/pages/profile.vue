<template>
  <div class="max-w-3xl mx-auto space-y-6">

    <!-- Profile Header Card -->
    <BaseCard class="p-0 overflow-hidden">
      <!-- Top gradient banner -->
      <div class="h-24 bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-slate-800/20"></div>

      <div class="px-6 pb-6">
        <!-- Avatar + name row -->
        <div class="flex items-end gap-4 -mt-10 mb-4">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-slate-900 flex-shrink-0">
            {{ userInitials || 'U' }}
          </div>
          <div class="pb-1">
            <h2 class="text-xl font-bold text-white">{{ profile?.name || '—' }}</h2>
            <p class="text-sm text-slate-400">{{ profile?.email }}</p>
          </div>
          <div class="ml-auto pb-1">
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold capitalize ring-1"
              :class="profile?.role === 'super_admin'
                ? 'bg-purple-500/15 text-purple-300 ring-purple-500/30'
                : 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'"
            >
              {{ profile?.role?.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <!-- Status badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1"
            :class="profile?.isActive
              ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
              : 'bg-slate-700/50 text-slate-400 ring-slate-600/30'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="profile?.isActive ? 'bg-emerald-400' : 'bg-slate-500'"></span>
            {{ profile?.isActive ? 'Active' : 'Inactive' }}
          </span>
          <span
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1"
            :class="profile?.isEmailVerified
              ? 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
              : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="profile?.isEmailVerified" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ profile?.isEmailVerified ? 'Email verified' : 'Email not verified' }}
          </span>
          <span v-if="profile?.lastLogin" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 ring-1 ring-slate-700/40">
            Last login {{ formatRelativeTime(profile.lastLogin) }}
          </span>
        </div>
      </div>
    </BaseCard>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Points card -->
      <BaseCard class="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-1" :class="rankColor.bg">
          <svg class="w-6 h-6" :class="rankColor.icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div class="text-3xl font-bold text-white tabular-nums">{{ displayPoints }}</div>
        <div class="text-xs text-slate-400 font-medium">Points</div>
        <div class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" :class="rankColor.badge">
          {{ rank.label }}
        </div>
      </BaseCard>

      <!-- Done tasks card -->
      <BaseCard class="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1">
          <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="text-3xl font-bold text-white tabular-nums">{{ doneTasks }}</div>
        <div class="text-xs text-slate-400 font-medium">Completed tasks</div>
      </BaseCard>

      <!-- Total tasks card -->
      <BaseCard class="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-1">
          <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="text-3xl font-bold text-white tabular-nums">{{ totalTasks }}</div>
        <div class="text-xs text-slate-400 font-medium">Assigned tasks</div>
      </BaseCard>
    </div>

    <!-- Points progress to next rank -->
    <BaseCard v-if="rank.next">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-sm font-medium text-white">Progress to {{ rank.next.label }}</p>
          <p class="text-xs text-slate-500 mt-0.5">{{ rank.next.threshold - displayPoints }} points needed</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="rank.next.badge">
          {{ rank.next.label }}
        </span>
      </div>
      <div class="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="rankColor.bar"
          :style="{ width: `${rankProgress}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-[11px] text-slate-600 mt-1.5">
        <span>{{ rank.threshold }} pts</span>
        <span>{{ rank.next.threshold }} pts</span>
      </div>
    </BaseCard>

    <!-- Rank achieved banner (max rank) -->
    <BaseCard v-else class="flex items-center gap-4 py-4">
      <div class="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3l1.5 3H2l3 2.5-1.5 4 4-2.5 4 2.5-1.5-4L14 6H9.5L8 3H5zM19 3l-1 2.5H15l3 2-1 3.5 2.5-1.5 2.5 1.5-1-3.5 3-2h-3L19 3z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-yellow-300">Max rank achieved!</p>
        <p class="text-xs text-slate-400">You've reached Platinum. Keep earning points!</p>
      </div>
    </BaseCard>

  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '~/utils/formatters'

const { user, userInitials, getProfile } = useAuth()
const { tasksApi } = useApi()
const socket = useSocket()

const profile = ref(user.value)
const totalTasks = ref(0)
const doneTasks = ref(0)
const displayPoints = ref(user.value?.points ?? 0)

// Ranks definition
const RANKS = [
  { label: 'Bronze',   threshold: 0,   next: { label: 'Silver',   threshold: 50,  badge: 'bg-slate-400/15 text-slate-300'  }, color: 'bronze'   },
  { label: 'Silver',   threshold: 50,  next: { label: 'Gold',     threshold: 150, badge: 'bg-yellow-500/15 text-yellow-300' }, color: 'silver'   },
  { label: 'Gold',     threshold: 150, next: { label: 'Platinum', threshold: 300, badge: 'bg-cyan-400/15 text-cyan-300'     }, color: 'gold'     },
  { label: 'Platinum', threshold: 300, next: null,                                                                             color: 'platinum' },
]

const rank = computed(() => {
  const pts = displayPoints.value
  return [...RANKS].reverse().find(r => pts >= r.threshold) ?? RANKS[0]!
})

const rankProgress = computed(() => {
  if (!rank.value.next) return 100
  const from = rank.value.threshold
  const to = rank.value.next.threshold
  return Math.min(100, Math.round(((displayPoints.value - from) / (to - from)) * 100))
})

const rankColor = computed(() => {
  switch (rank.value.color) {
    case 'silver':   return { bg: 'bg-slate-400/15',  icon: 'text-slate-300',  badge: 'bg-slate-400/15 text-slate-300',  bar: 'bg-gradient-to-r from-slate-400 to-slate-300'  }
    case 'gold':     return { bg: 'bg-yellow-500/15', icon: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-300', bar: 'bg-gradient-to-r from-yellow-500 to-amber-400'  }
    case 'platinum': return { bg: 'bg-cyan-400/15',   icon: 'text-cyan-300',   badge: 'bg-cyan-400/15 text-cyan-300',    bar: 'bg-gradient-to-r from-cyan-400 to-blue-400'     }
    default:         return { bg: 'bg-amber-700/20',  icon: 'text-amber-600',  badge: 'bg-amber-700/15 text-amber-500',  bar: 'bg-gradient-to-r from-amber-700 to-amber-600'   }
  }
})

onMounted(async () => {
  // Fetch fresh profile (includes latest points from DB)
  const fresh = await getProfile()
  if (fresh) {
    profile.value = fresh
    displayPoints.value = fresh.points ?? 0
  }

  // Load task stats
  const tasks = await tasksApi.getMyTasks()
  totalTasks.value = tasks.length
  doneTasks.value = tasks.filter(t => t.status === 'done').length

  // Listen for real-time points updates
  socket.on('points:earned', (data: { points: number; totalPoints: number }) => {
    displayPoints.value = data.totalPoints
  })
})

onUnmounted(() => {
  socket.off('points:earned')
})
</script>
