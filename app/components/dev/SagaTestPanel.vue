<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-1">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Saga Orchestrator Pattern
      </h3>
      <p class="text-xs text-gray-400">
        Multi-step transaction with <span class="text-cyan-400">automatic compensation</span> (rollback) on failure.
        Each step publishes to a RabbitMQ queue. If any step fails, completed steps are undone in reverse order.
      </p>
    </div>

    <!-- Saga Flow Diagram -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20">
      <h3 class="text-sm font-semibold text-cyan-300 mb-3">Order Processing Saga</h3>
      <div class="space-y-2">
        <div v-for="(step, i) in sagaSteps" :key="i" class="flex items-center gap-3">
          <!-- Step number -->
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300"
            :class="getStepCircleClass(i)"
          >
            <span v-if="getStepIcon(i) === 'number'">{{ i + 1 }}</span>
            <span v-else-if="getStepIcon(i) === 'check'">&#10003;</span>
            <span v-else-if="getStepIcon(i) === 'x'">&#10007;</span>
            <span v-else-if="getStepIcon(i) === 'undo'">&#8617;</span>
            <span v-else class="animate-spin">&#9696;</span>
          </div>

          <!-- Connector line -->
          <div class="w-6 h-0.5 shrink-0" :class="getConnectorClass(i)"></div>

          <!-- Step card -->
          <div
            class="flex-1 p-2.5 rounded-lg border transition-all duration-300"
            :class="getStepCardClass(i)"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-medium" :class="getStepTextClass(i)">{{ step.name }}</span>
                <span class="text-[10px] text-gray-500 ml-2">{{ step.service }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="currentResult?.steps[i]?.duration" class="text-[9px] text-gray-500">
                  {{ currentResult.steps[i].duration }}ms
                </span>
                <code class="text-[9px] text-gray-600 font-mono">{{ step.queue }}</code>
              </div>
            </div>
            <!-- Compensation info -->
            <div v-if="currentResult?.steps[i]?.compensationStatus" class="mt-1.5 pt-1.5 border-t border-slate-700/30">
              <div class="flex items-center gap-2">
                <span class="text-[9px] text-amber-400">&#8617; Compensating:</span>
                <code class="text-[9px] text-amber-300/70 font-mono">{{ step.compensationQueue }}</code>
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded"
                  :class="currentResult.steps[i].compensationStatus === 'completed'
                    ? 'bg-amber-600/20 text-amber-300'
                    : 'bg-red-600/20 text-red-300'"
                >
                  {{ currentResult.steps[i].compensationStatus === 'completed' ? 'Rolled back' : 'Failed' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Config & Run -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3">Run Saga</h3>

      <!-- Failure injection -->
      <div class="mb-4">
        <label class="block text-xs text-gray-400 mb-2">Inject Failure At Step (click to select)</label>
        <div class="flex gap-2">
          <button
            @click="config.failAtStep = undefined"
            class="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all"
            :class="config.failAtStep === undefined
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700/50 text-gray-400 hover:text-white'"
          >
            No Failure
          </button>
          <button
            v-for="(step, i) in sagaSteps"
            :key="i"
            @click="config.failAtStep = i"
            class="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all"
            :class="config.failAtStep === i
              ? 'bg-red-600 text-white'
              : 'bg-slate-700/50 text-gray-400 hover:text-white'"
          >
            Step {{ i + 1 }}
          </button>
        </div>
        <p v-if="config.failAtStep !== undefined" class="text-[10px] text-red-400 mt-1.5">
          Step {{ config.failAtStep + 1 }} "{{ sagaSteps[config.failAtStep].name }}" will fail →
          Steps {{ config.failAtStep > 0 ? `1-${config.failAtStep}` : 'none' }} will be compensated
        </p>
      </div>

      <!-- Order details -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Customer</label>
          <input v-model="config.customer" type="text" placeholder="John Doe"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Amount</label>
          <input v-model.number="config.amount" type="number" min="1"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Items</label>
          <input v-model.number="config.items" type="number" min="1" max="100"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Step Delay (ms)</label>
          <input v-model.number="config.stepDelayMs" type="number" min="100" max="2000" step="100"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
      </div>

      <button
        @click="runSaga"
        :disabled="running"
        class="w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="config.failAtStep !== undefined
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-cyan-600 hover:bg-cyan-700 text-white'"
      >
        {{ running ? `Executing step ${currentStep + 1} of ${sagaSteps.length}...` : config.failAtStep !== undefined ? `Run Saga (Fail at Step ${config.failAtStep + 1})` : 'Run Saga (All Success)' }}
      </button>
    </div>

    <!-- Result Summary -->
    <div v-if="currentResult" class="p-4 bg-slate-800/50 rounded-xl border"
      :class="currentResult.status === 'completed' ? 'border-emerald-500/30' : 'border-red-500/30'">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold flex items-center gap-2"
          :class="currentResult.status === 'completed' ? 'text-emerald-400' : 'text-red-400'">
          <span v-if="currentResult.status === 'completed'" class="text-lg">&#10003;</span>
          <span v-else class="text-lg">&#8617;</span>
          {{ currentResult.status === 'completed' ? 'Saga Completed Successfully' : 'Saga Failed & Compensated' }}
        </h3>
        <code class="text-[10px] text-gray-500 font-mono">{{ currentResult.sagaId }}</code>
      </div>

      <div class="grid grid-cols-4 gap-3">
        <div class="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</p>
          <p class="text-sm font-bold" :class="currentResult.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'">
            {{ currentResult.status.toUpperCase() }}
          </p>
        </div>
        <div class="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</p>
          <p class="text-sm font-bold text-white">{{ currentResult.totalDuration }}ms</p>
        </div>
        <div class="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Steps Done</p>
          <p class="text-sm font-bold text-white">
            {{ currentResult.steps.filter((s: any) => s.status === 'completed').length }} / {{ currentResult.steps.length }}
          </p>
        </div>
        <div class="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Compensated</p>
          <p class="text-sm font-bold" :class="(currentResult.compensatedSteps || 0) > 0 ? 'text-amber-400' : 'text-gray-500'">
            {{ currentResult.compensatedSteps || 0 }} steps
          </p>
        </div>
      </div>

      <!-- Step details -->
      <div class="mt-3 space-y-1">
        <div v-for="(step, i) in currentResult.steps" :key="i"
          class="flex items-center gap-2 p-2 bg-slate-900/40 rounded border border-slate-700/30">
          <span class="text-[10px] font-bold w-4" :class="step.status === 'completed' ? 'text-emerald-400' : step.status === 'failed' ? 'text-red-400' : 'text-gray-500'">
            {{ step.status === 'completed' ? '✓' : step.status === 'failed' ? '✗' : '·' }}
          </span>
          <span class="text-[10px] text-gray-300 min-w-[120px]">{{ step.name }}</span>
          <span class="text-[10px] text-gray-500 min-w-[110px]">{{ step.service }}</span>
          <span v-if="step.duration" class="text-[9px] text-gray-500">{{ step.duration }}ms</span>
          <span v-if="step.error" class="text-[9px] text-red-400 ml-auto truncate max-w-[250px]">{{ step.error }}</span>
          <span v-if="step.compensationStatus === 'completed'" class="text-[9px] text-amber-400 ml-auto">&#8617; rolled back</span>
        </div>
      </div>
    </div>

    <!-- Saga History -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Saga History ({{ sagaHistory.length }})
        </h3>
        <div class="flex gap-2">
          <button @click="fetchHistory" class="text-xs text-cyan-400 hover:text-cyan-300">Refresh</button>
          <button v-if="sagaHistory.length > 0" @click="clearHistory" class="text-xs text-red-400 hover:text-red-300">Clear</button>
        </div>
      </div>

      <div v-if="sagaHistory.length === 0" class="text-center py-6">
        <p class="text-xs text-gray-500">No saga executions yet. Run a saga to see results here.</p>
      </div>

      <div v-else class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="saga in sagaHistory"
          :key="saga.sagaId"
          @click="currentResult = saga"
          class="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border cursor-pointer hover:border-cyan-500/30 transition-colors"
          :class="currentResult?.sagaId === saga.sagaId ? 'border-cyan-500/40' : 'border-slate-700/30'"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-2 h-2 rounded-full"
              :class="saga.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'"
            ></span>
            <div>
              <code class="text-[10px] text-gray-400 font-mono">{{ saga.sagaId }}</code>
              <p class="text-[10px] text-gray-500 mt-0.5">
                {{ saga.payload.customer }} — ${{ saga.payload.amount }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <span
              class="text-[10px] px-1.5 py-0.5 rounded"
              :class="saga.status === 'completed' ? 'bg-emerald-600/20 text-emerald-300' : 'bg-amber-600/20 text-amber-300'"
            >
              {{ saga.status }}
            </span>
            <p class="text-[9px] text-gray-500 mt-0.5">{{ saga.totalDuration }}ms</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const running = ref(false)
const currentStep = ref(0)
const currentResult = ref<any>(null)
const sagaHistory = ref<any[]>([])

const sagaSteps = [
  { name: 'Create Order', service: 'Order Service', queue: 'saga.order.create', compensationQueue: 'saga.order.cancel' },
  { name: 'Reserve Payment', service: 'Payment Service', queue: 'saga.payment.reserve', compensationQueue: 'saga.payment.refund' },
  { name: 'Reserve Inventory', service: 'Inventory Service', queue: 'saga.inventory.reserve', compensationQueue: 'saga.inventory.release' },
  { name: 'Confirm Shipping', service: 'Shipping Service', queue: 'saga.shipping.confirm', compensationQueue: 'saga.shipping.cancel' },
  { name: 'Send Notification', service: 'Notification Service', queue: 'saga.notification.send', compensationQueue: '' },
]

const config = ref({
  customer: 'John Doe',
  amount: 99.99,
  items: 3,
  stepDelayMs: 400,
  failAtStep: undefined as number | undefined,
})

function getStepStatus(i: number): string {
  if (!currentResult.value) return 'pending'
  return currentResult.value.steps[i]?.status || 'pending'
}

function getStepIcon(i: number): string {
  const status = getStepStatus(i)
  if (running.value && i === currentStep.value) return 'spin'
  if (status === 'completed') {
    if (currentResult.value?.steps[i]?.compensationStatus === 'completed') return 'undo'
    return 'check'
  }
  if (status === 'failed') return 'x'
  return 'number'
}

function getStepCircleClass(i: number): string {
  const status = getStepStatus(i)
  if (running.value && i === currentStep.value) return 'bg-cyan-600 text-white ring-2 ring-cyan-400/50'
  if (status === 'completed') {
    if (currentResult.value?.steps[i]?.compensationStatus === 'completed')
      return 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
    return 'bg-emerald-600 text-white'
  }
  if (status === 'failed') return 'bg-red-600 text-white'
  return 'bg-slate-700/50 text-gray-500 border border-slate-600'
}

function getConnectorClass(i: number): string {
  const status = getStepStatus(i)
  if (status === 'completed') {
    if (currentResult.value?.steps[i]?.compensationStatus === 'completed') return 'bg-amber-500/40'
    return 'bg-emerald-500/50'
  }
  if (status === 'failed') return 'bg-red-500/50'
  return 'bg-slate-700/50'
}

function getStepCardClass(i: number): string {
  const status = getStepStatus(i)
  if (running.value && i === currentStep.value) return 'bg-cyan-900/20 border-cyan-500/30'
  if (status === 'completed') {
    if (currentResult.value?.steps[i]?.compensationStatus === 'completed')
      return 'bg-amber-900/10 border-amber-500/20'
    return 'bg-emerald-900/10 border-emerald-500/20'
  }
  if (status === 'failed') return 'bg-red-900/10 border-red-500/20'
  return 'bg-slate-900/30 border-slate-700/30'
}

function getStepTextClass(i: number): string {
  const status = getStepStatus(i)
  if (status === 'completed') {
    if (currentResult.value?.steps[i]?.compensationStatus === 'completed') return 'text-amber-300'
    return 'text-emerald-300'
  }
  if (status === 'failed') return 'text-red-300'
  return 'text-gray-300'
}

async function runSaga() {
  running.value = true
  currentResult.value = null
  currentStep.value = 0

  try {
    // Animate steps client-side while waiting for server response
    const stepDelay = config.value.stepDelayMs
    const failAt = config.value.failAtStep
    const totalForwardSteps = failAt !== undefined ? failAt + 1 : sagaSteps.length

    // Start animation in background
    const animPromise = (async () => {
      for (let i = 0; i < totalForwardSteps; i++) {
        currentStep.value = i
        await new Promise((r) => setTimeout(r, stepDelay * 0.8))
      }
    })()

    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/saga/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: config.value.customer,
        amount: config.value.amount,
        items: config.value.items,
        failAtStep: config.value.failAtStep,
        stepDelayMs: config.value.stepDelayMs,
      }),
    })

    await animPromise // Wait for animation to finish

    if (res.ok) {
      currentResult.value = await res.json()
      if (currentResult.value.status === 'completed') {
        toast.success('Saga completed successfully!')
      } else {
        toast.error(`Saga failed at step ${(currentResult.value.failedAtStep || 0) + 1} — ${currentResult.value.compensatedSteps} steps compensated`)
      }
      await fetchHistory()
    } else {
      toast.error('Failed to run saga')
    }
  } catch {
    toast.error('Error running saga')
  } finally {
    running.value = false
  }
}

async function fetchHistory() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/saga/logs`)
    if (res.ok) {
      sagaHistory.value = await res.json()
    }
  } catch {}
}

async function clearHistory() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/saga/clear`, { method: 'POST' })
    sagaHistory.value = []
    currentResult.value = null
  } catch {}
}

onMounted(() => {
  fetchHistory()
})
</script>
