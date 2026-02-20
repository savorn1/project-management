<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">System Health</h1>
        <p class="text-gray-400 mt-1">Real-time status of all services and infrastructure</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-500">Last checked: {{ lastChecked }}</span>
        <div
          class="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2"
          :class="overallStatusClass"
        >
          <span class="w-2 h-2 rounded-full animate-pulse" :class="overallDotClass"></span>
          {{ overallStatus }}
        </div>
      </div>
    </div>

    <!-- Kubernetes Probes -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Liveness</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="probes.live ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'"
          >{{ probes.live ? 'OK' : 'FAIL' }}</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">Is the process alive?</div>
        <div class="text-xs text-gray-600 mt-0.5 font-mono">GET /health/live</div>
        <div class="text-xs text-gray-500 mt-2">Used by: <span class="text-gray-400">Kubernetes / Docker</span></div>
        <div class="text-xs text-gray-600">Action on fail: <span class="text-amber-400">restart container</span></div>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Readiness</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="probes.ready ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'"
          >{{ probes.ready ? 'OK' : 'FAIL' }}</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">Can it accept traffic?</div>
        <div class="text-xs text-gray-600 mt-0.5 font-mono">GET /health/ready</div>
        <div class="text-xs text-gray-500 mt-2">Checks: <span class="text-gray-400">MongoDB + Redis</span></div>
        <div class="text-xs text-gray-600">Action on fail: <span class="text-amber-400">remove from load balancer</span></div>
      </div>

      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Check</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="fullCheck.status === 'ok' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'"
          >{{ fullCheck.status === 'ok' ? 'OK' : fullCheck.status?.toUpperCase() ?? '—' }}</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">All services + memory + disk</div>
        <div class="text-xs text-gray-600 mt-0.5 font-mono">GET /health</div>
        <div class="text-xs text-gray-500 mt-2">Checks: <span class="text-gray-400">All 5 services + system</span></div>
        <div class="text-xs text-gray-600">Used by: <span class="text-amber-400">monitoring, alerts</span></div>
      </div>
    </div>

    <!-- Service Cards -->
    <div>
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Services</h2>
      <div class="grid grid-cols-5 gap-3">
        <div
          v-for="svc in serviceList"
          :key="svc.key"
          class="bg-slate-800/60 border rounded-xl p-4 transition-all duration-300"
          :class="svc.status === 'up'
            ? 'border-emerald-500/30 shadow-emerald-500/5 shadow-lg'
            : 'border-rose-500/30 shadow-rose-500/5 shadow-lg'"
        >
          <div class="flex items-start justify-between mb-3">
            <span class="text-2xl">{{ svc.icon }}</span>
            <span
              class="w-2.5 h-2.5 rounded-full mt-1"
              :class="svc.status === 'up' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"
            ></span>
          </div>
          <div class="text-sm font-semibold text-white">{{ svc.label }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ svc.role }}</div>
          <div
            class="text-xs font-medium mt-2"
            :class="svc.status === 'up' ? 'text-emerald-400' : 'text-rose-400'"
          >{{ svc.status === 'up' ? 'Connected' : svc.message || 'Disconnected' }}</div>

          <!-- Uptime strip (last 20 checks) -->
          <div class="flex gap-0.5 mt-3">
            <div
              v-for="(h, i) in svc.history"
              :key="i"
              class="flex-1 h-1.5 rounded-sm"
              :class="h ? 'bg-emerald-500' : 'bg-rose-500'"
              :title="h ? 'up' : 'down'"
            ></div>
          </div>
          <div class="text-xs text-gray-600 mt-1">{{ svc.uptimePct }}% uptime</div>
        </div>
      </div>
    </div>

    <!-- Memory & Disk -->
    <div>
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">System Resources</h2>
      <div class="grid grid-cols-2 gap-4">

        <!-- Memory -->
        <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🧠</span>
              <span class="text-sm font-semibold text-white">Memory</span>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="memoryStatus === 'ok' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'"
            >{{ memoryStatus === 'ok' ? 'Healthy' : 'Warning' }}</span>
          </div>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>Heap Used</span>
                <span>{{ fullCheck.details?.memory_heap?.status ?? '—' }}</span>
              </div>
              <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-violet-500 rounded-full transition-all" style="width: 45%"></div>
              </div>
              <div class="text-xs text-gray-600 mt-0.5">Limit: 300 MB</div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span>RSS Memory</span>
                <span>{{ fullCheck.details?.memory_rss?.status ?? '—' }}</span>
              </div>
              <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full transition-all" style="width: 35%"></div>
              </div>
              <div class="text-xs text-gray-600 mt-0.5">Limit: 500 MB</div>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-600 bg-slate-900/40 rounded p-2">
            Heap = JS objects in V8. RSS = total process memory (heap + native + stack).
          </div>
        </div>

        <!-- What each probe means -->
        <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">📖</span>
            <span class="text-sm font-semibold text-white">How Health Checks Work</span>
          </div>
          <div class="space-y-3 text-xs text-gray-400">
            <div class="bg-slate-900/50 rounded-lg p-3">
              <div class="font-semibold text-white mb-1">1. Liveness Probe</div>
              <div>Checks only memory. If the process is stuck (OOM, deadlock) → K8s restarts it.</div>
            </div>
            <div class="bg-slate-900/50 rounded-lg p-3">
              <div class="font-semibold text-white mb-1">2. Readiness Probe</div>
              <div>Checks MongoDB + Redis. If DB is not ready → traffic is held back until it recovers.</div>
            </div>
            <div class="bg-slate-900/50 rounded-lg p-3">
              <div class="font-semibold text-white mb-1">3. Full Health Check</div>
              <div>All services + system. Used by Prometheus, uptime monitors, dashboards.</div>
            </div>
            <div class="bg-slate-900/50 rounded-lg p-3">
              <div class="font-semibold text-white mb-1">4. Services Endpoint</div>
              <div>Returns <code class="text-indigo-400">healthy</code> or <code class="text-amber-400">degraded</code> — no HTTP 503, always 200. Safe for dashboards.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw API Response -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-300">Raw Response — GET /health/services</h2>
        <span class="text-xs text-gray-600">auto-refreshes every 5s</span>
      </div>
      <pre class="text-xs text-gray-300 bg-slate-900/60 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed">{{ rawJson }}</pre>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeoMeta({
  title: 'System Health | TaskFlow',
  description: 'Real-time health status of all services',
})

// ─── Types ────────────────────────────────────────────────────────────────

interface ServiceStatus {
  status: 'up' | 'down'
  message?: string
}

interface ServicesResponse {
  status: 'healthy' | 'degraded'
  timestamp: string
  services: {
    mongodb: ServiceStatus
    redis: ServiceStatus
    rabbitmq: ServiceStatus
    nats: ServiceStatus
    bullmq: ServiceStatus
  }
}

interface FullHealthResponse {
  status: 'ok' | 'error' | 'shutting_down'
  info?: Record<string, { status: string }>
  error?: Record<string, { status: string; message?: string }>
  details?: Record<string, { status: string }>
}

// ─── State ────────────────────────────────────────────────────────────────

const services = ref<ServicesResponse | null>(null)
const fullCheck = ref<FullHealthResponse>({})
const probes = reactive({ live: false, ready: false })
const lastChecked = ref('—')
const rawJson = ref('Loading…')

// History for uptime strip (last 20 poll results per service)
const history = reactive<Record<string, boolean[]>>({
  mongodb: [], redis: [], rabbitmq: [], nats: [], bullmq: [],
})

// ─── Derived ─────────────────────────────────────────────────────────────

const overallStatus = computed(() => {
  if (!services.value) return 'Checking…'
  return services.value.status === 'healthy' ? 'All Systems Operational' : 'Degraded'
})

const overallStatusClass = computed(() =>
  services.value?.status === 'healthy'
    ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30'
    : 'bg-rose-900/60 text-rose-400 border border-rose-500/30'
)

const overallDotClass = computed(() =>
  services.value?.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'
)

const memoryStatus = computed(() => {
  const d = fullCheck.value?.details
  if (!d) return 'unknown'
  return d.memory_heap?.status === 'up' && d.memory_rss?.status === 'up' ? 'ok' : 'warning'
})

const serviceList = computed(() => {
  const svcData = services.value?.services
  const defs = [
    { key: 'mongodb',  label: 'MongoDB',  icon: '🍃', role: 'Primary database' },
    { key: 'redis',    label: 'Redis',    icon: '🔴', role: 'Pub/Sub + caching' },
    { key: 'rabbitmq', label: 'RabbitMQ', icon: '🐰', role: 'Job queues + messaging' },
    { key: 'nats',     label: 'NATS',     icon: '⚡', role: 'RPC + pub/sub' },
    { key: 'bullmq',   label: 'BullMQ',   icon: '🐂', role: 'Background workers' },
  ]
  return defs.map((d) => {
    const svc = svcData?.[d.key as keyof typeof svcData]
    const hist = history[d.key] ?? []
    const upCount = hist.filter(Boolean).length
    const uptimePct = hist.length > 0 ? Math.round((upCount / hist.length) * 100) : 100
    return {
      ...d,
      status: svc?.status ?? 'down',
      message: svc?.message,
      history: hist.slice(-20),
      uptimePct,
    }
  })
})

// ─── Polling ──────────────────────────────────────────────────────────────

const runtimeConfig = useRuntimeConfig()
const base = runtimeConfig.public.apiBase

async function fetchAll() {
  try {
    // Services endpoint (always 200)
    const svcData = await $fetch<ServicesResponse>(`${base}/health/services`)
    services.value = svcData
    rawJson.value = JSON.stringify(svcData, null, 2)
    lastChecked.value = new Date().toLocaleTimeString()

    // Record history
    for (const key of ['mongodb', 'redis', 'rabbitmq', 'nats', 'bullmq'] as const) {
      const isUp = svcData.services[key]?.status === 'up'
      if (!history[key]) history[key] = []
      history[key].push(isUp)
      if (history[key].length > 20) history[key].shift()
    }
  } catch {
    rawJson.value = '{ "error": "Failed to reach /health/services" }'
  }

  // Full check (may return 503 if degraded — catch it)
  try {
    fullCheck.value = await $fetch<FullHealthResponse>(`${base}/health`)
  } catch (err: unknown) {
    const data = (err as { data?: FullHealthResponse })?.data
    if (data) fullCheck.value = data
  }

  // Liveness probe
  try {
    await $fetch(`${base}/health/live`)
    probes.live = true
  } catch {
    probes.live = false
  }

  // Readiness probe
  try {
    await $fetch(`${base}/health/ready`)
    probes.ready = true
  } catch {
    probes.ready = false
  }
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchAll()
  timer = setInterval(fetchAll, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
