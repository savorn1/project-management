<template>
  <div class="space-y-4">
    <!-- Spike Test Config -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Spike Test Configuration
      </h3>

      <!-- Visual Diagram -->
      <div class="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <div class="flex items-end gap-0.5 h-16 justify-center">
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-gray-500">{{ spikeForm.baseClients }}</span>
            <div class="w-14 bg-emerald-600/40 border border-emerald-500/30 rounded-t" :style="{ height: `${baseHeight}px` }"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-rose-400">{{ spikeForm.spikeClients }}</span>
            <div class="w-6 bg-rose-600/40 border border-rose-500/30 rounded-t" style="height: 48px"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-gray-500">{{ spikeForm.spikeClients }}</span>
            <div class="w-14 bg-rose-600/40 border border-rose-500/30 rounded-t" style="height: 48px"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-gray-500">&nbsp;</span>
            <div class="w-6 bg-amber-600/40 border border-amber-500/30 rounded-t" :style="{ height: `${baseHeight}px` }"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[9px] text-gray-500">{{ spikeForm.baseClients }}</span>
            <div class="w-14 bg-blue-600/40 border border-blue-500/30 rounded-t" :style="{ height: `${baseHeight}px` }"></div>
          </div>
        </div>
        <div class="flex gap-0.5 justify-center mt-1">
          <span class="w-14 text-center text-[8px] text-emerald-400">Base</span>
          <span class="w-6 text-center text-[8px] text-rose-400">Up</span>
          <span class="w-14 text-center text-[8px] text-rose-400">Hold</span>
          <span class="w-6 text-center text-[8px] text-amber-400">Dn</span>
          <span class="w-14 text-center text-[8px] text-blue-400">Recover</span>
        </div>
      </div>

      <form @submit.prevent="startSpikeTest" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Base Clients (normal)</label>
            <input
              v-model.number="spikeForm.baseClients"
              type="number"
              min="1"
              max="500"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Spike Clients (burst)</label>
            <input
              v-model.number="spikeForm.spikeClients"
              type="number"
              min="10"
              max="2000"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Base Duration (s)</label>
            <input
              v-model.number="spikeForm.baseSeconds"
              type="number"
              min="5"
              max="60"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Hold Duration (s)</label>
            <input
              v-model.number="spikeForm.spikeSeconds"
              type="number"
              min="5"
              max="120"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Recovery (s)</label>
            <input
              v-model.number="spikeForm.recoverySeconds"
              type="number"
              min="5"
              max="60"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Room</label>
            <input
              v-model="spikeForm.room"
              type="text"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Messages / Second</label>
            <input
              v-model.number="spikeForm.messagesPerSecond"
              type="number"
              min="1"
              max="500"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Quick Presets -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Quick Presets</label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="applyPreset('gentle')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'gentle' ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Gentle (50 → 200)
            </button>
            <button
              type="button"
              @click="applyPreset('moderate')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'moderate' ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Moderate (50 → 500)
            </button>
            <button
              type="button"
              @click="applyPreset('aggressive')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'aggressive' ? 'bg-amber-600/20 border-amber-500/40 text-amber-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Aggressive (50 → 1000)
            </button>
            <button
              type="button"
              @click="applyPreset('extreme')"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="activePreset === 'extreme' ? 'bg-rose-600/20 border-rose-500/40 text-rose-300' : 'bg-slate-700/30 border-slate-600/50 text-gray-400 hover:text-white hover:border-slate-500'"
            >
              Extreme (20 → 2000)
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="loading || (stats?.isRunning && !!stats?.spikePhase)"
            class="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Starting...' : 'Start Spike Test' }}
          </button>
          <button
            type="button"
            @click="stopTest"
            :disabled="!stats?.isRunning"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
      </form>
    </div>

    <!-- Live Phase Indicator -->
    <div v-if="stats?.spikePhase" class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <div class="w-2 h-2 rounded-full animate-pulse" :class="phaseColor(stats.spikePhase)"></div>
          Phase: {{ stats.spikePhase.toUpperCase() }}
        </h3>
        <span class="text-xs text-gray-400">
          {{ stats.spikePhaseElapsed }}s elapsed
        </span>
      </div>

      <!-- Phase Progress Bar -->
      <div class="flex gap-1 mb-4">
        <div
          v-for="phase in phases"
          :key="phase"
          class="flex-1 h-2 rounded-full transition-all duration-500"
          :class="phaseBarClass(phase)"
        ></div>
      </div>

      <!-- Live Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Connections</p>
          <p class="text-lg font-bold text-white">
            {{ stats.connectedClients }}
            <span class="text-xs text-gray-500 font-normal">/ {{ stats.targetClients }}</span>
          </p>
        </div>
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Avg Latency</p>
          <p class="text-lg font-bold" :class="latencyColor(stats.avgLatencyMs)">
            {{ stats.avgLatencyMs }} <span class="text-xs font-normal">ms</span>
          </p>
        </div>
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Throughput</p>
          <p class="text-lg font-bold text-violet-400">{{ stats.messagesPerSecond }} <span class="text-xs font-normal">msg/s</span></p>
        </div>
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Errors</p>
          <p class="text-lg font-bold" :class="stats.errors > 0 ? 'text-red-400' : 'text-gray-400'">{{ stats.errors }}</p>
        </div>
      </div>
    </div>

    <!-- Phase Results Table -->
    <div v-if="stats?.phaseStats && stats.phaseStats.length > 0" class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Phase Results
      </h3>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-gray-500 uppercase tracking-wider border-b border-slate-700/50">
              <th class="text-left py-2 pr-3">Phase</th>
              <th class="text-right py-2 px-3">Clients</th>
              <th class="text-right py-2 px-3">Avg Latency</th>
              <th class="text-right py-2 px-3">P95 Latency</th>
              <th class="text-right py-2 px-3">Errors</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="phase in stats.phaseStats"
              :key="phase.phase"
              class="border-b border-slate-700/20"
            >
              <td class="py-2 pr-3">
                <span class="inline-flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full" :class="phaseColor(phase.phase)"></div>
                  <span class="font-medium text-white capitalize">{{ phase.phase }}</span>
                </span>
              </td>
              <td class="text-right py-2 px-3 text-gray-300 font-mono">{{ phase.clients }}</td>
              <td class="text-right py-2 px-3 font-mono" :class="latencyColor(phase.avgLatencyMs)">{{ phase.avgLatencyMs }}ms</td>
              <td class="text-right py-2 px-3 font-mono" :class="latencyColor(phase.p95LatencyMs)">{{ phase.p95LatencyMs }}ms</td>
              <td class="text-right py-2 px-3 font-mono" :class="phase.errors > 0 ? 'text-red-400' : 'text-gray-400'">{{ phase.errors }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recovery Analysis -->
      <div v-if="recoveryAnalysis" class="mt-3 p-3 rounded-lg border" :class="recoveryAnalysis.recovered ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'">
        <p class="text-xs font-semibold" :class="recoveryAnalysis.recovered ? 'text-emerald-400' : 'text-red-400'">
          {{ recoveryAnalysis.recovered ? 'System recovered successfully' : 'System did NOT fully recover' }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Base latency: {{ recoveryAnalysis.baseLatency }}ms →
          Spike latency: {{ recoveryAnalysis.spikeLatency }}ms ({{ recoveryAnalysis.spikeIncrease }}x) →
          Recovery latency: {{ recoveryAnalysis.recoveryLatency }}ms
        </p>
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

const phases: Array<'base' | 'spike' | 'hold' | 'drop' | 'recovery'> = ['base', 'spike', 'hold', 'drop', 'recovery']

const spikeForm = ref({
  room: 'spike-test:default',
  messagesPerSecond: 50,
  baseClients: 50,
  spikeClients: 500,
  baseSeconds: 10,
  spikeSeconds: 15,
  recoverySeconds: 10,
})

const stats = ref<any>(null)

const baseHeight = computed(() => {
  const ratio = spikeForm.value.baseClients / spikeForm.value.spikeClients
  return Math.max(8, Math.round(ratio * 48))
})

const recoveryAnalysis = computed(() => {
  const ps = stats.value?.phaseStats
  if (!ps || ps.length < 3) return null

  const base = ps.find((p: any) => p.phase === 'base')
  const hold = ps.find((p: any) => p.phase === 'hold')
  const recovery = ps.find((p: any) => p.phase === 'recovery')

  if (!base || !hold || !recovery) return null

  const baseLatency = base.avgLatencyMs
  const spikeLatency = hold.avgLatencyMs
  const recoveryLatency = recovery.avgLatencyMs

  // Recovery threshold: latency within 2x of base
  const recovered = recoveryLatency <= baseLatency * 2 || recoveryLatency < 50

  return {
    recovered,
    baseLatency,
    spikeLatency,
    recoveryLatency,
    spikeIncrease: baseLatency > 0 ? Math.round((spikeLatency / baseLatency) * 10) / 10 : 0,
  }
})

const presets = {
  gentle:     { baseClients: 50,  spikeClients: 200,  baseSeconds: 10, spikeSeconds: 10, recoverySeconds: 10, messagesPerSecond: 20 },
  moderate:   { baseClients: 50,  spikeClients: 500,  baseSeconds: 10, spikeSeconds: 15, recoverySeconds: 10, messagesPerSecond: 50 },
  aggressive: { baseClients: 50,  spikeClients: 1000, baseSeconds: 10, spikeSeconds: 15, recoverySeconds: 15, messagesPerSecond: 100 },
  extreme:    { baseClients: 20,  spikeClients: 2000, baseSeconds: 10, spikeSeconds: 20, recoverySeconds: 15, messagesPerSecond: 200 },
}

function applyPreset(name: keyof typeof presets) {
  activePreset.value = name
  Object.assign(spikeForm.value, presets[name])
}

async function startSpikeTest() {
  loading.value = true
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/spike-test/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spikeForm.value),
    })

    if (response.ok) {
      toast.success('Spike test started!')
      startPolling()
    } else {
      const data = await response.json()
      toast.error(data.message || 'Failed to start spike test')
    }
  } catch {
    toast.error('Error starting spike test')
  } finally {
    loading.value = false
  }
}

async function stopTest() {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/spike-test/stop`, {
      method: 'POST',
    })

    if (response.ok) {
      toast.info('Spike test stopped')
      stopPolling()
      // Fetch final stats
      await fetchStats()
    }
  } catch {
    toast.error('Error stopping spike test')
  }
}

async function fetchStats() {
  try {
    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/load-test/stats`)
    if (response.ok) {
      stats.value = await response.json()

      if (stats.value && !stats.value.isRunning && stats.value.spikePhase !== 'done' && statsPolling.value) {
        stopPolling()
      }
    }
  } catch {
    // Silently fail
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

function phaseColor(phase: string): string {
  const map: Record<string, string> = {
    base: 'bg-emerald-500',
    spike: 'bg-rose-500',
    hold: 'bg-rose-500',
    drop: 'bg-amber-500',
    recovery: 'bg-blue-500',
    done: 'bg-gray-500',
  }
  return map[phase] || 'bg-gray-500'
}

function phaseBarClass(phase: string): string {
  if (!stats.value?.spikePhase) return 'bg-slate-700/50'

  const order = ['base', 'spike', 'hold', 'drop', 'recovery', 'done']
  const currentIdx = order.indexOf(stats.value.spikePhase)
  const phaseIdx = order.indexOf(phase)

  if (phaseIdx < currentIdx) {
    return `${phaseColor(phase)} opacity-60`
  }
  if (phaseIdx === currentIdx) {
    return `${phaseColor(phase)} animate-pulse`
  }
  return 'bg-slate-700/50'
}

function latencyColor(ms: number): string {
  if (ms < 50) return 'text-emerald-400'
  if (ms < 100) return 'text-yellow-400'
  if (ms < 200) return 'text-amber-400'
  return 'text-red-400'
}

onMounted(() => {
  fetchStats()
})

onUnmounted(() => {
  stopPolling()
})
</script>
