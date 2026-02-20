<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Redis Cache Demo</h2>
          <p class="text-sm text-gray-400 mt-0.5">
            Cache-aside pattern — first call hits the DB, every subsequent call returns from Redis instantly
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="resetStats" class="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg">Reset Stats</button>
          <button @click="flushCache" class="px-3 py-1.5 text-xs bg-rose-700/60 hover:bg-rose-700 text-rose-300 rounded-lg">Flush Cache</button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-5 gap-3">
        <div class="bg-slate-900/60 rounded-lg p-3 text-center border border-emerald-500/20">
          <div class="text-xs text-gray-500 mb-1">Cache Hits</div>
          <div class="text-2xl font-bold text-emerald-400">{{ cacheStats.hits }}</div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 text-center border border-rose-500/20">
          <div class="text-xs text-gray-500 mb-1">Cache Misses</div>
          <div class="text-2xl font-bold text-rose-400">{{ cacheStats.misses }}</div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 text-center border border-indigo-500/20">
          <div class="text-xs text-gray-500 mb-1">Hit Rate</div>
          <div class="text-2xl font-bold text-indigo-400">{{ cacheStats.hitRate }}%</div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 text-center border border-violet-500/20">
          <div class="text-xs text-gray-500 mb-1">Cached Keys</div>
          <div class="text-2xl font-bold text-violet-400">{{ cacheStats.keyCount }}</div>
        </div>
        <div class="bg-slate-900/60 rounded-lg p-3 text-center" :class="cacheStats.isConnected ? 'border-emerald-500/30' : 'border-rose-500/30'">
          <div class="text-xs text-gray-500 mb-1">Redis</div>
          <div class="text-sm font-bold" :class="cacheStats.isConnected ? 'text-emerald-400' : 'text-rose-400'">
            {{ cacheStats.isConnected ? 'Connected' : 'Disconnected' }}
          </div>
        </div>
      </div>

      <!-- Hit rate bar -->
      <div class="mt-3">
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>Hit rate</span>
          <span>{{ cacheStats.hitRate }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="cacheStats.hitRate >= 80 ? 'bg-emerald-500' : cacheStats.hitRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'"
            :style="{ width: cacheStats.hitRate + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Cache-aside demo -->
    <div class="grid grid-cols-2 gap-4">

      <!-- Demo: slow query -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-white mb-1">Cache-Aside Demo</h3>
        <p class="text-xs text-gray-500 mb-4">
          Simulates an expensive 800ms DB query. First call is slow; all subsequent calls return instantly from Redis.
        </p>

        <div class="bg-slate-900/50 rounded-lg p-3 mb-4 text-xs font-mono text-gray-400 leading-relaxed">
          <span class="text-violet-400">// Cache-aside pattern</span><br/>
          <span class="text-blue-400">const</span> data = <span class="text-yellow-300">await</span> cacheService.<span class="text-emerald-400">getOrSet</span>(<br/>
          &nbsp;&nbsp;<span class="text-orange-300">'tasks:project:123'</span>,<br/>
          &nbsp;&nbsp;<span class="text-yellow-300">() =></span> db.<span class="text-emerald-400">findTasks</span>(projectId),<br/>
          &nbsp;&nbsp;<span class="text-blue-400">60</span>, <span class="text-violet-400">// TTL seconds</span><br/>
          );
        </div>

        <button
          @click="runSlowQuery"
          :disabled="querying"
          class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {{ querying ? 'Fetching…' : 'Fetch Data' }}
        </button>

        <!-- Last result -->
        <div v-if="lastResult" class="mt-3 bg-slate-900/60 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Source</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-semibold"
              :class="lastResult.source === 'cache' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-900/60 text-amber-400'"
            >{{ lastResult.source === 'cache' ? '⚡ Redis cache' : '🗄️ Database' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Latency</span>
            <span class="text-sm font-bold" :class="lastResult.latencyMs < 50 ? 'text-emerald-400' : 'text-amber-400'">
              {{ lastResult.latencyMs }}ms
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">TTL remaining</span>
            <span class="text-xs text-gray-300">{{ lastResult.ttl }}s</span>
          </div>
        </div>

        <!-- Call history mini chart -->
        <div v-if="callHistory.length > 0" class="mt-3">
          <div class="text-xs text-gray-500 mb-1">Last {{ callHistory.length }} calls</div>
          <div class="flex gap-0.5 items-end h-10">
            <div
              v-for="(call, i) in callHistory"
              :key="i"
              class="flex-1 rounded-sm min-w-[6px] transition-all"
              :class="call.source === 'cache' ? 'bg-emerald-500' : 'bg-amber-500'"
              :style="{ height: Math.min((call.latencyMs / 900) * 100, 100) + '%' }"
              :title="`${call.source}: ${call.latencyMs}ms`"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mt-1">
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span>cache hit</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-amber-500 rounded-sm inline-block"></span>db miss</span>
          </div>
        </div>
      </div>

      <!-- Manual operations -->
      <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-white mb-3">Manual Operations</h3>

        <!-- Set -->
        <div class="space-y-2 mb-4">
          <div class="text-xs text-gray-400 font-semibold">SET key/value</div>
          <div class="flex gap-2">
            <input v-model="manualKey" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="cache-key" />
            <input v-model="manualTtl" type="number" class="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="TTL" />
          </div>
          <textarea v-model="manualValue" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" placeholder='{"data": "value"}'></textarea>
          <button @click="manualSet" class="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded-lg">SET</button>
        </div>

        <!-- Get -->
        <div class="space-y-2 mb-4">
          <div class="text-xs text-gray-400 font-semibold">GET by key</div>
          <div class="flex gap-2">
            <input v-model="getKey" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="cache-key" />
            <button @click="manualGet" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded-lg">GET</button>
          </div>
          <div v-if="getResult !== undefined" class="bg-slate-900/60 rounded p-2 text-xs font-mono text-gray-300 break-all">
            {{ getResult === null ? '(nil) — cache miss' : JSON.stringify(getResult, null, 2) }}
          </div>
        </div>

        <!-- Invalidate -->
        <div class="space-y-2 mb-4">
          <div class="text-xs text-gray-400 font-semibold">DEL by pattern (glob)</div>
          <div class="flex gap-2">
            <input v-model="delPattern" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" placeholder="tasks:project:*" />
            <button @click="invalidatePattern" class="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs rounded-lg">DEL</button>
          </div>
          <div v-if="delResult !== null" class="text-xs text-rose-400">{{ delResult }}</div>
        </div>

        <!-- Warm-up -->
        <button @click="warmupCache" class="w-full py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs rounded-lg">
          Warm-up Cache (pre-populate 3 keys)
        </button>
      </div>
    </div>

    <!-- Cached keys browser -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white">Cached Keys</h3>
        <div class="flex gap-2">
          <input v-model="keyPattern" class="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 w-36" placeholder="Pattern: *" />
          <button @click="loadKeys" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs rounded-lg">Refresh</button>
        </div>
      </div>
      <div v-if="cachedKeys.length === 0" class="text-center py-6 text-gray-600 text-sm">No cached keys</div>
      <div v-else class="space-y-1 max-h-48 overflow-y-auto">
        <div
          v-for="item in cachedKeys"
          :key="item.key"
          class="flex items-center gap-3 text-xs bg-slate-900/50 rounded px-3 py-2"
        >
          <span class="font-mono text-indigo-300 flex-1">{{ item.key }}</span>
          <span class="text-gray-500">TTL: </span>
          <span :class="item.ttl < 10 ? 'text-rose-400' : item.ttl < 30 ? 'text-amber-400' : 'text-emerald-400'">{{ item.ttl }}s</span>
          <button @click="deleteKey(item.key)" class="text-gray-600 hover:text-rose-400 transition-colors">✕</button>
        </div>
      </div>
    </div>

    <!-- Strategy explainer -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <h3 class="text-sm font-semibold text-white mb-3">Caching Strategies</h3>
      <div class="grid grid-cols-3 gap-3 text-xs">
        <div class="bg-slate-900/50 rounded-lg p-3">
          <div class="font-semibold text-emerald-400 mb-1">Cache-Aside (Lazy)</div>
          <div class="text-gray-400 leading-relaxed">App checks cache → miss → fetch DB → store → return. Cache is populated on demand. <em class="text-gray-500">Used in this project.</em></div>
        </div>
        <div class="bg-slate-900/50 rounded-lg p-3">
          <div class="font-semibold text-blue-400 mb-1">Write-Through</div>
          <div class="text-gray-400 leading-relaxed">Every write goes to cache AND DB simultaneously. Cache is always fresh but writes are slower. Good for read-heavy data.</div>
        </div>
        <div class="bg-slate-900/50 rounded-lg p-3">
          <div class="font-semibold text-violet-400 mb-1">Write-Behind (Async)</div>
          <div class="text-gray-400 leading-relaxed">Write to cache immediately, flush to DB asynchronously later. Fastest writes but risk of data loss on crash.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const BASE = `${runtimeConfig.public.apiBase}/cache`

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  hitRate: number
  keyCount: number
  isConnected: boolean
}

interface KeyEntry { key: string; ttl: number }
interface CallEntry { source: 'cache' | 'database'; latencyMs: number }
interface QueryResult { data: unknown; source: 'cache' | 'database'; latencyMs: number; ttl: number }

const cacheStats = reactive<CacheStats>({ hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0, keyCount: 0, isConnected: false })
const cachedKeys = ref<KeyEntry[]>([])
const callHistory = ref<CallEntry[]>([])
const lastResult = ref<QueryResult | null>(null)

const querying = ref(false)
const manualKey = ref('my-test-key')
const manualValue = ref('{"hello": "world"}')
const manualTtl = ref(60)
const getKey = ref('')
const getResult = ref<unknown>(undefined)
const delPattern = ref('demo:*')
const delResult = ref<string | null>(null)
const keyPattern = ref('*')

// ─── API calls ────────────────────────────────────────────────────────────

async function loadStats() {
  try {
    const s = await $fetch<CacheStats>(`${BASE}/stats`)
    Object.assign(cacheStats, s)
  } catch { /* ignore */ }
}

async function loadKeys() {
  try {
    const res = await $fetch<{ keys: KeyEntry[] }>(`${BASE}/keys?pattern=${keyPattern.value}`)
    cachedKeys.value = res.keys
  } catch { /* ignore */ }
}

async function runSlowQuery() {
  querying.value = true
  try {
    const result = await $fetch<QueryResult>(`${BASE}/demo/slow-query`)
    lastResult.value = result
    callHistory.value.push({ source: result.source, latencyMs: result.latencyMs })
    if (callHistory.value.length > 20) callHistory.value.shift()
    await loadStats()
    await loadKeys()
  } finally {
    querying.value = false
  }
}

async function manualSet() {
  try {
    let val: unknown
    try { val = JSON.parse(manualValue.value) } catch { val = manualValue.value }
    await $fetch(`${BASE}/set`, { method: 'POST', body: { key: manualKey.value, value: val, ttl: manualTtl.value } })
    await loadStats()
    await loadKeys()
  } catch { /* ignore */ }
}

async function manualGet() {
  try {
    const res = await $fetch<{ value: unknown }>(`${BASE}/get/${getKey.value}`)
    getResult.value = res.value
    await loadStats()
  } catch { /* ignore */ }
}

async function invalidatePattern() {
  try {
    const res = await $fetch<{ deletedCount: number; pattern: string }>(`${BASE}/pattern`, {
      method: 'DELETE',
      body: { pattern: delPattern.value },
    })
    delResult.value = `Deleted ${res.deletedCount} key(s) matching "${res.pattern}"`
    await loadStats()
    await loadKeys()
  } catch { /* ignore */ }
}

async function deleteKey(key: string) {
  await $fetch(`${BASE}/key/${key}`, { method: 'DELETE' })
  await loadStats()
  await loadKeys()
}

async function warmupCache() {
  await $fetch(`${BASE}/demo/warmup`, { method: 'POST' })
  await loadStats()
  await loadKeys()
}

async function flushCache() {
  if (!confirm('Flush entire cache?')) return
  await $fetch(`${BASE}/flush`, { method: 'DELETE' })
  await loadStats()
  await loadKeys()
  lastResult.value = null
  callHistory.value = []
}

async function resetStats() {
  await $fetch(`${BASE}/stats/reset`, { method: 'POST' })
  await loadStats()
}

// ─── Init + polling ───────────────────────────────────────────────────────

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadStats()
  loadKeys()
  timer = setInterval(loadStats, 3000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>
