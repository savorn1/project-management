<template>
  <div class="space-y-4">

    <!-- Header bar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Live / Paused toggle -->
        <button
          @click="togglePolling"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="polling ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'bg-slate-700 text-gray-400 border border-slate-600'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="polling ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'"></span>
          {{ polling ? 'Live' : 'Paused' }}
        </button>
        <!-- Refresh interval -->
        <select
          v-model="intervalMs"
          @change="restartPolling"
          class="bg-slate-700/50 border border-slate-600 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option :value="1000">1s</option>
          <option :value="2000">2s</option>
          <option :value="5000">5s</option>
        </select>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <span v-if="lastUpdated">Updated {{ lastUpdated }}</span>
        <span v-if="error" class="text-red-400">{{ error }}</span>
      </div>
    </div>

    <!-- Server vitals -->
    <div class="grid grid-cols-4 gap-3">
      <div
        v-for="stat in vitals"
        :key="stat.label"
        class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40"
      >
        <p class="text-xs text-gray-500 mb-1">{{ stat.label }}</p>
        <p class="text-lg font-bold font-mono" :class="stat.color">{{ stat.value }}</p>
        <p v-if="stat.sub" class="text-xs text-gray-600 mt-0.5">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Message rate sparkline -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Messages / sec
        </h3>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-violet-400"></span>
            <span class="text-gray-400">IN</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-gray-400">OUT</span>
          </span>
        </div>
      </div>

      <!-- SVG sparkline -->
      <div class="relative h-20">
        <svg v-if="history.length > 1" class="w-full h-full" :viewBox="`0 0 ${history.length - 1} 40`" preserveAspectRatio="none">
          <!-- IN line -->
          <polyline
            :points="sparkPoints(history.map(h => h.inRate), 40)"
            fill="none"
            stroke="#a78bfa"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- OUT line -->
          <polyline
            :points="sparkPoints(history.map(h => h.outRate), 40)"
            fill="none"
            stroke="#34d399"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div v-else class="flex items-center justify-center h-full">
          <p class="text-xs text-gray-600">Collecting data...</p>
        </div>
      </div>

      <!-- Current rate labels -->
      <div class="flex justify-between mt-2 text-xs font-mono">
        <span class="text-violet-400">IN: {{ currentStats?.server?.inMsgsRate?.toFixed(1) ?? '0' }} msg/s</span>
        <span class="text-emerald-400">OUT: {{ currentStats?.server?.outMsgsRate?.toFixed(1) ?? '0' }} msg/s</span>
      </div>
    </div>

    <!-- Two-column: Connections + App Subscriptions -->
    <div class="grid grid-cols-2 gap-4">

      <!-- Active Connections -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          Connections ({{ currentStats?.connections?.total ?? 0 }})
        </h3>

        <div v-if="!currentStats?.connections?.clients?.length" class="py-4 text-center text-xs text-gray-600">
          No connections
        </div>
        <div v-else class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="client in currentStats.connections.clients"
            :key="client.id"
            class="p-2 bg-slate-900/50 rounded-lg border border-slate-700/30"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs text-white font-medium">{{ client.name }}</span>
              <span class="text-xs font-mono text-gray-500">{{ client.ip }}</span>
            </div>
            <div class="flex gap-3 mt-1 text-xs text-gray-500 font-mono">
              <span>subs: <span class="text-gray-300">{{ client.subs }}</span></span>
              <span>in: <span class="text-violet-400">{{ client.inMsgs }}</span></span>
              <span>out: <span class="text-emerald-400">{{ client.outMsgs }}</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- App Subscriptions -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          App Subscriptions ({{ currentStats?.appSubscriptions?.length ?? 0 }})
        </h3>

        <div v-if="!currentStats?.appSubscriptions?.length" class="py-4 text-center text-xs text-gray-600">
          No subscriptions
        </div>
        <div v-else class="space-y-1.5 max-h-48 overflow-y-auto">
          <div
            v-for="subject in currentStats.appSubscriptions"
            :key="subject"
            class="flex items-center gap-2 px-2 py-1.5 bg-slate-900/50 rounded-lg border border-slate-700/30"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"></span>
            <code class="text-xs text-violet-300 font-mono">{{ subject }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- All server-level subjects -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        All Server Subjects ({{ currentStats?.subscriptions?.total ?? 0 }})
      </h3>

      <div v-if="!currentStats?.subscriptions?.subjects?.length" class="py-4 text-center text-xs text-gray-600">
        No subjects registered
      </div>
      <div v-else class="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
        <div
          v-for="sub in currentStats.subscriptions.subjects"
          :key="sub.subject + sub.sid"
          class="flex items-center gap-2 px-2 py-1 bg-slate-900/50 rounded border border-slate-700/20"
        >
          <span class="w-1 h-1 rounded-full bg-yellow-400 flex-shrink-0"></span>
          <code class="text-xs text-yellow-300 font-mono truncate">{{ sub.subject }}</code>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase as string

// ── state ──────────────────────────────────────────────────────────────────
const polling    = ref(true)
const intervalMs = ref(2000)
const error      = ref<string | null>(null)
const lastUpdated = ref<string | null>(null)

interface Stats {
  server: {
    version: string
    uptime: string
    inMsgs: number
    outMsgs: number
    inBytes: number
    outBytes: number
    inMsgsRate: number
    outMsgsRate: number
    slowConsumers: number
    mem: number
    isConnected: boolean
  }
  connections: {
    total: number
    clients: Array<{ id: number; name: string; ip: string; subs: number; inMsgs: number; outMsgs: number }>
  }
  subscriptions: {
    total: number
    subjects: Array<{ subject: string; sid: string; client: number }>
  }
  appSubscriptions: string[]
}

const currentStats = ref<Stats | null>(null)

// Rate history for sparkline (last 60 data points)
const history = ref<Array<{ inRate: number; outRate: number }>>([])

// ── computed vitals cards ──────────────────────────────────────────────────
const vitals = computed(() => {
  const s = currentStats.value?.server
  return [
    {
      label: 'Status',
      value: s?.isConnected ? 'Online' : 'Offline',
      color: s?.isConnected ? 'text-emerald-400' : 'text-red-400',
      sub: s?.version ? `v${s.version}` : '',
    },
    {
      label: 'Total IN msgs',
      value: formatNum(s?.inMsgs ?? 0),
      color: 'text-violet-400',
      sub: `${s?.inMsgsRate?.toFixed(1) ?? 0} /s`,
    },
    {
      label: 'Total OUT msgs',
      value: formatNum(s?.outMsgs ?? 0),
      color: 'text-emerald-400',
      sub: `${s?.outMsgsRate?.toFixed(1) ?? 0} /s`,
    },
    {
      label: 'Memory',
      value: formatBytes(s?.mem ?? 0),
      color: 'text-blue-400',
      sub: `Uptime: ${s?.uptime ?? '—'}`,
    },
  ]
})

// ── polling ────────────────────────────────────────────────────────────────
let timer: ReturnType<typeof setInterval> | null = null

async function fetchStats() {
  try {
    const { tokens } = useAuth()
    const res = await fetch(`${apiBase}/admin/nats/monitor`, {
      headers: { Authorization: `Bearer ${tokens.value?.accessToken}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: Stats = await res.json()
    currentStats.value = data

    // Record for sparkline
    history.value.push({
      inRate:  data.server.inMsgsRate,
      outRate: data.server.outMsgsRate,
    })
    if (history.value.length > 60) history.value = history.value.slice(-60)

    error.value = null
    const now = new Date()
    lastUpdated.value = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
  } catch (err: any) {
    error.value = 'Cannot reach API'
  }
}

function startPolling() {
  fetchStats()
  timer = setInterval(fetchStats, intervalMs.value)
}

function stopPolling() {
  if (timer) { clearInterval(timer); timer = null }
}

function togglePolling() {
  polling.value = !polling.value
  polling.value ? startPolling() : stopPolling()
}

function restartPolling() {
  stopPolling()
  if (polling.value) startPolling()
}

onMounted(startPolling)
onUnmounted(stopPolling)

// ── sparkline helpers ──────────────────────────────────────────────────────
function sparkPoints(values: number[], height: number): string {
  if (values.length < 2) return ''
  const max = Math.max(...values, 1)
  return values
    .map((v, i) => `${i},${height - (v / max) * (height - 4)}`)
    .join(' ')
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatBytes(b: number): string {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  if (b >= 1024)        return `${(b / 1024).toFixed(1)} KB`
  return `${b} B`
}
</script>
