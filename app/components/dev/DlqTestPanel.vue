<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-1">
        <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        Dead Letter Queue (DLQ) Pattern
      </h3>
      <p class="text-xs text-gray-400">
        Messages that fail processing are <span class="text-amber-400">retried with exponential backoff</span>.
        After max retries, they land in a <span class="text-rose-400">Dead Letter Queue</span> for manual inspection/retry.
      </p>
    </div>

    <!-- Flow Diagram -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-rose-500/20">
      <h3 class="text-sm font-semibold text-rose-300 mb-3">Message Flow</h3>
      <div class="flex items-center gap-2 text-[10px] font-mono overflow-x-auto pb-2">
        <!-- Producer -->
        <div class="shrink-0 px-3 py-2 bg-indigo-900/40 border border-indigo-500/30 rounded-lg text-indigo-300 text-center">
          <div class="font-bold">Producer</div>
        </div>
        <div class="text-gray-600 shrink-0">--></div>
        <!-- Main Queue -->
        <div class="shrink-0 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-center">
          <div class="font-bold">Main Queue</div>
          <div class="text-gray-500">dlq-demo.main</div>
        </div>
        <div class="text-gray-600 shrink-0">--></div>
        <!-- Consumer -->
        <div class="shrink-0 px-3 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-center">
          <div class="font-bold text-emerald-300">Consumer</div>
          <div class="text-gray-500">process msg</div>
        </div>
        <div class="flex flex-col items-center shrink-0">
          <div class="text-emerald-400">-- OK --></div>
          <div class="text-red-400">-- FAIL --></div>
        </div>
        <!-- Retry / DLQ -->
        <div class="shrink-0 space-y-1">
          <div class="px-3 py-1.5 bg-amber-900/30 border border-amber-500/30 rounded-lg text-amber-300 text-center">
            <div class="font-bold">Retry (2s/8s/32s)</div>
            <div class="text-gray-500">TTL -> back to main</div>
          </div>
          <div class="px-3 py-1.5 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-center">
            <div class="font-bold">Dead Letter Queue</div>
            <div class="text-gray-500">max retries exceeded</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Config & Controls -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Consumer Configuration</h3>

      <!-- Failure Mode -->
      <div class="mb-4">
        <label class="block text-xs text-gray-400 mb-2">Failure Mode</label>
        <div class="flex gap-2">
          <button
            v-for="mode in failureModes"
            :key="mode.value"
            @click="config.failureMode = mode.value"
            class="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all"
            :class="config.failureMode === mode.value
              ? 'bg-rose-600 text-white'
              : 'bg-slate-700/50 text-gray-400 hover:text-white'"
          >
            {{ mode.label }}
          </button>
        </div>
        <p class="text-[10px] text-gray-500 mt-1.5">{{ failureModeDescription }}</p>
      </div>

      <!-- Extra config for failure modes -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div v-if="config.failureMode === 'first_n'">
          <label class="block text-xs text-gray-400 mb-1">Fail First N</label>
          <input v-model.number="config.failCount" type="number" min="1" max="10"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500" />
        </div>
        <div v-if="config.failureMode === 'random'">
          <label class="block text-xs text-gray-400 mb-1">Fail Probability</label>
          <input v-model.number="config.failProbability" type="number" min="0" max="1" step="0.1"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Max Retries</label>
          <input v-model.number="config.maxRetries" type="number" min="1" max="5"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Processing Delay (ms)</label>
          <input v-model.number="config.processingDelayMs" type="number" min="100" max="3000" step="100"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500" />
        </div>
      </div>

      <!-- Start/Stop Consumer -->
      <div class="flex gap-3">
        <button
          v-if="!consuming"
          @click="startConsumer"
          class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        >
          Start Consumer
        </button>
        <button
          v-else
          @click="stopConsumer"
          class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Stop Consumer
        </button>
      </div>
    </div>

    <!-- Send Messages -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Send Messages</h3>
      <div class="flex gap-3">
        <button
          @click="sendOne"
          :disabled="!consuming"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send 1 Message
        </button>
        <button
          @click="sendBatch(5)"
          :disabled="!consuming"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send 5 Messages
        </button>
        <button
          @click="sendBatch(10)"
          :disabled="!consuming"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send 10 Messages
        </button>
        <div v-if="!consuming" class="flex items-center text-xs text-gray-500">
          Start consumer first
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-6 gap-3">
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Processed</p>
        <p class="text-lg font-bold text-emerald-400">{{ stats.processed }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Failed</p>
        <p class="text-lg font-bold text-red-400">{{ stats.failed }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Retried</p>
        <p class="text-lg font-bold text-amber-400">{{ stats.retried }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dead Letters</p>
        <p class="text-lg font-bold text-rose-400">{{ stats.deadLettered }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">In Retry Queues</p>
        <p class="text-lg font-bold text-amber-300">{{ totalRetryMessages }}</p>
      </div>
      <div class="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 text-center">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Main Queue</p>
        <p class="text-lg font-bold text-cyan-400">{{ stats.mainQueue?.messages ?? 0 }}</p>
      </div>
    </div>

    <!-- Retry Queue Details -->
    <div v-if="stats.retryQueues?.length" class="p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
      <h3 class="text-sm font-semibold text-amber-300 mb-3">Retry Queues (Exponential Backoff)</h3>
      <div class="flex gap-3">
        <div
          v-for="(rq, i) in stats.retryQueues"
          :key="rq.name"
          class="flex-1 p-3 bg-slate-900/50 rounded-lg border border-amber-500/10"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-amber-400">Retry {{ i + 1 }}</span>
            <span class="text-[10px] text-gray-500">{{ rq.ttlMs / 1000 }}s delay</span>
          </div>
          <p class="text-xl font-bold text-white">{{ rq.messages }}</p>
          <p class="text-[9px] text-gray-500 font-mono mt-1">{{ rq.name }}</p>
        </div>
      </div>
    </div>

    <!-- Message List -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          Messages ({{ messages.length }})
        </h3>
        <div class="flex gap-2">
          <button @click="fetchMessages" class="text-xs text-cyan-400 hover:text-cyan-300">Refresh</button>
          <button v-if="deadCount > 0" @click="retryAllDead" class="text-xs text-amber-400 hover:text-amber-300">
            Retry All Dead ({{ deadCount }})
          </button>
          <button v-if="deadCount > 0" @click="discardAllDead" class="text-xs text-red-400 hover:text-red-300">
            Discard All Dead
          </button>
          <button v-if="messages.length > 0" @click="clearAll" class="text-xs text-gray-400 hover:text-gray-300">Clear</button>
        </div>
      </div>

      <div v-if="messages.length === 0" class="text-center py-6">
        <p class="text-xs text-gray-500">No messages yet. Start the consumer and send some messages.</p>
      </div>

      <div v-else class="space-y-2 max-h-[400px] overflow-y-auto">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="p-3 bg-slate-900/40 rounded-lg border transition-all"
          :class="getMessageBorderClass(msg.status)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="getStatusDotClass(msg.status)"
              ></span>
              <code class="text-[10px] text-gray-400 font-mono">{{ msg.id }}</code>
              <span
                class="text-[9px] px-1.5 py-0.5 rounded font-medium"
                :class="getStatusBadgeClass(msg.status)"
              >
                {{ msg.status.replace('_', ' ').toUpperCase() }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="msg.retryCount > 0" class="text-[9px] text-amber-400">
                {{ msg.retryCount }}/{{ msg.maxRetries }} retries
              </span>
              <button
                v-if="msg.status === 'dead'"
                @click="retryOne(msg.id)"
                class="text-[10px] px-2 py-0.5 bg-amber-600/20 text-amber-300 rounded hover:bg-amber-600/40 transition-colors"
              >
                Retry
              </button>
              <button
                v-if="msg.status === 'dead'"
                @click="discardOne(msg.id)"
                class="text-[10px] px-2 py-0.5 bg-red-600/20 text-red-300 rounded hover:bg-red-600/40 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>

          <!-- Error -->
          <p v-if="msg.error" class="text-[9px] text-red-400 mt-1.5 truncate">{{ msg.error }}</p>

          <!-- Retry History (expandable) -->
          <div v-if="msg.retryHistory?.length > 0" class="mt-2">
            <button
              @click="toggleExpand(msg.id)"
              class="text-[9px] text-gray-500 hover:text-gray-300 flex items-center gap-1"
            >
              <span>{{ expandedIds.has(msg.id) ? '&#9660;' : '&#9654;' }}</span>
              Retry history ({{ msg.retryHistory.length }})
            </button>
            <div v-if="expandedIds.has(msg.id)" class="mt-1.5 space-y-1 pl-3 border-l border-slate-700/50">
              <div
                v-for="(h, i) in msg.retryHistory"
                :key="i"
                class="flex items-center gap-2 text-[9px]"
              >
                <span class="text-gray-600 w-12">{{ h.delayMs > 0 ? `+${h.delayMs}ms` : 'manual' }}</span>
                <span :class="h.error.startsWith('DEAD') ? 'text-red-400' : h.error.startsWith('MANUAL') ? 'text-cyan-400' : 'text-amber-400'">
                  {{ h.error }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const consuming = ref(false)
const messages = ref<any[]>([])
const expandedIds = ref(new Set<string>())
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)

const stats = ref<any>({
  mainQueue: { messages: 0, consumers: 0 },
  retryQueues: [],
  dlq: { messages: 0 },
  processed: 0,
  failed: 0,
  retried: 0,
  deadLettered: 0,
})

const config = ref({
  failureMode: 'first_n' as 'always' | 'random' | 'first_n' | 'never',
  failCount: 2,
  failProbability: 0.5,
  maxRetries: 3,
  processingDelayMs: 500,
})

const failureModes = [
  { value: 'first_n' as const, label: 'First N Fail' },
  { value: 'always' as const, label: 'Always Fail' },
  { value: 'random' as const, label: 'Random' },
  { value: 'never' as const, label: 'Never Fail' },
]

const failureModeDescription = computed(() => {
  switch (config.value.failureMode) {
    case 'always': return 'Every message fails — all will exhaust retries and land in DLQ'
    case 'never': return 'No failures — all messages processed successfully'
    case 'random': return `Each attempt has ${(config.value.failProbability * 100).toFixed(0)}% chance of failure`
    case 'first_n': return `First ${config.value.failCount} attempts fail, then succeed — demonstrates retry recovery`
  }
})

const deadCount = computed(() => messages.value.filter((m) => m.status === 'dead').length)
const totalRetryMessages = computed(() =>
  (stats.value.retryQueues || []).reduce((sum: number, rq: any) => sum + rq.messages, 0),
)

function getMessageBorderClass(status: string): string {
  switch (status) {
    case 'completed': return 'border-emerald-500/20'
    case 'dead': return 'border-red-500/30 bg-red-900/5'
    case 'processing': return 'border-cyan-500/30'
    default:
      if (status.startsWith('retry')) return 'border-amber-500/20'
      return 'border-slate-700/30'
  }
}

function getStatusDotClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-500'
    case 'dead': return 'bg-red-500 animate-pulse'
    case 'processing': return 'bg-cyan-500 animate-pulse'
    default:
      if (status.startsWith('retry')) return 'bg-amber-500'
      return 'bg-gray-500'
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-600/20 text-emerald-300'
    case 'dead': return 'bg-red-600/20 text-red-300'
    case 'processing': return 'bg-cyan-600/20 text-cyan-300'
    default:
      if (status.startsWith('retry')) return 'bg-amber-600/20 text-amber-300'
      return 'bg-gray-600/20 text-gray-300'
  }
}

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

async function startConsumer() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value),
    })
    consuming.value = true
    toast.success('Consumer started')
    startPolling()
  } catch {
    toast.error('Failed to start consumer')
  }
}

async function stopConsumer() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/stop`, { method: 'POST' })
    consuming.value = false
    toast.success('Consumer stopped')
    stopPolling()
  } catch {
    toast.error('Failed to stop consumer')
  }
}

async function sendOne() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          action: 'process_order',
          orderId: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          amount: +(Math.random() * 500 + 10).toFixed(2),
        },
      }),
    })
    if (res.ok) toast.success('Message sent')
  } catch {
    toast.error('Failed to send message')
  }
}

async function sendBatch(count: number) {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/send-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, payload: { action: 'process_order' } }),
    })
    if (res.ok) toast.success(`${count} messages sent`)
  } catch {
    toast.error('Failed to send batch')
  }
}

async function retryOne(id: string) {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/retry/${id}`, { method: 'POST' })
    toast.success(`Retrying ${id}`)
  } catch {
    toast.error('Failed to retry')
  }
}

async function retryAllDead() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/retry-all`, { method: 'POST' })
    const data = await res.json()
    toast.success(`Retrying ${data.retriedCount} messages`)
  } catch {
    toast.error('Failed to retry all')
  }
}

async function discardOne(id: string) {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/discard/${id}`, { method: 'POST' })
    await fetchMessages()
  } catch {}
}

async function discardAllDead() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/discard-all`, { method: 'POST' })
    await fetchMessages()
    toast.success('Dead messages discarded')
  } catch {}
}

async function fetchMessages() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/messages`)
    if (res.ok) {
      const data = await res.json()
      messages.value = data.messages
      consuming.value = data.consuming
    }
  } catch {}
}

async function fetchStats() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/stats`)
    if (res.ok) {
      stats.value = await res.json()
    }
  } catch {}
}

async function clearAll() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/dlq/clear`, { method: 'POST' })
    messages.value = []
    stats.value = { ...stats.value, processed: 0, failed: 0, retried: 0, deadLettered: 0 }
  } catch {}
}

function startPolling() {
  stopPolling()
  pollTimer.value = setInterval(async () => {
    await Promise.all([fetchMessages(), fetchStats()])
  }, 1500)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

onMounted(async () => {
  await Promise.all([fetchMessages(), fetchStats()])
  if (consuming.value) startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>
