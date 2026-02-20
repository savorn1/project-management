<template>
  <div class="space-y-4">
    <!-- NATS Connection Status -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        NATS Pub/Sub Testing
      </h3>
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="text-gray-400">WebSocket Status</span>
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"
          ></div>
          <span :class="isConnected ? 'text-emerald-400' : 'text-red-400'">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Send Event via NATS -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Send Event via NATS
      </h3>
      <form @submit.prevent="sendNatsEvent" class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Room Name</label>
          <input
            v-model="natsForm.room"
            type="text"
            placeholder="e.g., test:nats-pubsub"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Event Type</label>
          <input
            v-model="natsForm.eventType"
            type="text"
            placeholder="e.g., nats:test"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Message</label>
          <textarea
            v-model="natsForm.message"
            rows="3"
            placeholder="Enter message..."
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y"
          ></textarea>
        </div>
        <button
          type="submit"
          :disabled="sending || !isConnected"
          class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ sending ? 'Sending...' : 'Send via NATS' }}
        </button>
      </form>
    </div>

    <!-- Benchmark: Redis vs NATS -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Benchmark: Redis vs NATS
      </h3>
      <form @submit.prevent="runBenchmark" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Room</label>
            <input
              v-model="benchmarkForm.room"
              type="text"
              placeholder="benchmark:test"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Iterations</label>
            <input
              v-model.number="benchmarkForm.iterations"
              type="number"
              min="1"
              max="1000"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          :disabled="benchmarking"
          class="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ benchmarking ? 'Running Benchmark...' : 'Run Benchmark' }}
        </button>
      </form>

      <!-- Benchmark Results -->
      <div v-if="benchmarkResult" class="mt-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ benchmarkResult.iterations }} iterations</span>
          <span class="text-xs font-semibold px-2 py-1 rounded-full"
            :class="benchmarkResult.winner === 'NATS' ? 'bg-violet-600/20 text-violet-300' : 'bg-red-600/20 text-red-300'"
          >
            Winner: {{ benchmarkResult.winner }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Redis Results -->
          <div class="p-3 rounded-lg border"
            :class="benchmarkResult.winner === 'Redis' ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900/50 border-slate-700/30'"
          >
            <p class="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-semibold">Redis</p>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Avg</span>
                <span class="text-white font-mono">{{ benchmarkResult.redis.avgMs }}ms</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Min</span>
                <span class="text-white font-mono">{{ benchmarkResult.redis.minMs }}ms</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Max</span>
                <span class="text-white font-mono">{{ benchmarkResult.redis.maxMs }}ms</span>
              </div>
            </div>
          </div>

          <!-- NATS Results -->
          <div class="p-3 rounded-lg border"
            :class="benchmarkResult.winner === 'NATS' ? 'bg-violet-900/20 border-violet-500/30' : 'bg-slate-900/50 border-slate-700/30'"
          >
            <p class="text-[10px] text-violet-400 uppercase tracking-wider mb-2 font-semibold">NATS</p>
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Avg</span>
                <span class="text-white font-mono">{{ benchmarkResult.nats.avgMs }}ms</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Min</span>
                <span class="text-white font-mono">{{ benchmarkResult.nats.minMs }}ms</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-400">Max</span>
                <span class="text-white font-mono">{{ benchmarkResult.nats.maxMs }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          NATS Event Log ({{ eventLog.length }})
        </h3>
        <button
          v-if="eventLog.length > 0"
          @click="eventLog = []"
          class="text-xs text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>

      <div v-if="eventLog.length === 0" class="text-center py-8">
        <p class="text-xs text-gray-500">No events logged yet. Send a NATS event or run a benchmark to see results.</p>
      </div>

      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="(event, index) in eventLog.slice().reverse()"
          :key="index"
          class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
        >
          <div class="flex items-center justify-between mb-1">
            <code class="text-xs text-violet-400 font-mono font-semibold">{{ event.type }}</code>
            <span class="text-xs text-gray-500">{{ event.time }}</span>
          </div>
          <pre class="text-xs text-gray-400 font-mono overflow-x-auto">{{ event.data }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const socket = useSocket()
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const sending = ref(false)
const benchmarking = ref(false)
const eventLog = ref<Array<{ type: string; data: string; time: string }>>([])

const isConnected = computed(() => socket.isConnected.value)

const natsForm = ref({
  room: 'test:nats-pubsub',
  eventType: 'nats:test',
  message: 'Hello from NATS Pub/Sub test!',
})

const benchmarkForm = ref({
  room: 'benchmark:test',
  iterations: 10,
})

const benchmarkResult = ref<{
  iterations: number
  redis: { avgMs: number; minMs: number; maxMs: number }
  nats: { avgMs: number; minMs: number; maxMs: number }
  winner: string
} | null>(null)

function logEvent(type: string, data: any) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  eventLog.value.push({
    type,
    data: JSON.stringify(data, null, 2),
    time,
  })
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(-50)
  }
}

onMounted(() => {
  socket.on('nats:test', (data: any) => {
    logEvent('nats:test', data)
    toast.success('NATS Pub/Sub event received!')
  })
  socket.on('task:created', (data: any) => logEvent('task:created', data))
  socket.on('project:created', (data: any) => logEvent('project:created', data))
})

async function sendNatsEvent() {
  sending.value = true
  try {
    socket.joinRoom(natsForm.value.room)

    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/test/nats/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: natsForm.value.room,
        eventType: natsForm.value.eventType,
        data: {
          message: natsForm.value.message,
          timestamp: new Date().toISOString(),
          transport: 'nats',
        },
      }),
    })

    if (response.ok) {
      toast.success('NATS event sent!')
    } else {
      toast.error('Failed to send NATS event')
    }
  } catch {
    toast.error('Error sending NATS event')
  } finally {
    sending.value = false
  }
}

async function runBenchmark() {
  benchmarking.value = true
  benchmarkResult.value = null
  try {
    socket.joinRoom(benchmarkForm.value.room)

    const response = await fetch(`${runtimeConfig.public.apiBase}/admin/events/test/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: benchmarkForm.value.room,
        eventType: 'benchmark:ping',
        data: { message: 'benchmark test' },
        iterations: benchmarkForm.value.iterations,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      benchmarkResult.value = data
      logEvent('BENCHMARK', data)
      toast.success(`Benchmark complete! Winner: ${data.winner}`)
    } else {
      toast.error('Benchmark failed')
    }
  } catch {
    toast.error('Error running benchmark')
  } finally {
    benchmarking.value = false
  }
}
</script>
