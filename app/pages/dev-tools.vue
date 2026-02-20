<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Developer Tools</h1>
        <p class="text-gray-400 mt-1">Test real-time features, Redis pub/sub, and WebSocket connections</p>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"
        ></div>
        <span :class="isConnected ? 'text-emerald-400' : 'text-red-400'" class="text-sm font-medium">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-800/50 rounded-lg p-1">
      <button
        @click="activeTab = 'testing'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'testing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'"
      >
        Redis Testing
      </button>
      <button
        @click="activeTab = 'nats'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'nats' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-gray-400 hover:text-white'"
      >
        NATS Testing
      </button>
      <button
        @click="activeTab = 'loadtest'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'loadtest' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'"
      >
        Load Testing
      </button>
      <button
        @click="activeTab = 'spike'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'spike' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-gray-400 hover:text-white'"
      >
        Spike Testing
      </button>
      <button
        @click="activeTab = 'rabbitmq'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'rabbitmq' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-white'"
      >
        RabbitMQ
      </button>
      <button
        @click="activeTab = 'saga'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'saga' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-400 hover:text-white'"
      >
        Saga
      </button>
      <button
        @click="activeTab = 'dlq'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'dlq' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-gray-400 hover:text-white'"
      >
        DLQ
      </button>
      <button
        @click="activeTab = 'outbox'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'outbox' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-gray-400 hover:text-white'"
      >
        Outbox
      </button>
      <button
        @click="activeTab = 'cb'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'cb' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-400 hover:text-white'"
      >
        Circuit Breaker
      </button>
      <button
        @click="activeTab = 'bp'"
        class="flex-1 text-sm font-medium py-2.5 px-4 rounded-md transition-all duration-200"
        :class="activeTab === 'bp' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-gray-400 hover:text-white'"
      >
        Backpressure
      </button>
    </div>

    <!-- Tab Content -->
    <DevToolsForm v-if="activeTab === 'testing'" />
    <NatsTestPanel v-else-if="activeTab === 'nats'" />
    <LoadTestPanel v-else-if="activeTab === 'loadtest'" />
    <SpikeTestPanel v-else-if="activeTab === 'spike'" />
    <RabbitmqTestPanel v-else-if="activeTab === 'rabbitmq'" />
    <SagaTestPanel v-else-if="activeTab === 'saga'" />
    <DlqTestPanel v-else-if="activeTab === 'dlq'" />
    <OutboxTestPanel v-else-if="activeTab === 'outbox'" />
    <CircuitBreakerTestPanel v-else-if="activeTab === 'cb'" />
    <BackpressureTestPanel v-else-if="activeTab === 'bp'" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dev Tools | TaskFlow',
  description: 'Developer tools for testing real-time features'
})

const socket = useSocket()
const isConnected = computed(() => socket.isConnected.value)

const activeTab = ref<'testing' | 'nats' | 'loadtest' | 'spike' | 'rabbitmq' | 'saga' | 'dlq' | 'outbox' | 'cb' | 'bp'>('testing')
</script>
