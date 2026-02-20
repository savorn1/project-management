<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-1">
        <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 3 8 3s8-.79 8-3V7M4 7c0 2.21 3.582 3 8 3s8-.79 8-3M4 7c0-2.21 3.582-3 8-3s8 .79 8 3" />
        </svg>
        Outbox Pattern Demo
      </h3>
      <p class="text-xs text-gray-400">
        Orders and outbox messages are written in a <span class="text-violet-400">single atomic transaction</span>.
        A background relay polls the outbox table and publishes to RabbitMQ.
        If the broker is down, messages <span class="text-amber-400">accumulate safely</span> and are flushed when it recovers.
      </p>
    </div>

    <!-- Flow Diagram -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-violet-500/20">
      <h3 class="text-sm font-semibold text-violet-300 mb-3">Transaction Flow</h3>
      <div class="grid grid-cols-3 gap-3">
        <!-- Step 1: Transaction -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-violet-500/20">
          <div class="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2">1. DB Transaction (Atomic)</div>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 p-1.5 bg-emerald-900/20 border border-emerald-500/20 rounded text-[10px] text-emerald-300">
              <span>INSERT orders</span>
            </div>
            <div class="text-[9px] text-center text-gray-600">+</div>
            <div class="flex items-center gap-2 p-1.5 bg-violet-900/20 border border-violet-500/20 rounded text-[10px] text-violet-300">
              <span>INSERT outbox (sent=false)</span>
            </div>
            <div class="text-[9px] text-center text-gray-500">both commit or neither does</div>
          </div>
        </div>

        <!-- Step 2: Relay -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-amber-500/20">
          <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">2. Relay (polls every 1s)</div>
          <div class="space-y-1.5">
            <div class="p-1.5 bg-amber-900/20 border border-amber-500/20 rounded text-[10px] text-amber-300">
              SELECT * FROM outbox<br/>WHERE sent = false
            </div>
            <div class="flex items-center gap-1 text-[9px] text-gray-500">
              <span class="text-emerald-400">broker UP</span> → publish + mark sent
            </div>
            <div class="flex items-center gap-1 text-[9px] text-gray-500">
              <span class="text-red-400">broker DOWN</span> → leave pending, retry next poll
            </div>
          </div>
        </div>

        <!-- Step 3: Consumer -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-cyan-500/20">
          <div class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">3. Consumer receives</div>
          <div class="space-y-1.5">
            <div class="p-1.5 bg-cyan-900/20 border border-cyan-500/20 rounded text-[10px] text-cyan-300">
              RabbitMQ delivers<br/>order.created event
            </div>
            <div class="text-[9px] text-gray-500">
              Payment service<br/>Inventory service<br/>Email service
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Relay Control -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          Relay Control
          <span
            class="text-[9px] px-1.5 py-0.5 rounded font-medium"
            :class="relay.running ? 'bg-emerald-600/20 text-emerald-300' : 'bg-gray-600/20 text-gray-400'"
          >
            {{ relay.running ? 'RUNNING' : 'STOPPED' }}
          </span>
        </h3>
        <div class="flex gap-2 mb-3">
          <button
            v-if="!relay.running"
            @click="startRelay"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Start Relay
          </button>
          <button
            v-else
            @click="stopRelay"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors"
          >
            Stop Relay
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 bg-slate-900/50 rounded-lg">
            <p class="text-[9px] text-gray-500">Polls</p>
            <p class="text-sm font-bold text-white">{{ relay.pollCount }}</p>
          </div>
          <div class="p-2 bg-slate-900/50 rounded-lg">
            <p class="text-[9px] text-gray-500">Published</p>
            <p class="text-sm font-bold text-emerald-400">{{ relay.publishedCount }}</p>
          </div>
          <div class="p-2 bg-slate-900/50 rounded-lg">
            <p class="text-[9px] text-gray-500">Pending</p>
            <p class="text-sm font-bold" :class="relay.pendingCount > 0 ? 'text-amber-400' : 'text-gray-500'">
              {{ relay.pendingCount }}
            </p>
          </div>
        </div>
        <p v-if="relay.lastPollAt" class="text-[9px] text-gray-600 mt-2 text-center">
          Last poll: {{ formatTime(relay.lastPollAt) }}
        </p>
      </div>

      <!-- Broker Simulation -->
      <div class="p-4 bg-slate-800/50 rounded-xl border"
        :class="relay.brokerDown ? 'border-red-500/30' : 'border-slate-700/40'">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          Broker Simulation
          <span
            class="text-[9px] px-1.5 py-0.5 rounded font-medium"
            :class="relay.brokerDown ? 'bg-red-600/20 text-red-300 animate-pulse' : 'bg-emerald-600/20 text-emerald-300'"
          >
            {{ relay.brokerDown ? 'DOWN' : 'UP' }}
          </span>
        </h3>
        <p class="text-[10px] text-gray-400 mb-3">
          Toggle broker availability to see outbox messages accumulate and flush on recovery.
        </p>
        <div class="flex gap-2">
          <button
            @click="brokerDown"
            :disabled="relay.brokerDown"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Broker Down
          </button>
          <button
            @click="brokerUp"
            :disabled="!relay.brokerDown"
            class="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Broker Up
          </button>
        </div>
        <div v-if="relay.brokerDown" class="mt-3 p-2 bg-red-900/20 border border-red-500/20 rounded-lg">
          <p class="text-[10px] text-red-300">
            Relay is running but can't publish. Outbox rows stay <code class="text-red-400">pending</code>.
            Click "Broker Up" to flush all pending messages.
          </p>
        </div>
      </div>
    </div>

    <!-- Create Orders -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Create Orders</h3>
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Customer</label>
          <input v-model="form.customer" type="text" placeholder="John Doe"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Amount ($)</label>
          <input v-model.number="form.amount" type="number" min="1"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Items</label>
          <input v-model.number="form.items" type="number" min="1" max="20"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="createOrder"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          Create 1 Order
        </button>
        <button
          @click="createBatch(5)"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          Create 5 Orders
        </button>
        <button
          @click="createBatch(10)"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          Create 10 Orders
        </button>
      </div>
    </div>

    <!-- DB Tables Side by Side -->
    <div class="grid grid-cols-2 gap-4">

      <!-- Orders Table -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-emerald-300 flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
            </svg>
            orders table ({{ orders.length }})
          </h3>
        </div>
        <div v-if="orders.length === 0" class="text-center py-4">
          <p class="text-xs text-gray-500">No orders yet</p>
        </div>
        <div v-else class="space-y-1.5 max-h-64 overflow-y-auto">
          <div
            v-for="order in orders"
            :key="order.id"
            class="p-2 bg-slate-900/40 rounded border border-emerald-500/10 text-[10px]"
          >
            <div class="flex items-center justify-between">
              <code class="text-emerald-400 font-mono">{{ order.id }}</code>
              <span class="text-gray-500">{{ formatTime(order.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-gray-400">
              <span>{{ order.customer }}</span>
              <span class="text-white font-medium">${{ order.amount }}</span>
              <span>{{ order.items }} items</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Outbox Table -->
      <div class="p-4 bg-slate-800/50 rounded-xl border border-violet-500/20">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-violet-300 flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            outbox table ({{ outbox.length }})
          </h3>
          <div class="flex gap-2 text-[9px]">
            <span class="text-amber-400">{{ pendingOutboxCount }} pending</span>
            <span class="text-emerald-400">{{ publishedOutboxCount }} published</span>
          </div>
        </div>
        <div v-if="outbox.length === 0" class="text-center py-4">
          <p class="text-xs text-gray-500">No outbox entries yet</p>
        </div>
        <div v-else class="space-y-1.5 max-h-64 overflow-y-auto">
          <div
            v-for="entry in outbox"
            :key="entry.id"
            class="p-2 bg-slate-900/40 rounded border transition-colors text-[10px]"
            :class="getOutboxRowClass(entry.status)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :class="{
                    'bg-amber-400 animate-pulse': entry.status === 'pending',
                    'bg-emerald-400': entry.status === 'published',
                    'bg-red-400': entry.status === 'failed',
                  }"
                ></span>
                <code class="font-mono text-gray-400">{{ entry.id }}</code>
              </div>
              <span
                class="px-1.5 py-0.5 rounded text-[8px] font-bold"
                :class="{
                  'bg-amber-600/20 text-amber-300': entry.status === 'pending',
                  'bg-emerald-600/20 text-emerald-300': entry.status === 'published',
                  'bg-red-600/20 text-red-300': entry.status === 'failed',
                }"
              >
                {{ entry.status.toUpperCase() }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-gray-500">
              <code class="text-cyan-400/70">{{ entry.topic }}</code>
              <span>→</span>
              <code class="text-gray-500 font-mono">{{ entry.orderId }}</code>
              <span v-if="entry.retryCount > 0" class="text-amber-400 ml-auto">retry {{ entry.retryCount }}</span>
            </div>
            <p v-if="entry.lastError && entry.status === 'pending'" class="text-[9px] text-red-400 mt-1 truncate">
              {{ entry.lastError }}
            </p>
            <p v-if="entry.publishedAt" class="text-[9px] text-emerald-400/60 mt-0.5">
              published {{ formatTime(entry.publishedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Published Messages Log -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-cyan-300 flex items-center gap-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          RabbitMQ Published Messages ({{ published.length }})
        </h3>
        <div class="flex gap-2">
          <button @click="fetchState" class="text-xs text-cyan-400 hover:text-cyan-300">Refresh</button>
          <button v-if="orders.length > 0" @click="clearAll" class="text-xs text-red-400 hover:text-red-300">Clear All</button>
        </div>
      </div>
      <div v-if="published.length === 0" class="text-center py-4">
        <p class="text-xs text-gray-500">No messages published yet. Start the relay and create orders.</p>
      </div>
      <div v-else class="space-y-1.5 max-h-48 overflow-y-auto">
        <div
          v-for="msg in published"
          :key="msg.id"
          class="p-2 bg-slate-900/40 rounded border border-cyan-500/10 text-[10px]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
              <code class="text-cyan-400/70 font-bold">{{ msg.topic }}</code>
              <code class="text-gray-500 font-mono">{{ msg.id }}</code>
            </div>
            <span class="text-gray-600">{{ formatTime(msg.publishedAt) }}</span>
          </div>
          <div class="mt-1 text-gray-500">
            Order <code class="text-white">{{ (msg.payload as any).orderId }}</code>
            — {{ (msg.payload as any).customer }}
            — ${{ (msg.payload as any).amount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const orders = ref<any[]>([])
const outbox = ref<any[]>([])
const published = ref<any[]>([])
const relay = ref({
  running: false,
  brokerDown: false,
  pollCount: 0,
  publishedCount: 0,
  failedCount: 0,
  lastPollAt: undefined as string | undefined,
  pendingCount: 0,
})

const form = ref({ customer: 'Alice', amount: 99.99, items: 3 })

const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)

const pendingOutboxCount = computed(() => outbox.value.filter((e) => e.status === 'pending').length)
const publishedOutboxCount = computed(() => outbox.value.filter((e) => e.status === 'published').length)

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getOutboxRowClass(status: string): string {
  switch (status) {
    case 'published': return 'border-emerald-500/15 opacity-60'
    case 'pending': return 'border-amber-500/20'
    case 'failed': return 'border-red-500/20'
    default: return 'border-slate-700/30'
  }
}

async function fetchState() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/state`)
    if (res.ok) {
      const data = await res.json()
      orders.value = data.orders
      outbox.value = data.outbox
      published.value = data.published
      relay.value = data.relay
    }
  } catch {}
}

async function startRelay() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/relay/start`, { method: 'POST' })
    relay.value.running = true
    toast.success('Relay started — polling outbox every 1s')
    startPolling()
  } catch {
    toast.error('Failed to start relay')
  }
}

async function stopRelay() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/relay/stop`, { method: 'POST' })
    relay.value.running = false
    toast.success('Relay stopped')
  } catch {
    toast.error('Failed to stop relay')
  }
}

async function brokerDown() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/broker/down`, { method: 'POST' })
    relay.value.brokerDown = true
    toast.error('Broker is DOWN — messages will accumulate in outbox')
  } catch {}
}

async function brokerUp() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/broker/up`, { method: 'POST' })
    relay.value.brokerDown = false
    toast.success('Broker is UP — relay will flush pending messages')
  } catch {}
}

async function createOrder() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (res.ok) {
      toast.success('Order + outbox entry created atomically')
      await fetchState()
    }
  } catch {
    toast.error('Failed to create order')
  }
}

async function createBatch(count: number) {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/order-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, ...form.value }),
    })
    if (res.ok) {
      toast.success(`${count} orders created atomically`)
      await fetchState()
    }
  } catch {
    toast.error('Failed to create batch')
  }
}

async function clearAll() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/outbox/clear`, { method: 'POST' })
    orders.value = []
    outbox.value = []
    published.value = []
  } catch {}
}

function startPolling() {
  if (pollTimer.value) return
  pollTimer.value = setInterval(fetchState, 1200)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

onMounted(async () => {
  await fetchState()
  if (relay.value.running) startPolling()
})

onUnmounted(() => stopPolling())

// Auto-start polling when relay starts
watch(() => relay.value.running, (running) => {
  if (running) startPolling()
  else stopPolling()
})
</script>
