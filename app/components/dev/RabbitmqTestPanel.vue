<template>
  <div class="space-y-4">
    <!-- Connection Status -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          RabbitMQ Status
        </h3>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></div>
          <span class="text-xs" :class="connected ? 'text-emerald-400' : 'text-red-400'">
            {{ connected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
      <div v-if="activeConsumers.length > 0" class="mt-3 pt-3 border-t border-slate-700/30">
        <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Active Consumers</p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="q in activeConsumers"
            :key="q"
            class="px-2 py-0.5 text-[10px] bg-orange-600/20 text-orange-300 border border-orange-500/30 rounded"
          >
            {{ q }}
          </span>
        </div>
      </div>
    </div>

    <!-- Send to Queue (Direct) -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Send to Queue (Direct)
      </h3>
      <form @submit.prevent="sendToQueue" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Queue Name</label>
            <input v-model="directForm.queue" type="text" placeholder="e.g., task-queue"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Count</label>
            <input v-model.number="directForm.count" type="number" min="1" max="100"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Message (JSON)</label>
          <textarea v-model="directForm.message" rows="3" placeholder='{"task": "example", "priority": "high"}'
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y font-mono"></textarea>
        </div>
        <button type="submit" :disabled="sending || !connected"
          class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ sending ? 'Sending...' : `Send ${directForm.count > 1 ? directForm.count + ' Messages' : 'Message'}` }}
        </button>
      </form>
    </div>

    <!-- Publish to Exchange -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Publish to Exchange
      </h3>
      <form @submit.prevent="publishToExchange" class="space-y-3">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Exchange</label>
            <input v-model="exchangeForm.exchange" type="text" placeholder="task.events"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Routing Key</label>
            <input v-model="exchangeForm.routingKey" type="text" placeholder="task.assigned"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Type</label>
            <select v-model="exchangeForm.type"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
              <option value="topic">Topic</option>
              <option value="direct">Direct</option>
              <option value="fanout">Fanout</option>
              <option value="headers">Headers</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Message (JSON)</label>
          <textarea v-model="exchangeForm.message" rows="3" placeholder='{"event": "task.assigned", "data": {}}'
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y font-mono"></textarea>
        </div>
        <button type="submit" :disabled="sending || !connected"
          class="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ sending ? 'Publishing...' : 'Publish to Exchange' }}
        </button>
      </form>
    </div>

    <!-- Bind + Consume -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Bind Queue & Start Consumer
      </h3>
      <form @submit.prevent="bindAndConsume" class="space-y-3">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Queue</label>
            <input v-model="bindForm.queue" type="text" placeholder="email-notifications"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Exchange</label>
            <input v-model="bindForm.exchange" type="text" placeholder="task.events"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Routing Key</label>
            <input v-model="bindForm.routingKey" type="text" placeholder="task.*"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="flex gap-2">
          <button type="submit" :disabled="sending || !connected"
            class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Bind & Consume
          </button>
          <button type="button" @click="cancelConsumer" :disabled="!connected"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Exchange Type Demos -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
      <h3 class="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Exchange Type Demos
      </h3>

      <!-- Demo Tabs -->
      <div class="flex gap-1 bg-slate-900/50 rounded-lg p-1 mb-4">
        <button v-for="dt in demoTabs" :key="dt.key" @click="activeDemoTab = dt.key"
          class="flex-1 text-[11px] font-medium py-2 px-2 rounded-md transition-all duration-200"
          :class="activeDemoTab === dt.key ? `${dt.activeClass} text-white shadow-lg` : 'text-gray-400 hover:text-white'">
          {{ dt.label }}
        </button>
      </div>

      <!-- 1. DIRECT Exchange Demo -->
      <div v-if="activeDemoTab === 'direct'" class="space-y-3">
        <p class="text-xs text-gray-400">
          <span class="text-blue-400 font-semibold">Direct</span> exchange routes messages to queues where
          <code class="text-blue-300">routing_key = binding_key</code> (exact match).
        </p>
        <!-- Flow Diagram -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-blue-500/20">
          <div class="flex items-center gap-2 text-[10px] font-mono">
            <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded border border-blue-500/30">Producer</span>
            <span class="text-gray-500">→</span>
            <span class="px-2 py-1 bg-blue-600/20 text-blue-200 rounded border border-blue-400/30">[Direct Exchange]</span>
            <span class="text-gray-500">→</span>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <code class="text-yellow-400">order.paid</code>
                <span class="text-gray-500">→</span>
                <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">billing-service</span>
              </div>
              <div class="flex items-center gap-1">
                <code class="text-yellow-400">order.shipped</code>
                <span class="text-gray-500">→</span>
                <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">shipping-service</span>
              </div>
              <div class="flex items-center gap-1">
                <code class="text-yellow-400">order.cancelled</code>
                <span class="text-gray-500">→</span>
                <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">refund-service</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="runDemo('direct')" :disabled="demoRunning || !connected"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ demoRunning ? 'Running...' : 'Run Direct Exchange Demo' }}
        </button>
        <!-- Results -->
        <div v-if="demoResults.direct" class="space-y-2">
          <p class="text-xs text-gray-300 font-medium">{{ demoResults.direct.description }}</p>
          <div class="space-y-1">
            <div v-for="pub in demoResults.direct.published" :key="pub.routingKey"
              class="flex items-center gap-2 p-2 bg-slate-900/40 rounded border border-slate-700/30">
              <code class="text-[10px] text-yellow-400 font-mono min-w-[110px]">{{ pub.routingKey }}</code>
              <span class="text-gray-500 text-[10px]">→</span>
              <span class="px-1.5 py-0.5 text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded">
                {{ pub.deliveredTo }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. FANOUT Exchange Demo -->
      <div v-if="activeDemoTab === 'fanout'" class="space-y-3">
        <p class="text-xs text-gray-400">
          <span class="text-pink-400 font-semibold">Fanout</span> exchange broadcasts to
          <code class="text-pink-300">ALL</code> bound queues — routing key is completely ignored.
        </p>
        <!-- Flow Diagram -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-pink-500/20">
          <div class="flex items-start gap-2 text-[10px] font-mono">
            <span class="px-2 py-1 bg-pink-600/30 text-pink-300 rounded border border-pink-500/30 mt-4">user.registered</span>
            <span class="text-gray-500 mt-5">→</span>
            <span class="px-2 py-1 bg-pink-600/20 text-pink-200 rounded border border-pink-400/30 mt-4">[Fanout Exchange]</span>
            <span class="text-gray-500 mt-5">→</span>
            <div class="flex flex-col gap-1">
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">send-welcome-email</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">create-default-project</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">notify-admin-slack</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">analytics-tracking</span>
            </div>
          </div>
        </div>
        <button @click="runDemo('fanout')" :disabled="demoRunning || !connected"
          class="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ demoRunning ? 'Running...' : 'Run Fanout Exchange Demo' }}
        </button>
        <div v-if="demoResults.fanout" class="space-y-2">
          <p class="text-xs text-gray-300 font-medium">{{ demoResults.fanout.description }}</p>
          <div class="p-2 bg-slate-900/40 rounded border border-slate-700/30">
            <p class="text-[10px] text-gray-400 mb-1.5">1 message delivered to ALL queues:</p>
            <div class="flex flex-wrap gap-1">
              <span v-for="q in demoResults.fanout.deliveredTo" :key="q"
                class="px-1.5 py-0.5 text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded">
                {{ q }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TOPIC Exchange Demo -->
      <div v-if="activeDemoTab === 'topic'" class="space-y-3">
        <p class="text-xs text-gray-400">
          <span class="text-amber-400 font-semibold">Topic</span> exchange uses pattern matching:
          <code class="text-amber-300">*</code> = one word, <code class="text-amber-300">#</code> = zero or more words.
        </p>
        <!-- Flow Diagram -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-amber-500/20">
          <div class="text-[10px] font-mono space-y-1.5">
            <div class="flex items-center gap-2 text-gray-400 mb-2">
              <span class="px-2 py-1 bg-amber-600/20 text-amber-200 rounded border border-amber-400/30">[Topic Exchange: logs]</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="min-w-[90px] text-gray-500 text-right">Binding:</span>
              <code class="text-amber-400 min-w-[120px]">app.*.error</code>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-red-600/20 text-red-300 rounded text-[9px]">error-alerts</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="min-w-[90px] text-gray-500 text-right">Binding:</span>
              <code class="text-amber-400 min-w-[120px]">app.payment.#</code>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-violet-600/20 text-violet-300 rounded text-[9px]">payment-monitor</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="min-w-[90px] text-gray-500 text-right">Binding:</span>
              <code class="text-amber-400 min-w-[120px]">#</code>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-slate-600/40 text-gray-300 rounded text-[9px]">log-archive</span>
            </div>
          </div>
        </div>
        <button @click="runDemo('topic')" :disabled="demoRunning || !connected"
          class="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ demoRunning ? 'Running...' : 'Run Topic Exchange Demo' }}
        </button>
        <div v-if="demoResults.topic" class="space-y-2">
          <p class="text-xs text-gray-300 font-medium">{{ demoResults.topic.description }}</p>
          <div class="space-y-1">
            <div v-for="pub in demoResults.topic.published" :key="pub.routingKey"
              class="p-2 bg-slate-900/40 rounded border border-slate-700/30">
              <div class="flex items-center gap-2 mb-1">
                <code class="text-[10px] text-amber-400 font-mono">{{ pub.routingKey }}</code>
                <span class="text-gray-500 text-[10px]">→</span>
                <div class="flex flex-wrap gap-1">
                  <span v-for="q in pub.deliveredTo" :key="q"
                    class="px-1.5 py-0.5 text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded">
                    {{ q }}
                  </span>
                  <span v-if="pub.deliveredTo.length === 0" class="text-[9px] text-gray-500">no match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. HEADERS Exchange Demo -->
      <div v-if="activeDemoTab === 'headers'" class="space-y-3">
        <p class="text-xs text-gray-400">
          <span class="text-teal-400 font-semibold">Headers</span> exchange routes by message
          <code class="text-teal-300">header attributes</code> — not routing key.
          <code class="text-teal-300">x-match: all</code> = ALL headers must match,
          <code class="text-teal-300">x-match: any</code> = ANY header can match.
        </p>
        <!-- Flow Diagram -->
        <div class="p-3 bg-slate-900/60 rounded-lg border border-teal-500/20">
          <div class="text-[10px] font-mono space-y-1.5">
            <div class="flex items-center gap-2 text-gray-400 mb-2">
              <span class="px-2 py-1 bg-teal-600/20 text-teal-200 rounded border border-teal-400/30">[Headers Exchange: reports]</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 bg-teal-600/10 text-teal-300 rounded border border-teal-500/20 text-[9px]">format=pdf</span>
              <span class="text-gray-500 text-[9px]">x-match: any</span>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">pdf-printer</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 bg-teal-600/10 text-teal-300 rounded border border-teal-500/20 text-[9px]">dept=finance, format=pdf</span>
              <span class="text-gray-500 text-[9px]">x-match: all</span>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">finance-archive</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 bg-teal-600/10 text-teal-300 rounded border border-teal-500/20 text-[9px]">dept=hr</span>
              <span class="text-gray-500 text-[9px]">x-match: all</span>
              <span class="text-gray-500">→</span>
              <span class="px-1.5 py-0.5 bg-emerald-600/20 text-emerald-300 rounded text-[9px]">hr-reports</span>
            </div>
          </div>
        </div>
        <button @click="runDemo('headers')" :disabled="demoRunning || !connected"
          class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ demoRunning ? 'Running...' : 'Run Headers Exchange Demo' }}
        </button>
        <div v-if="demoResults.headers" class="space-y-2">
          <p class="text-xs text-gray-300 font-medium">{{ demoResults.headers.description }}</p>
          <div class="space-y-1">
            <div v-for="pub in demoResults.headers.published" :key="pub.label"
              class="p-2 bg-slate-900/40 rounded border border-slate-700/30">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[10px] text-white font-medium">{{ pub.label }}</span>
                <div class="flex gap-1">
                  <span v-for="(v, k) in pub.headers" :key="k"
                    class="px-1 py-0.5 text-[9px] bg-teal-600/20 text-teal-300 border border-teal-500/20 rounded">
                    {{ k }}={{ v }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-gray-500">Delivered to:</span>
                <span v-for="q in pub.deliveredTo" :key="q"
                  class="px-1.5 py-0.5 text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded">
                  {{ q }}
                </span>
                <span v-if="pub.deliveredTo.length === 0" class="text-[9px] text-gray-500">no match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Queue Inspector -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Queue Inspector
      </h3>
      <div class="flex gap-2 mb-3">
        <input v-model="inspectQueue" type="text" placeholder="Queue name..."
          class="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        <button @click="inspectQueueStats" :disabled="!connected || !inspectQueue"
          class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
          Inspect
        </button>
        <button @click="purgeInspectedQueue" :disabled="!connected || !inspectQueue"
          class="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
          Purge
        </button>
      </div>
      <div v-if="queueStats" class="grid grid-cols-3 gap-3">
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Queue</p>
          <code class="text-sm text-orange-400 font-mono">{{ queueStats.name }}</code>
        </div>
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Messages</p>
          <p class="text-lg font-bold text-white">{{ queueStats.messageCount }}</p>
        </div>
        <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Consumers</p>
          <p class="text-lg font-bold text-emerald-400">{{ queueStats.consumerCount }}</p>
        </div>
      </div>
    </div>

    <!-- Consumed Messages Log -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Consumed Messages ({{ consumedMessages.length }})
        </h3>
        <div class="flex gap-2">
          <button @click="fetchConsumed" class="text-xs text-indigo-400 hover:text-indigo-300">Refresh</button>
          <button v-if="consumedMessages.length > 0" @click="clearConsumed" class="text-xs text-red-400 hover:text-red-300">Clear</button>
        </div>
      </div>

      <div v-if="consumedMessages.length === 0" class="text-center py-8">
        <p class="text-xs text-gray-500">No consumed messages yet. Start a consumer and send messages to see them here.</p>
      </div>

      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div v-for="(msg, index) in consumedMessages.slice().reverse()" :key="index"
          class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <div class="flex items-center justify-between mb-1">
            <span class="inline-flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 text-[9px] bg-orange-600/20 text-orange-300 border border-orange-500/30 rounded">{{ msg.queue }}</span>
              <span v-if="msg.acked" class="text-[9px] text-emerald-500">ACK</span>
            </span>
            <span class="text-[10px] text-gray-500">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <pre class="text-xs text-gray-400 font-mono overflow-x-auto mt-1">{{ formatContent(msg.content) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const sending = ref(false)
const connected = ref(false)
const activeConsumers = ref<string[]>([])
const consumedMessages = ref<any[]>([])
const queueStats = ref<{ name: string; messageCount: number; consumerCount: number } | null>(null)
const inspectQueue = ref('task-queue')
const directForm = ref({
  queue: 'task-queue',
  message: '{"task": "Fix login bug", "priority": "high", "assignee": "John"}',
  count: 1,
})

const exchangeForm = ref({
  exchange: 'task.events',
  routingKey: 'task.assigned',
  type: 'topic' as 'direct' | 'fanout' | 'topic' | 'headers',
  message: '{"event": "task.assigned", "taskTitle": "Fix login bug", "assignee": "John Doe"}',
})

const bindForm = ref({
  queue: 'email-notifications',
  exchange: 'task.events',
  routingKey: 'task.*',
})

type DemoType = 'direct' | 'fanout' | 'topic' | 'headers'
const activeDemoTab = ref<DemoType>('direct')
const demoRunning = ref(false)
const demoResults = ref<Record<string, any>>({})

const demoTabs = [
  { key: 'direct' as DemoType, label: 'Direct', activeClass: 'bg-blue-600' },
  { key: 'fanout' as DemoType, label: 'Fanout', activeClass: 'bg-pink-600' },
  { key: 'topic' as DemoType, label: 'Topic', activeClass: 'bg-amber-600' },
  { key: 'headers' as DemoType, label: 'Headers', activeClass: 'bg-teal-600' },
]

async function fetchStatus() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/status`)
    if (res.ok) {
      const data = await res.json()
      connected.value = data.connected
      activeConsumers.value = data.activeConsumers || []
    }
  } catch { connected.value = false }
}

async function fetchConsumed() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/consumed`)
    if (res.ok) {
      const data = await res.json()
      consumedMessages.value = data.messages || []
      activeConsumers.value = data.activeConsumers || []
    }
  } catch {}
}

async function sendToQueue() {
  sending.value = true
  try {
    if (directForm.value.count > 1) {
      const messages = Array.from({ length: directForm.value.count }, (_, i) => {
        const parsed = JSON.parse(directForm.value.message)
        return JSON.stringify({ ...parsed, index: i + 1, sentAt: new Date().toISOString() })
      })
      const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/send-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: directForm.value.queue, messages }),
      })
      if (res.ok) toast.success(`Sent ${directForm.value.count} messages to "${directForm.value.queue}"`)
      else toast.error('Failed to send')
    } else {
      const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: directForm.value.queue, message: directForm.value.message }),
      })
      if (res.ok) toast.success(`Sent to "${directForm.value.queue}"`)
      else toast.error('Failed to send')
    }
  } catch { toast.error('Error sending message') }
  finally { sending.value = false }
}

async function publishToExchange() {
  sending.value = true
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exchangeForm.value),
    })
    if (res.ok) toast.success(`Published to "${exchangeForm.value.exchange}" [${exchangeForm.value.routingKey}]`)
    else toast.error('Failed to publish')
  } catch { toast.error('Error publishing') }
  finally { sending.value = false }
}

async function bindAndConsume() {
  sending.value = true
  try {
    // Bind
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queue: bindForm.value.queue,
        exchange: bindForm.value.exchange,
        routingKey: bindForm.value.routingKey,
      }),
    })

    // Start consumer
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue: bindForm.value.queue }),
    })

    if (res.ok) {
      toast.success(`Consuming from "${bindForm.value.queue}" (bound to ${bindForm.value.exchange})`)
      await fetchStatus()
    } else {
      toast.error('Failed to bind/consume')
    }
  } catch { toast.error('Error binding') }
  finally { sending.value = false }
}

async function cancelConsumer() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/consume/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue: bindForm.value.queue }),
    })
    if (res.ok) {
      toast.info(`Consumer cancelled for "${bindForm.value.queue}"`)
      await fetchStatus()
    }
  } catch { toast.error('Error cancelling consumer') }
}

async function runDemo(type: DemoType) {
  demoRunning.value = true
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/demo/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      demoResults.value[type] = await res.json()
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exchange demo executed!`)
      setTimeout(() => fetchConsumed(), 500)
      await fetchStatus()
    } else {
      toast.error('Demo failed')
    }
  } catch { toast.error('Error running demo') }
  finally { demoRunning.value = false }
}

async function inspectQueueStats() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/queue/${inspectQueue.value}/stats`)
    if (res.ok) queueStats.value = await res.json()
    else toast.error('Queue not found')
  } catch { toast.error('Error inspecting queue') }
}

async function purgeInspectedQueue() {
  try {
    const res = await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/queue/${inspectQueue.value}/purge`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      toast.info(`Purged ${data.purgedCount} messages from "${inspectQueue.value}"`)
      await inspectQueueStats()
    }
  } catch { toast.error('Error purging queue') }
}

async function clearConsumed() {
  try {
    await fetch(`${runtimeConfig.public.apiBase}/rabbitmq/consumed/clear`, { method: 'POST' })
    consumedMessages.value = []
  } catch {}
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function formatContent(content: string) {
  try { return JSON.stringify(JSON.parse(content), null, 2) }
  catch { return content }
}

let pollingInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchStatus()
  fetchConsumed()
  // Poll consumed messages every 2s when active
  pollingInterval = setInterval(fetchConsumed, 2000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>
