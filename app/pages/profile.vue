<template>
  <div class="max-w-4xl mx-auto space-y-5">

    <!-- Profile Header Card -->
    <BaseCard class="p-0 overflow-hidden">
      <!-- Cover banner -->
      <div class="h-52 relative">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900/70 to-slate-900"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div class="absolute top-6 right-10 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -top-2 right-32 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>
        <img v-if="profile?.coverImage" :src="profile.coverImage" alt="Cover" class="absolute inset-0 w-full h-full object-cover" />
        <!-- Bottom fade -->
        <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      </div>

      <!-- Avatar + info -->
      <div class="px-7 pb-7">
        <div class="flex items-end gap-5 -mt-14 mb-5">
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <div class="w-28 h-28 rounded-2xl shadow-2xl ring-4 ring-slate-900 overflow-hidden">
              <img v-if="profile?.avatar" :src="profile.avatar" alt="Avatar" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {{ userInitials || 'U' }}
              </div>
            </div>
            <div v-if="profile?.isActive" class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></div>
          </div>

          <!-- Name & role -->
          <div class="pb-1 flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-2xl font-bold text-white leading-tight">{{ profile?.name || '—' }}</h2>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ring-1"
                :class="profile?.role === 'super_admin'
                  ? 'bg-purple-500/15 text-purple-300 ring-purple-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'"
              >{{ profile?.role?.replace('_', ' ') }}</span>
            </div>
            <p class="text-sm text-slate-400 mt-0.5 truncate">{{ profile?.email }}</p>
          </div>

          <!-- Rank pill (top right) -->
          <div class="pb-1 hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl ring-1 flex-shrink-0" :class="[rankColor.bg, rankColor.ring]">
            <svg class="w-5 h-5 flex-shrink-0" :class="rankColor.icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span class="text-sm font-bold" :class="rankColor.icon">{{ rank.label }}</span>
            <span class="text-xs opacity-60" :class="rankColor.icon">{{ displayPoints }} pts</span>
          </div>
        </div>

        <!-- Status badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ring-1"
            :class="profile?.isActive
              ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
              : 'bg-slate-700/50 text-slate-400 ring-slate-600/30'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="profile?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'"></span>
            {{ profile?.isActive ? 'Active' : 'Inactive' }}
          </span>
          <span
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ring-1"
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
          <span v-if="profile?.lastLogin" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-400 ring-1 ring-slate-700/40">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last login {{ formatRelativeTime(profile.lastLogin) }}
          </span>
        </div>
      </div>
    </BaseCard>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Points -->
      <BaseCard class="relative overflow-hidden py-7 px-5 text-center group cursor-default">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b" :class="rankColor.hoverGradient"></div>
        <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110" :class="rankColor.bg">
          <svg class="w-7 h-7" :class="rankColor.icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div class="text-4xl font-bold text-white tabular-nums mb-1 relative">{{ displayPoints }}</div>
        <div class="text-xs text-slate-400 font-medium mb-3 relative">Total Points</div>
        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold relative" :class="rankColor.badge">
          {{ rank.label }}
        </span>
      </BaseCard>

      <!-- Completed tasks -->
      <BaseCard class="relative overflow-hidden py-7 px-5 text-center group cursor-default">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
        <div class="w-14 h-14 rounded-2xl mx-auto bg-emerald-500/10 flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:bg-emerald-500/15 relative">
          <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="text-4xl font-bold text-white tabular-nums mb-1 relative">{{ doneTasks }}</div>
        <div class="text-xs text-slate-400 font-medium mb-3 relative">Completed Tasks</div>
        <span v-if="totalTasks > 0" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 relative">
          {{ Math.round((doneTasks / totalTasks) * 100) }}% completion rate
        </span>
        <span v-else class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-500 relative">No tasks yet</span>
      </BaseCard>

      <!-- Assigned tasks -->
      <BaseCard class="relative overflow-hidden py-7 px-5 text-center group cursor-default">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
        <div class="w-14 h-14 rounded-2xl mx-auto bg-blue-500/10 flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:bg-blue-500/15 relative">
          <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="text-4xl font-bold text-white tabular-nums mb-1 relative">{{ totalTasks }}</div>
        <div class="text-xs text-slate-400 font-medium mb-3 relative">Assigned Tasks</div>
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 relative">
          {{ totalTasks - doneTasks }} remaining
        </span>
      </BaseCard>
    </div>

    <!-- Rank Journey -->
    <BaseCard>
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-sm font-semibold text-white">Rank Journey</h3>
          <p class="text-xs text-slate-500 mt-0.5">Complete tasks to earn points and level up</p>
        </div>
        <div v-if="rank.next" class="text-right">
          <p class="text-xs text-slate-500">Next rank</p>
          <p class="text-sm font-semibold text-white mt-0.5">
            <span :class="rankColor.icon">{{ rank.next.threshold - displayPoints }}</span>
            <span class="text-slate-400"> pts to go</span>
          </p>
        </div>
        <div v-else class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 ring-1 ring-yellow-500/20">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3l1.5 3H2l3 2.5-1.5 4 4-2.5 4 2.5-1.5-4L14 6H9.5L8 3H5zM19 3l-1 2.5H15l3 2-1 3.5 2.5-1.5 2.5 1.5-1-3.5 3-2h-3L19 3z" />
          </svg>
          <span class="text-xs font-semibold text-yellow-300">Max rank!</span>
        </div>
      </div>

      <!-- Rank ladder nodes -->
      <div class="flex items-center gap-0 mb-6">
        <template v-for="(r, i) in RANKS" :key="r.label">
          <!-- Progress line between nodes -->
          <div v-if="i > 0" class="flex-1 h-1 rounded-full transition-all duration-700"
            :class="displayPoints >= r.threshold ? rankBarForColor(r.color) : 'bg-slate-700/60'">
          </div>
          <!-- Rank node -->
          <div class="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center ring-2 transition-all duration-300"
              :class="displayPoints >= r.threshold
                ? [rankBgForColor(r.color), rankRingForColor(r.color), 'shadow-lg']
                : 'bg-slate-800/80 ring-slate-700/50'"
            >
              <svg class="w-5 h-5 transition-colors duration-300"
                :class="displayPoints >= r.threshold ? rankIconForColor(r.color) : 'text-slate-600'"
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="text-[11px] font-semibold transition-colors duration-300"
              :class="displayPoints >= r.threshold ? rankIconForColor(r.color) : 'text-slate-600'">
              {{ r.label }}
            </span>
            <span class="text-[10px] text-slate-600">{{ r.threshold }}+ pts</span>
          </div>
        </template>
      </div>

      <!-- Progress bar for current rank -->
      <div v-if="rank.next" class="space-y-2">
        <div class="flex justify-between text-xs text-slate-500">
          <span>{{ rank.label }} · {{ rank.threshold }} pts</span>
          <span>{{ rank.next.label }} · {{ rank.next.threshold }} pts</span>
        </div>
        <div class="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden ring-1 ring-slate-700/30">
          <div
            class="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            :class="rankColor.bar"
            :style="{ width: `${rankProgress}%` }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-full animate-none"></div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-slate-500">{{ displayPoints }} / {{ rank.next.threshold }} pts</span>
          <span class="text-xs font-semibold" :class="rankColor.icon">{{ rankProgress }}%</span>
        </div>
      </div>

      <!-- Max rank achieved -->
      <div v-else class="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 ring-1 ring-yellow-500/15">
        <div class="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3l1.5 3H2l3 2.5-1.5 4 4-2.5 4 2.5-1.5-4L14 6H9.5L8 3H5zM19 3l-1 2.5H15l3 2-1 3.5 2.5-1.5 2.5 1.5-1-3.5 3-2h-3L19 3z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-yellow-300">Platinum rank achieved!</p>
          <p class="text-xs text-slate-400 mt-0.5">You've reached the highest rank. Keep earning points!</p>
        </div>
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
    case 'silver':   return { bg: 'bg-slate-400/15',  icon: 'text-slate-300',  badge: 'bg-slate-400/15 text-slate-300',  bar: 'bg-gradient-to-r from-slate-400 to-slate-300',   ring: 'ring-slate-500/20', hoverGradient: 'from-slate-400/5 to-transparent'  }
    case 'gold':     return { bg: 'bg-yellow-500/15', icon: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-300', bar: 'bg-gradient-to-r from-yellow-500 to-amber-400',   ring: 'ring-yellow-500/20', hoverGradient: 'from-yellow-500/5 to-transparent' }
    case 'platinum': return { bg: 'bg-cyan-400/15',   icon: 'text-cyan-300',   badge: 'bg-cyan-400/15 text-cyan-300',    bar: 'bg-gradient-to-r from-cyan-400 to-blue-400',      ring: 'ring-cyan-400/20',   hoverGradient: 'from-cyan-400/5 to-transparent'   }
    default:         return { bg: 'bg-amber-700/20',  icon: 'text-amber-600',  badge: 'bg-amber-700/15 text-amber-500',  bar: 'bg-gradient-to-r from-amber-700 to-amber-600',   ring: 'ring-amber-700/20',  hoverGradient: 'from-amber-700/5 to-transparent'  }
  }
})

function rankBgForColor(color: string) {
  switch (color) {
    case 'silver':   return 'bg-slate-400/15'
    case 'gold':     return 'bg-yellow-500/15'
    case 'platinum': return 'bg-cyan-400/15'
    default:         return 'bg-amber-700/20'
  }
}
function rankRingForColor(color: string) {
  switch (color) {
    case 'silver':   return 'ring-slate-400/40'
    case 'gold':     return 'ring-yellow-500/40'
    case 'platinum': return 'ring-cyan-400/40'
    default:         return 'ring-amber-600/40'
  }
}
function rankIconForColor(color: string) {
  switch (color) {
    case 'silver':   return 'text-slate-300'
    case 'gold':     return 'text-yellow-400'
    case 'platinum': return 'text-cyan-300'
    default:         return 'text-amber-600'
  }
}
function rankBarForColor(color: string) {
  switch (color) {
    case 'silver':   return 'bg-gradient-to-r from-slate-400 to-slate-300'
    case 'gold':     return 'bg-gradient-to-r from-yellow-500 to-amber-400'
    case 'platinum': return 'bg-gradient-to-r from-cyan-400 to-blue-400'
    default:         return 'bg-gradient-to-r from-amber-700 to-amber-600'
  }
}

onMounted(async () => {
  const fresh = await getProfile()
  if (fresh) {
    profile.value = fresh
    displayPoints.value = fresh.points ?? 0
  }

  const tasks = await tasksApi.getMyTasks()
  totalTasks.value = tasks.length
  doneTasks.value = tasks.filter(t => t.status === 'done').length

  socket.on('points:earned', (data: { points: number; totalPoints: number }) => {
    displayPoints.value = data.totalPoints
  })
})

onUnmounted(() => {
  socket.off('points:earned')
})
</script>
