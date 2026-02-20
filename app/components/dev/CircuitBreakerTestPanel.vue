<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-1">
        <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Circuit Breaker Pattern
      </h3>
      <p class="text-xs text-gray-400">
        Prevents cascade failures by <span class="text-orange-400">fast-failing requests</span> when a downstream
        service is unhealthy. Automatically tests for recovery and restores traffic.
      </p>
    </div>

    <!-- State Machine Visual -->
    <div class="p-4 bg-slate-800/50 rounded-xl border"
      :class="{
        'border-emerald-500/30': status.state === 'closed',
        'border-red-500/40': status.state === 'open',
        'border-amber-500/30': status.state === 'half-open',
      }">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-white">Circuit State</h3>
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="{
              'bg-emerald-500': status.state === 'closed',
              'bg-red-500 animate-pulse': status.state === 'open',
              'bg-amber-500 animate-pulse': status.state === 'half-open',
            }"
          ></span>
          <span
            class="text-sm font-bold tracking-wider"
            :class="{
              'text-emerald-400': status.state === 'closed',
              'text-red-400': status.state === 'open',
              'text-amber-400': status.state === 'half-open',
            }"
          >{{ status.state?.toUpperCase() }}</span>
        </div>
      </div>

      <!-- State Diagram -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <!-- CLOSED -->
        <div
          class="flex-1 p-3 rounded-lg border text-center transition-all duration-300"
          :class="status.state === 'closed'
            ? 'bg-emerald-900/30 border-emerald-500/50 ring-2 ring-emerald-500/30'
            : 'bg-slate-900/30 border-slate-700/30 opacity-50'"
        >
          <div class="text-xs font-bold text-emerald-400 mb-1">CLOSED</div>
          <div class="text-[9px] text-gray-500">Calls pass through</div>
          <div class="text-[9px] text-gray-500">Failures counted</div>
        </div>

        <!-- Arrow CLOSED → OPEN -->
        <div class="shrink-0 text-center">
          <div class="text-[9px] text-red-400 mb-0.5">failures ≥ {{ status.config?.failureThreshold }}</div>
          <div class="text-red-500">→</div>
        </div>

        <!-- OPEN -->
        <div
          class="flex-1 p-3 rounded-lg border text-center transition-all duration-300"
          :class="status.state === 'open'
            ? 'bg-red-900/30 border-red-500/50 ring-2 ring-red-500/30'
            : 'bg-slate-900/30 border-slate-700/30 opacity-50'"
        >
          <div class="text-xs font-bold text-red-400 mb-1">OPEN</div>
          <div class="text-[9px] text-gray-500">Fast-fail all calls</div>
          <div v-if="status.state === 'open' && status.timeUntilHalfOpenMs !== undefined"
            class="text-[9px] text-red-400 mt-1 font-mono">
            {{ Math.ceil((status.timeUntilHalfOpenMs || 0) / 1000) }}s until probe
          </div>
          <div v-else class="text-[9px] text-gray-500">Wait {{ (status.config?.timeoutMs || 0) / 1000 }}s</div>
        </div>

        <!-- Arrow OPEN → HALF-OPEN -->
        <div class="shrink-0 text-center">
          <div class="text-[9px] text-amber-400 mb-0.5">timeout</div>
          <div class="text-amber-500">→</div>
        </div>

        <!-- HALF-OPEN -->
        <div
          class="flex-1 p-3 rounded-lg border text-center transition-all duration-300"
          :class="status.state === 'half-open'
            ? 'bg-amber-900/30 border-amber-500/50 ring-2 ring-amber-500/30'
            : 'bg-slate-900/30 border-slate-700/30 opacity-50'"
        >
          <div class="text-xs font-bold text-amber-400 mb-1">HALF-OPEN</div>
          <div class="text-[9px] text-gray-500">1 trial call</div>
          <div class="text-[9px] text-gray-500">Success → CLOSED</div>
          <div class="text-[9px] text-gray-500">Fail → OPEN</div>
        </div>

        <!-- Arrows back -->
        <div class="shrink-0 text-center space-y-1">
          <div class="text-[8px] text-emerald-400">success ↗</div>
          <div class="text-[8px] text-red-400">fail ↘</div>
        </div>
      </div>

      <!-- Failure counter bar -->
      <div v-if="status.state === 'closed'" class="mb-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] text-gray-500">Failure window</span>
          <span class="text-[10px]"
            :class="status.failures >= (status.config?.failureThreshold || 3) - 1 ? 'text-red-400' : 'text-gray-400'">
            {{ status.failures }} / {{ status.config?.failureThreshold }}
          </span>
        </div>
        <div class="w-full bg-slate-700/50 rounded-full h-1.5">
          <div
            class="h-1.5 rounded-full transition-all duration-300"
            :class="status.failures >= (status.config?.failureThreshold || 3)
              ? 'bg-red-500'
              : status.failures >= (status.config?.failureThreshold || 3) - 1
              ? 'bg-amber-500'
              : 'bg-emerald-500'"
            :style="{ width: `${Math.min(100, ((status.failures || 0) / (status.config?.failureThreshold || 3)) * 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Controls Row -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Downstream Service -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <h3 class="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          Downstream Service
          <span class="text-[9px] px-1.5 py-0.5 rounded font-medium"
            :class="status.serviceDown ? 'bg-red-600/20 text-red-300 animate-pulse' : 'bg-emerald-600/20 text-emerald-300'">
            {{ status.serviceDown ? 'DOWN' : 'UP' }}
          </span>
        </h3>
        <p class="text-[10px] text-gray-400 mb-3">Simulates a payment API going down to trigger circuit opening.</p>
        <div class="flex gap-2">
          <button @click="serviceDown" :disabled="status.serviceDown"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Take Down
          </button>
          <button @click="serviceUp" :disabled="!status.serviceDown"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Restore
          </button>
        </div>
      </div>

      <!-- Manual Overrides -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <h3 class="text-sm font-semibold text-white mb-2">Manual Overrides</h3>
        <p class="text-[10px] text-gray-400 mb-3">Force circuit state for demo purposes.</p>
        <div class="flex gap-2">
          <button @click="resetCircuit"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors">
            Reset → CLOSED
          </button>
          <button @click="tripCircuit"
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors">
            Trip → OPEN
          </button>
        </div>
      </div>
    </div>

    <!-- Config -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Configuration</h3>
      <div class="grid grid-cols-4 gap-3">
        <div>
          <label class="block text-[10px] text-gray-400 mb-1">Failure Threshold</label>
          <input v-model.number="config.failureThreshold" type="number" min="1" max="20"
            @change="applyConfig"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
          <p class="text-[9px] text-gray-600 mt-0.5">failures to trip</p>
        </div>
        <div>
          <label class="block text-[10px] text-gray-400 mb-1">Window (ms)</label>
          <input v-model.number="config.windowMs" type="number" min="1000" step="1000"
            @change="applyConfig"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
          <p class="text-[9px] text-gray-600 mt-0.5">count window</p>
        </div>
        <div>
          <label class="block text-[10px] text-gray-400 mb-1">Timeout (ms)</label>
          <input v-model.number="config.timeoutMs" type="number" min="1000" step="1000"
            @change="applyConfig"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
          <p class="text-[9px] text-gray-600 mt-0.5">OPEN → HALF-OPEN</p>
        </div>
        <div>
          <label class="block text-[10px] text-gray-400 mb-1">Latency (ms)</label>
          <input v-model.number="config.serviceLatencyMs" type="number" min="0" max="5000" step="100"
            @change="applyConfig"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
          <p class="text-[9px] text-gray-600 mt-0.5">simulated delay</p>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="config.fallbackEnabled" @change="applyConfig"
            class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-orange-500" />
          <span class="text-xs text-gray-300">Fallback enabled (return cached response when OPEN instead of error)</span>
        </label>
      </div>
    </div>

    <!-- Send Calls -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Send Requests to Payment API</h3>
      <div class="flex gap-2">
        <button @click="sendOne" :disabled="sending"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-40">
          Send 1
        </button>
        <button @click="sendBatch(5)" :disabled="sending"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-40">
          Send 5 Rapid
        </button>
        <button @click="sendBatch(10)" :disabled="sending"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-40">
          Send 10 Rapid
        </button>
        <div v-if="sending" class="flex items-center gap-2 text-xs text-gray-400">
          <span class="animate-spin">⟳</span> Sending...
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-5 gap-3">
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total</p>
        <p class="text-lg font-bold text-white">{{ status.totalCalls }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-emerald-500/20 text-center">
        <p class="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">Success</p>
        <p class="text-lg font-bold text-emerald-400">{{ status.totalSuccess }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-red-500/20 text-center">
        <p class="text-[10px] text-red-500 uppercase tracking-wider mb-1">Failed</p>
        <p class="text-lg font-bold text-red-400">{{ status.totalFailure }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-amber-500/20 text-center">
        <p class="text-[10px] text-amber-500 uppercase tracking-wider mb-1">Rejected</p>
        <p class="text-lg font-bold text-amber-400">{{ status.totalRejected }}</p>
        <p class="text-[8px] text-gray-600">fast-failed</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-indigo-500/20 text-center">
        <p class="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Fallback</p>
        <p class="text-lg font-bold text-indigo-400">{{ status.totalFallback }}</p>
        <p class="text-[8px] text-gray-600">cached served</p>
      </div>
    </div>

    <!-- Call Log -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white">Call Log ({{ calls.length }})</h3>
        <div class="flex gap-3">
          <!-- Legend -->
          <div class="flex items-center gap-3 text-[9px]">
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>success</span>
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>failure</span>
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>rejected</span>
            <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>fallback</span>
          </div>
          <button @click="fetchStatus" class="text-xs text-cyan-400 hover:text-cyan-300">Refresh</button>
          <button v-if="calls.length > 0" @click="clearAll" class="text-xs text-red-400 hover:text-red-300">Clear</button>
        </div>
      </div>

      <!-- Mini bar chart -->
      <div v-if="calls.length > 0" class="flex items-end gap-px h-10 mb-3">
        <div
          v-for="(call, i) in [...calls].reverse().slice(0, 60)"
          :key="call.id"
          class="flex-1 min-w-[3px] max-w-[8px] rounded-t transition-all"
          :class="{
            'bg-emerald-500': call.outcome === 'success',
            'bg-red-500': call.outcome === 'failure',
            'bg-amber-500': call.outcome === 'rejected',
            'bg-indigo-500': call.outcome === 'fallback',
          }"
          :style="{ height: `${Math.max(20, Math.min(100, (call.durationMs / (status.config?.serviceLatencyMs || 300)) * 50))}%` }"
          :title="`${call.outcome} — ${call.durationMs}ms`"
        ></div>
      </div>

      <div v-if="calls.length === 0" class="text-center py-4">
        <p class="text-xs text-gray-500">No calls yet. Send some requests to see the circuit breaker in action.</p>
      </div>
      <div v-else class="space-y-1 max-h-60 overflow-y-auto">
        <div
          v-for="call in calls.slice(0, 30)"
          :key="call.id"
          class="flex items-center gap-2 p-2 rounded border text-[10px] transition-colors"
          :class="{
            'bg-emerald-900/10 border-emerald-500/15': call.outcome === 'success',
            'bg-red-900/10 border-red-500/15': call.outcome === 'failure',
            'bg-amber-900/10 border-amber-500/15': call.outcome === 'rejected',
            'bg-indigo-900/10 border-indigo-500/15': call.outcome === 'fallback',
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="{
              'bg-emerald-500': call.outcome === 'success',
              'bg-red-500': call.outcome === 'failure',
              'bg-amber-500': call.outcome === 'rejected',
              'bg-indigo-500': call.outcome === 'fallback',
            }"
          ></span>

          <!-- State badge -->
          <span class="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold shrink-0"
            :class="{
              'bg-emerald-700/30 text-emerald-400': call.state === 'closed',
              'bg-red-700/30 text-red-400': call.state === 'open',
              'bg-amber-700/30 text-amber-400': call.state === 'half-open',
            }">
            {{ call.state?.toUpperCase() }}
          </span>

          <!-- Outcome -->
          <span class="font-medium min-w-[60px]"
            :class="{
              'text-emerald-400': call.outcome === 'success',
              'text-red-400': call.outcome === 'failure',
              'text-amber-400': call.outcome === 'rejected',
              'text-indigo-400': call.outcome === 'fallback',
            }">
            {{ call.outcome }}
          </span>

          <!-- Duration -->
          <span class="text-gray-500 font-mono min-w-[45px]">{{ call.durationMs }}ms</span>

          <!-- Message -->
          <span v-if="call.outcome === 'success'" class="text-gray-400 truncate">
            TXN {{ (call.response as any)?.transactionId }}
          </span>
          <span v-else-if="call.outcome === 'fallback'" class="text-indigo-400/70 truncate">
            cached response served
          </span>
          <span v-else-if="call.error" class="text-red-400/70 truncate">{{ call.error }}</span>

          <!-- Time -->
          <span class="text-gray-600 ml-auto shrink-0">{{ formatTime(call.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const status = ref<any>({
  state: 'closed',
  failures: 0,
  serviceDown: false,
  totalCalls: 0,
  totalSuccess: 0,
  totalFailure: 0,
  totalRejected: 0,
  totalFallback: 0,
  config: {
    failureThreshold: 3,
    windowMs: 10000,
    timeoutMs: 15000,
    serviceLatencyMs: 300,
    fallbackEnabled: true,
  },
})
const calls = ref<any[]>([])
const sending = ref(false)
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)

const config = ref({
  failureThreshold: 3,
  windowMs: 10000,
  timeoutMs: 15000,
  serviceLatencyMs: 300,
  fallbackEnabled: true,
})

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

async function fetchStatus() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/status`)
    if (res.ok) {
      const data = await res.json()
      status.value = data.status
      calls.value = data.calls
      // Sync config from server
      if (data.status.config) {
        config.value = { ...data.status.config }
      }
    }
  } catch {}
}

async function sendOne() {
  sending.value = true
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res.ok) await fetchStatus()
  } catch {
    toast.error('Request failed')
  } finally {
    sending.value = false
  }
}

async function sendBatch(count: number) {
  sending.value = true
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/call-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    })
    if (res.ok) {
      await fetchStatus()
      toast.success(`${count} requests sent`)
    }
  } catch {
    toast.error('Batch failed')
  } finally {
    sending.value = false
  }
}

async function serviceDown() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/service/down`, { method: 'POST' })
  status.value.serviceDown = true
  toast.error('Downstream service DOWN — calls will start failing')
}

async function serviceUp() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/service/up`, { method: 'POST' })
  status.value.serviceDown = false
  toast.success('Downstream service UP')
}

async function resetCircuit() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/reset`, { method: 'POST' })
  await fetchStatus()
  toast.success('Circuit reset to CLOSED')
}

async function tripCircuit() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/trip`, { method: 'POST' })
  await fetchStatus()
  toast.error('Circuit tripped to OPEN')
}

async function applyConfig() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.value),
  })
  await fetchStatus()
}

async function clearAll() {
  await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/cb/clear`, { method: 'POST' })
  calls.value = []
  await fetchStatus()
}

// Poll while circuit is open or half-open (state can change automatically)
function startPolling() {
  if (pollTimer.value) return
  pollTimer.value = setInterval(fetchStatus, 1000)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

// Auto-poll when circuit is non-closed (timeout countdown changes)
watch(() => status.value.state, (state) => {
  if (state === 'open' || state === 'half-open') {
    startPolling()
  } else {
    stopPolling()
  }
})

onMounted(async () => {
  await fetchStatus()
  if (status.value.state !== 'closed') startPolling()
})

onUnmounted(() => stopPolling())
</script>
