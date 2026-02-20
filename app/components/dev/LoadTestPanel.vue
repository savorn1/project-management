<template>
  <div class="space-y-4">
    <!-- Load Test Config Form -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Load Test Configuration
      </h3>

      <form @submit.prevent="startTest" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Number of Clients</label>
            <input
              v-model.number="config.numClients"
              type="number"
              min="1"
              max="5000"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Messages / Second</label>
            <input
              v-model.number="config.messagesPerSecond"
              type="number"
              min="0"
              max="1000"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Room Name</label>
            <input
              v-model="config.room"
              type="text"
              placeholder="load-test:default"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Duration (seconds)</label>
            <input
              v-model.number="config.durationSeconds"
              type="number"
              min="5"
              max="300"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Ramp-up (seconds)</label>
            <input
              v-model.number="config.rampUpSeconds"
              type="number"
              min="0"
              max="60"
              placeholder="Auto"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Transport Selector -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Message Transport</label>
          <div class="flex gap-2">
            <button
              type="button"
              @click="config.transport = 'redis'"
              class="flex-1 px-3 py-2 text-xs rounded-lg border transition-colors"
              :class="config.transport === 'redis' ? 'bg-red-600/20 border-red-500/40 text-red-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Redis Pub/Sub
            </button>
            <button
              type="button"
              @click="config.transport = 'nats'"
              class="flex-1 px-3 py-2 text-xs rounded-lg border transition-colors"
              :class="config.transport === 'nats' ? 'bg-violet-600/20 border-violet-500/40 text-violet-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              NATS Pub/Sub
            </button>
          </div>
        </div>

        <!-- Quick Presets -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Quick Presets</label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="applyPreset('small')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'small' ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Small Team (10 clients)
            </button>
            <button
              type="button"
              @click="applyPreset('medium')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'medium' ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Medium Org (100 clients)
            </button>
            <button
              type="button"
              @click="applyPreset('large')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'large' ? 'bg-amber-600/20 border-amber-500/40 text-amber-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Large Org (500 clients)
            </button>
            <button
              type="button"
              @click="applyPreset('enterprise')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'enterprise' ? 'bg-rose-600/20 border-rose-500/40 text-rose-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Enterprise (1000 clients)
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="loading || stats?.isRunning"
            class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Starting...' : 'Start Load Test' }}
          </button>
          <button
            type="button"
            @click="stopTest"
            :disabled="!stats?.isRunning"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
      </form>
    </div>

    <!-- Live Stats Dashboard -->
    <div v-if="stats" class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Live Statistics
        </h3>
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="stats.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'"
          ></div>
          <span class="text-xs" :class="stats.isRunning ? 'text-emerald-400' : 'text-gray-500'">
            {{ stats.isRunning ? 'Running' : 'Idle' }}
          </span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="stats.isRunning && stats.durationSeconds > 0" class="mb-4">
        <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{{ stats.elapsedSeconds }}s / {{ stats.durationSeconds }}s</span>
        </div>
        <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
            :style="{ width: `${Math.min(100, (stats.elapsedSeconds / stats.durationSeconds) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Connections -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Connections</p>
          <p class="text-lg font-bold text-white">
            {{ stats.connectedClients }}
            <span class="text-xs text-gray-500 font-normal">/ {{ stats.targetClients }}</span>
          </p>
        </div>

        <!-- Messages Sent -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Messages Sent</p>
          <p class="text-lg font-bold text-emerald-400">{{ formatNumber(stats.totalMessagesSent) }}</p>
        </div>

        <!-- Messages Received -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Messages Received</p>
          <p class="text-lg font-bold text-blue-400">{{ formatNumber(stats.totalMessagesReceived) }}</p>
        </div>

        <!-- Throughput -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Throughput</p>
          <p class="text-lg font-bold text-violet-400">{{ stats.messagesPerSecond }} <span class="text-xs font-normal">msg/s</span></p>
        </div>

        <!-- Avg Latency -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Latency</p>
          <p class="text-lg font-bold" :class="latencyColor(stats.avgLatencyMs)">
            {{ stats.avgLatencyMs }} <span class="text-xs font-normal">ms</span>
          </p>
        </div>

        <!-- Min / Max Latency -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Min / Max Latency</p>
          <p class="text-lg font-bold text-white">
            {{ stats.minLatencyMs }} <span class="text-xs text-gray-500 font-normal">/</span> {{ stats.maxLatencyMs }}
            <span class="text-xs font-normal text-gray-400">ms</span>
          </p>
        </div>

        <!-- P95 / P99 Latency -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">P95 / P99 Latency</p>
          <p class="text-lg font-bold text-amber-400">
            {{ stats.p95LatencyMs || 0 }} <span class="text-xs text-gray-500 font-normal">/</span> {{ stats.p99LatencyMs || 0 }}
            <span class="text-xs font-normal text-gray-400">ms</span>
          </p>
        </div>

        <!-- Errors -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Errors</p>
          <p class="text-lg font-bold" :class="stats.errors > 0 ? 'text-red-400' : 'text-gray-400'">
            {{ stats.errors }}
          </p>
        </div>

        <!-- Memory -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Server Memory</p>
          <p class="text-lg font-bold" :class="(stats.memoryUsageMB || 0) > 500 ? 'text-red-400' : 'text-cyan-400'">
            {{ stats.memoryUsageMB || 0 }} <span class="text-xs font-normal">MB</span>
          </p>
        </div>

        <!-- Room -->
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Room</p>
          <code class="text-sm text-indigo-400 font-mono">{{ stats.room || '-' }}</code>
        </div>
      </div>
    </div>

    <!-- CLI Command for Large Scale -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
      <h3 class="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Standalone CLI for 2000+ Clients
      </h3>
      <p class="text-xs text-gray-400 mb-3">
        For large-scale testing, run the standalone script from a <strong class="text-white">separate terminal</strong> to avoid sharing resources with the server:
      </p>
      <div class="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
        <p class="text-gray-500 mb-1"># From the api/ directory:</p>
        <p>npx ts-node scripts/load-test.ts \</p>
        <p class="pl-4">--clients {{ config.numClients > 2000 ? config.numClients : 5000 }} \</p>
        <p class="pl-4">--room {{ config.room }} \</p>
        <p class="pl-4">--mps {{ config.messagesPerSecond }} \</p>
        <p class="pl-4">--duration {{ config.durationSeconds }} \</p>
        <p class="pl-4">--servers http://localhost:3000</p>
        <p class="text-gray-500 mt-2"># Multi-server (load balanced):</p>
        <p>npx ts-node scripts/load-test.ts \</p>
        <p class="pl-4">--clients 10000 \</p>
        <p class="pl-4">--servers http://server1:3000,http://server2:3000 \</p>
        <p class="pl-4">--ramp 10</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const loading = ref(false)
const activePreset = ref('')
const statsPolling = ref<ReturnType<typeof setInterval> | null>(null)

const config = ref({
  numClients: 10,
  room: 'load-test:default',
  messagesPerSecond: 10,
  durationSeconds: 30,
  rampUpSeconds: undefined as number | undefined,
  transport: 'redis' as 'redis' | 'nats',
})

const stats = ref<{
  isRunning: boolean
  connectedClients: number
  targetClients: number
  totalMessagesSent: number
  totalMessagesReceived: number
  avgLatencyMs: number
  maxLatencyMs: number
  minLatencyMs: number
  p95LatencyMs: number
  p99LatencyMs: number
  messagesPerSecond: number
  elapsedSeconds: number
  durationSeconds: number
  errors: number
  room: string
  serverUrls: string[]
  memoryUsageMB: number
} | null>(null)

const presets = {
  small: { numClients: 10, messagesPerSecond: 5, durationSeconds: 30 },
  medium: { numClients: 100, messagesPerSecond: 50, durationSeconds: 60 },
  large: { numClients: 500, messagesPerSecond: 100, durationSeconds: 60 },
  enterprise: { numClients: 1000, messagesPerSecond: 200, durationSeconds: 120 },
}

function applyPreset(name: keyof typeof presets) {
  activePreset.value = name
  Object.assign(config.value, presets[name])
}

async function startTest() {
  loading.value = true
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/load-test/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value),
    })

    if (response.ok) {
      const data = await response.json()
      toast.success(data.message)
      startPolling()
    } else {
      toast.error('Failed to start load test')
    }
  } catch {
    toast.error('Error starting load test')
  } finally {
    loading.value = false
  }
}

async function stopTest() {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/load-test/stop`, {
      method: 'POST',
    })

    if (response.ok) {
      const data = await response.json()
      stats.value = data.stats
      toast.info('Load test stopped')
      stopPolling()
    }
  } catch {
    toast.error('Error stopping load test')
  }
}

async function fetchStats() {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/load-test/stats`)
    if (response.ok) {
      stats.value = await response.json()

      // Auto-stop polling when test finishes
      if (stats.value && !stats.value.isRunning && statsPolling.value) {
        stopPolling()
      }
    }
  } catch {
    // Silently fail for polling
  }
}

function startPolling() {
  stopPolling()
  fetchStats()
  statsPolling.value = setInterval(fetchStats, 1000)
}

function stopPolling() {
  if (statsPolling.value) {
    clearInterval(statsPolling.value)
    statsPolling.value = null
  }
}

function latencyColor(ms: number): string {
  if (ms < 50) return 'text-emerald-400'
  if (ms < 100) return 'text-yellow-400'
  if (ms < 200) return 'text-amber-400'
  return 'text-red-400'
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

onMounted(() => {
  // Check if a test is already running
  fetchStats()
})

onUnmounted(() => {
  stopPolling()
})
</script>
