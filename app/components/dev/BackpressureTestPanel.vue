<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-lg font-semibold text-white">Backpressure Demo</h2>
          <p class="text-sm text-gray-400 mt-0.5">
            Producer sends faster than consumer can handle — watch the queue fill up and see how each strategy responds
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="!stats.isRunning"
            @click="start"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start
          </button>
          <button
            v-else
            @click="stop"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Stop
          </button>
          <button
            @click="clear"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Concept explanation -->
      <div class="grid grid-cols-3 gap-3 mt-4">
        <div class="bg-slate-900/60 rounded-lg p-3 border border-emerald-500/20">
          <div class="text-xs font-semibold text-emerald-400 mb-1">PRODUCER</div>
          <div class="text-xl font-bold text-white">{{ config.producerRatePerSec }}<span class="text-sm text-gray-400 ml-1">msg/s</span></div>
          <div class="text-xs text-gray-500 mt-1">Generates orders rapidly</div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 border border-slate-600/40 flex items-center justify-center">
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">Queue</div>
            <!-- Queue depth bar -->
            <div class="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="queueFillClass"
                :style="{ width: queueFillPct + '%' }"
              ></div>
            </div>
            <div class="text-xs mt-1" :class="queueDepthTextClass">
              {{ stats.queueDepth }} / {{ stats.maxQueueDepth }}
            </div>
          </div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 border border-blue-500/20">
          <div class="text-xs font-semibold text-blue-400 mb-1">CONSUMER</div>
          <div class="text-xl font-bold text-white">{{ config.consumerRatePerSec }}<span class="text-sm text-gray-400 ml-1">msg/s</span></div>
          <div class="text-xs text-gray-500 mt-1">Processes orders slowly</div>
        </div>
      </div>
    </div>

    <!-- Config + Stats -->
    <div class="grid grid-cols-2 gap-4">

      <!-- Config Panel -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-3">Configuration</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400 block mb-1">Producer Rate (msg/s)</label>
            <input
              v-model.number="config.producerRatePerSec"
              type="range" min="1" max="30" step="1"
              class="w-full accent-emerald-500"
            />
            <div class="text-xs text-gray-400 text-right">{{ config.producerRatePerSec }} msg/s</div>
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Consumer Rate (msg/s)</label>
            <input
              v-model.number="config.consumerRatePerSec"
              type="range" min="1" max="30" step="1"
              class="w-full accent-blue-500"
            />
            <div class="text-xs text-gray-400 text-right">{{ config.consumerRatePerSec }} msg/s</div>
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Max Queue Depth</label>
            <input
              v-model.number="config.maxQueueDepth"
              type="range" min="5" max="100" step="5"
              class="w-full accent-amber-500"
            />
            <div class="text-xs text-gray-400 text-right">{{ config.maxQueueDepth }} messages</div>
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Prefetch Count (RabbitMQ QoS)</label>
            <input
              v-model.number="config.prefetchCount"
              type="range" min="1" max="10" step="1"
              class="w-full accent-purple-500"
            />
            <div class="text-xs text-gray-400 text-right">{{ config.prefetchCount }} msg per tick</div>
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Overflow Strategy</label>
            <div class="grid grid-cols-3 gap-1 mt-1">
              <button
                v-for="s in strategies"
                :key="s.value"
                @click="config.strategy = s.value"
                class="py-1.5 px-2 text-xs rounded-md font-medium transition-colors"
                :class="config.strategy === s.value ? s.activeClass : 'bg-slate-700 text-gray-400 hover:text-white'"
              >
                {{ s.label }}
              </button>
            </div>
            <div class="text-xs text-gray-500 mt-1.5">{{ strategyDescription }}</div>
          </div>
          <div v-if="config.strategy === 'drop'">
            <label class="text-xs text-gray-400 block mb-1">Drop Policy</label>
            <div class="grid grid-cols-2 gap-1">
              <button
                @click="config.dropPolicy = 'oldest'"
                class="py-1.5 text-xs rounded-md font-medium transition-colors"
                :class="config.dropPolicy === 'oldest' ? 'bg-rose-700 text-white' : 'bg-slate-700 text-gray-400 hover:text-white'"
              >Oldest (FIFO evict)</button>
              <button
                @click="config.dropPolicy = 'newest'"
                class="py-1.5 text-xs rounded-md font-medium transition-colors"
                :class="config.dropPolicy === 'newest' ? 'bg-rose-700 text-white' : 'bg-slate-700 text-gray-400 hover:text-white'"
              >Newest (reject incoming)</button>
            </div>
          </div>
          <button
            @click="applyConfig"
            class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors mt-1"
          >
            Apply Config
          </button>
        </div>
      </div>

      <!-- Stats Panel -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-3">Live Stats</h3>

        <!-- Queue depth gauge -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>Queue Depth</span>
            <span :class="queueDepthTextClass">{{ stats.queueDepth }} / {{ stats.maxQueueDepth }}</span>
          </div>
          <div class="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-200"
              :class="queueFillClass"
              :style="{ width: queueFillPct + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mt-0.5">
            <span>0</span>
            <span>{{ stats.maxQueueDepth }}</span>
          </div>
        </div>

        <!-- Throughput -->
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="bg-slate-900/60 rounded-lg p-2.5 text-center border border-emerald-500/20">
            <div class="text-xs text-gray-500">Produced/s</div>
            <div class="text-lg font-bold text-emerald-400">{{ stats.throughputProduced }}</div>
          </div>
          <div class="bg-slate-900/60 rounded-lg p-2.5 text-center border border-blue-500/20">
            <div class="text-xs text-gray-500">Consumed/s</div>
            <div class="text-lg font-bold text-blue-400">{{ stats.throughputConsumed }}</div>
          </div>
        </div>

        <!-- Counters -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Total Produced</div>
            <div class="text-base font-semibold text-emerald-400">{{ stats.produced }}</div>
          </div>
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Total Consumed</div>
            <div class="text-base font-semibold text-blue-400">{{ stats.consumed }}</div>
          </div>
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Dropped</div>
            <div class="text-base font-semibold text-rose-400">{{ stats.dropped }}</div>
          </div>
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Rejected (429)</div>
            <div class="text-base font-semibold text-orange-400">{{ stats.rejected }}</div>
          </div>
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Blocked (slow)</div>
            <div class="text-base font-semibold text-amber-400">{{ stats.blocked }}</div>
          </div>
          <div class="bg-slate-900/50 rounded-lg p-2.5">
            <div class="text-xs text-gray-500">Avg Wait</div>
            <div class="text-base font-semibold text-purple-400">{{ stats.avgWaitMs }}ms</div>
          </div>
        </div>

        <!-- Loss rate -->
        <div class="mt-3 bg-slate-900/40 rounded-lg p-2.5">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>Message Loss Rate</span>
            <span :class="lossRate > 0 ? 'text-rose-400' : 'text-emerald-400'">{{ lossRate }}%</span>
          </div>
          <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="lossRate > 20 ? 'bg-rose-500' : lossRate > 5 ? 'bg-amber-500' : 'bg-emerald-500'"
              :style="{ width: Math.min(lossRate, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visual queue + message log -->
    <div class="grid grid-cols-2 gap-4">

      <!-- Current Queue Snapshot -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300">In-Queue Snapshot</h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-gray-400">{{ queueSnapshot.length }} waiting</span>
        </div>
        <div v-if="queueSnapshot.length === 0" class="text-center py-6 text-gray-600 text-sm">
          Queue is empty
        </div>
        <div v-else class="space-y-1 max-h-56 overflow-y-auto">
          <div
            v-for="(msg, idx) in queueSnapshot.slice(0, 30)"
            :key="msg.id"
            class="flex items-center gap-2 text-xs bg-slate-900/50 rounded px-2 py-1"
          >
            <span class="text-gray-600 w-4 text-right">{{ idx + 1 }}</span>
            <span class="font-mono text-amber-300 flex-1">{{ msg.payload }}</span>
            <span class="text-gray-500">{{ msAgo(msg.producedAt) }}ms ago</span>
          </div>
          <div v-if="queueSnapshot.length > 30" class="text-xs text-center text-gray-600 py-1">
            … and {{ queueSnapshot.length - 30 }} more
          </div>
        </div>
      </div>

      <!-- Message Log -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-300">Message Log</h3>
          <span class="text-xs text-gray-500">last 200</span>
        </div>
        <div v-if="messageLog.length === 0" class="text-center py-6 text-gray-600 text-sm">
          No messages yet
        </div>
        <div v-else class="space-y-1 max-h-56 overflow-y-auto">
          <div
            v-for="msg in messageLog.slice(0, 60)"
            :key="msg.id"
            class="flex items-center gap-2 text-xs bg-slate-900/50 rounded px-2 py-1"
          >
            <span
              class="px-1.5 py-0.5 rounded text-xs font-semibold w-16 text-center"
              :class="outcomeClass(msg.status)"
            >{{ msg.status }}</span>
            <span class="font-mono text-gray-300 flex-1">{{ msg.payload }}</span>
            <span v-if="msg.waitMs !== undefined" class="text-gray-500">{{ msg.waitMs }}ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini bar chart of recent outcomes -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-3">Recent 50 Messages — Outcome Distribution</h3>
      <div class="flex gap-0.5 items-end h-14">
        <div
          v-for="(msg, i) in recentFifty"
          :key="i"
          class="flex-1 rounded-sm min-w-[4px]"
          :class="outcomeBarClass(msg.status)"
          :title="msg.payload + ' — ' + msg.status"
          style="min-height: 8px;"
        ></div>
      </div>
      <div class="flex gap-4 mt-2 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500 inline-block"></span> done</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-rose-500 inline-block"></span> dropped</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-orange-500 inline-block"></span> rejected</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const API = `${runtimeConfig.public.apiBase}/rabbitmq`

interface Config {
  producerRatePerSec: number
  consumerRatePerSec: number
  maxQueueDepth: number
  strategy: 'block' | 'drop' | 'reject'
  dropPolicy: 'oldest' | 'newest'
  prefetchCount: number
}

interface Stats {
  isRunning: boolean
  queueDepth: number
  maxQueueDepth: number
  produced: number
  consumed: number
  dropped: number
  rejected: number
  blocked: number
  throughputProduced: number
  throughputConsumed: number
  avgWaitMs: number
  config: Config
}

interface Message {
  id: string
  payload: string
  producedAt: string
  processedAt?: string
  droppedAt?: string
  status: 'queued' | 'processing' | 'done' | 'dropped' | 'rejected'
  waitMs?: number
}

const config = reactive<Config>({
  producerRatePerSec: 10,
  consumerRatePerSec: 3,
  maxQueueDepth: 20,
  strategy: 'drop',
  dropPolicy: 'oldest',
  prefetchCount: 1,
})

const stats = reactive<Stats>({
  isRunning: false,
  queueDepth: 0,
  maxQueueDepth: 20,
  produced: 0,
  consumed: 0,
  dropped: 0,
  rejected: 0,
  blocked: 0,
  throughputProduced: 0,
  throughputConsumed: 0,
  avgWaitMs: 0,
  config: { ...config },
})

const queueSnapshot = ref<Message[]>([])
const messageLog = ref<Message[]>([])

const strategies = [
  { value: 'drop' as const, label: 'Drop', activeClass: 'bg-rose-700 text-white' },
  { value: 'reject' as const, label: 'Reject 429', activeClass: 'bg-orange-700 text-white' },
  { value: 'block' as const, label: 'Block', activeClass: 'bg-amber-700 text-white' },
]

const strategyDescription = computed(() => {
  if (config.strategy === 'drop') return 'Silently discard messages when queue is full (oldest or newest)'
  if (config.strategy === 'reject') return 'Return 429 error to producer — producer must retry later'
  return 'Slow down the producer — it waits until queue has room (back-pressure propagation)'
})

const queueFillPct = computed(() =>
  stats.maxQueueDepth > 0 ? Math.min((stats.queueDepth / stats.maxQueueDepth) * 100, 100) : 0
)

const queueFillClass = computed(() => {
  const pct = queueFillPct.value
  if (pct >= 90) return 'bg-rose-500'
  if (pct >= 70) return 'bg-amber-500'
  if (pct >= 40) return 'bg-yellow-500'
  return 'bg-emerald-500'
})

const queueDepthTextClass = computed(() => {
  const pct = queueFillPct.value
  if (pct >= 90) return 'text-rose-400'
  if (pct >= 70) return 'text-amber-400'
  return 'text-gray-400'
})

const lossRate = computed(() => {
  const lost = stats.dropped + stats.rejected
  if (stats.produced === 0) return 0
  return Math.round((lost / stats.produced) * 100)
})

const recentFifty = computed(() => messageLog.value.slice(0, 50).reverse())

// ─── API Calls ──────────────────────────────────────────────────────────

async function start() {
  await $fetch(`${API}/bp/start`, { method: 'POST', body: { ...config } })
  pollStats()
}

async function stop() {
  await $fetch(`${API}/bp/stop`, { method: 'POST' })
}

async function clear() {
  await $fetch(`${API}/bp/clear`, { method: 'POST' })
  Object.assign(stats, {
    isRunning: false, queueDepth: 0, produced: 0, consumed: 0,
    dropped: 0, rejected: 0, blocked: 0, throughputProduced: 0,
    throughputConsumed: 0, avgWaitMs: 0,
  })
  queueSnapshot.value = []
  messageLog.value = []
}

async function applyConfig() {
  await $fetch(`${API}/bp/config`, { method: 'POST', body: { ...config } })
}

async function pollStats() {
  try {
    const data = await $fetch<{ stats: Stats; queue: Message[]; log: Message[] }>(`${API}/bp/stats`)
    Object.assign(stats, data.stats)
    Object.assign(config, data.stats.config)
    queueSnapshot.value = data.queue
    messageLog.value = data.log
  } catch { /* ignore */ }
}

// ─── Helpers ────────────────────────────────────────────────────────────

function msAgo(iso: string) {
  return Date.now() - new Date(iso).getTime()
}

function outcomeClass(status: string) {
  if (status === 'done') return 'bg-emerald-900/60 text-emerald-400'
  if (status === 'dropped') return 'bg-rose-900/60 text-rose-400'
  if (status === 'rejected') return 'bg-orange-900/60 text-orange-400'
  return 'bg-slate-700 text-gray-400'
}

function outcomeBarClass(status: string) {
  if (status === 'done') return 'bg-emerald-500'
  if (status === 'dropped') return 'bg-rose-500'
  if (status === 'rejected') return 'bg-orange-500'
  return 'bg-slate-600'
}

// ─── Polling ────────────────────────────────────────────────────────────

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  pollStats()
  pollTimer = setInterval(pollStats, 800)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
