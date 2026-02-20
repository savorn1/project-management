<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Feature Flags</h1>
        <p class="text-gray-400 mt-1">Toggle features at runtime without deploying new code</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="seedDefaults"
          :disabled="seeding"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {{ seeding ? 'Seeding…' : 'Seed Defaults' }}
        </button>
        <button
          @click="showCreate = true"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New Flag
        </button>
      </div>
    </div>

    <!-- Concept card -->
    <div class="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs text-gray-400">
      <div class="flex gap-3">
        <span class="text-2xl">🚀</span>
        <div>
          <div class="font-semibold text-white mb-0.5">Deploy without risk</div>
          Merge code behind a disabled flag — it lives in production but does nothing until you flip it on.
        </div>
      </div>
      <div class="flex gap-3">
        <span class="text-2xl">🎯</span>
        <div>
          <div class="font-semibold text-white mb-0.5">Targeted rollout</div>
          Enable for 10% of users first. If no issues, increase to 100%. Rollback instantly by disabling.
        </div>
      </div>
      <div class="flex gap-3">
        <span class="text-2xl">🛡️</span>
        <div>
          <div class="font-semibold text-white mb-0.5">Kill switch</div>
          A single toggle disables a broken feature for all users — no hotfix, no redeploy needed.
        </div>
      </div>
    </div>

    <!-- Flag type legend -->
    <div class="flex gap-3 text-xs">
      <span v-for="t in flagTypes" :key="t.value" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" :class="t.badgeClass">
        <span>{{ t.icon }}</span> {{ t.label }}
      </span>
    </div>

    <!-- Flags list -->
    <div v-if="loading" class="text-center py-12 text-gray-500">Loading flags…</div>
    <div v-else-if="flags.length === 0" class="text-center py-12">
      <div class="text-4xl mb-3">🏳️</div>
      <div class="text-gray-400">No flags yet. Click <strong class="text-white">Seed Defaults</strong> to create example flags.</div>
    </div>

    <div v-else class="space-y-3">
      <!-- Group by category -->
      <div v-for="(group, category) in groupedFlags" :key="category">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>{{ category }}</span>
          <span class="text-gray-700">{{ group.length }} flag{{ group.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="flag in group"
            :key="flag.key"
            class="bg-slate-800/60 border rounded-xl p-4 transition-all duration-200"
            :class="flag.enabled ? 'border-emerald-500/30' : 'border-slate-700/50'"
          >
            <div class="flex items-center gap-4">
              <!-- Toggle switch -->
              <button
                @click="toggleFlag(flag.key)"
                :disabled="toggling === flag.key"
                class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
                :class="flag.enabled ? 'bg-emerald-500' : 'bg-slate-600'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  :class="flag.enabled ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>

              <!-- Flag info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-mono text-sm font-semibold text-white">{{ flag.key }}</span>
                  <span class="text-xs text-gray-500">·</span>
                  <span class="text-sm text-gray-300">{{ flag.name }}</span>
                  <!-- Type badge -->
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium border"
                    :class="typeBadgeClass(flag.type)"
                  >
                    {{ typeIcon(flag.type) }} {{ flag.type }}
                    <template v-if="flag.type === 'percentage'"> · {{ flag.percentage }}%</template>
                    <template v-if="flag.type === 'users'"> · {{ flag.userIds?.length ?? 0 }} users</template>
                  </span>
                  <!-- Status -->
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    :class="flag.enabled ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-700 text-gray-500'"
                  >{{ flag.enabled ? 'ENABLED' : 'DISABLED' }}</span>
                </div>
                <div v-if="flag.description" class="text-xs text-gray-500 mt-0.5">{{ flag.description }}</div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <!-- Evaluate test -->
                <button
                  @click="openEvaluate(flag)"
                  class="px-2 py-1 text-xs text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition-colors"
                  title="Test evaluation"
                >Evaluate</button>
                <button
                  @click="openEdit(flag)"
                  class="px-2 py-1 text-xs text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition-colors"
                >Edit</button>
                <button
                  @click="deleteFlag(flag.key)"
                  class="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 bg-slate-700/50 hover:bg-rose-900/30 rounded transition-colors"
                >Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showCreate || editFlag" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-white mb-4">{{ editFlag ? 'Edit Flag' : 'Create Feature Flag' }}</h3>
        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-400 block mb-1">Key <span class="text-gray-600">(slug, e.g. new-dashboard)</span></label>
            <input
              v-model="form.key"
              :disabled="!!editFlag"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              placeholder="my-feature"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Name</label>
            <input
              v-model="form.name"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="My Feature"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Description</label>
            <input
              v-model="form.description"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="What does this flag control?"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-1">Category</label>
            <input
              v-model="form.category"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="ui / features / ops / ai"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 block mb-2">Type</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="t in flagTypes"
                :key="t.value"
                @click="form.type = t.value"
                class="py-2 text-xs rounded-lg border font-medium transition-colors"
                :class="form.type === t.value ? t.activeClass : 'border-slate-700 text-gray-400 hover:text-white'"
              >{{ t.icon }} {{ t.label }}</button>
            </div>
          </div>
          <div v-if="form.type === 'percentage'">
            <label class="text-xs text-gray-400 block mb-1">Rollout Percentage: {{ form.percentage }}%</label>
            <input v-model.number="form.percentage" type="range" min="0" max="100" class="w-full accent-indigo-500" />
          </div>
          <div v-if="form.type === 'users'">
            <label class="text-xs text-gray-400 block mb-1">Allowed User IDs <span class="text-gray-600">(comma-separated)</span></label>
            <textarea
              v-model="userIdsText"
              rows="2"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="userId1, userId2, userId3"
            ></textarea>
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button @click="closeModal" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg">Cancel</button>
          <button @click="saveFlag" :disabled="saving" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg disabled:opacity-50">
            {{ saving ? 'Saving…' : (editFlag ? 'Save Changes' : 'Create Flag') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Evaluate Modal -->
    <div v-if="evaluateFlag" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-white mb-1">Evaluate Flag</h3>
        <div class="font-mono text-indigo-400 text-sm mb-4">{{ evaluateFlag.key }}</div>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400 block mb-1">User ID <span class="text-gray-600">(optional for boolean flags)</span></label>
            <input
              v-model="evalUserId"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="user-abc123"
            />
          </div>
          <button @click="runEvaluate" :disabled="evaluating" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg disabled:opacity-50">
            {{ evaluating ? 'Evaluating…' : 'Evaluate' }}
          </button>
          <!-- Result -->
          <div v-if="evalResult" class="bg-slate-800 rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">Result</span>
              <span
                class="text-sm font-bold"
                :class="evalResult.enabled ? 'text-emerald-400' : 'text-rose-400'"
              >{{ evalResult.enabled ? 'ENABLED' : 'DISABLED' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">Reason</span>
              <span class="text-xs font-mono text-gray-300">{{ evalResult.reason }}</span>
            </div>
          </div>
          <!-- Explanation -->
          <div class="text-xs text-gray-500 bg-slate-800/50 rounded-lg p-3 leading-relaxed">
            <div class="font-semibold text-gray-400 mb-1">How evaluation works</div>
            <div v-if="evaluateFlag.type === 'boolean'">Boolean flag — just checks if <code class="text-indigo-400">enabled = true</code>. No user context needed.</div>
            <div v-else-if="evaluateFlag.type === 'percentage'">Hashes the user ID to a bucket (1–100). If bucket ≤ {{ evaluateFlag.percentage }}%, the flag is enabled — same user always gets same result.</div>
            <div v-else>Checks if the user ID is in the explicit allowlist. Only listed users see this feature.</div>
          </div>
        </div>
        <button @click="evaluateFlag = null; evalResult = null" class="w-full mt-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg">Close</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeoMeta({
  title: 'Feature Flags | TaskFlow',
  description: 'Manage feature flags and runtime toggles',
})

const runtimeConfig = useRuntimeConfig()
const BASE = `${runtimeConfig.public.apiBase}/feature-flags`

// ─── Types ────────────────────────────────────────────────────────────────

interface FeatureFlag {
  _id: string
  key: string
  name: string
  description?: string
  enabled: boolean
  type: 'boolean' | 'percentage' | 'users'
  percentage: number
  userIds: string[]
  category: string
  createdAt: string
  updatedAt: string
}

// ─── State ────────────────────────────────────────────────────────────────

const flags = ref<FeatureFlag[]>([])
const loading = ref(true)
const seeding = ref(false)
const toggling = ref<string | null>(null)
const saving = ref(false)
const evaluating = ref(false)

const showCreate = ref(false)
const editFlag = ref<FeatureFlag | null>(null)
const evaluateFlag = ref<FeatureFlag | null>(null)
const evalUserId = ref('')
const evalResult = ref<{ enabled: boolean; reason: string } | null>(null)

const form = reactive({
  key: '',
  name: '',
  description: '',
  type: 'boolean' as 'boolean' | 'percentage' | 'users',
  percentage: 100,
  category: 'general',
})
const userIdsText = ref('')

const flagTypes = [
  {
    value: 'boolean' as const,
    label: 'Boolean',
    icon: '⚡',
    badgeClass: 'border-indigo-500/40 text-indigo-400 bg-indigo-900/20',
    activeClass: 'border-indigo-500 text-indigo-300 bg-indigo-900/40',
  },
  {
    value: 'percentage' as const,
    label: 'Percentage',
    icon: '📊',
    badgeClass: 'border-violet-500/40 text-violet-400 bg-violet-900/20',
    activeClass: 'border-violet-500 text-violet-300 bg-violet-900/40',
  },
  {
    value: 'users' as const,
    label: 'Users',
    icon: '👥',
    badgeClass: 'border-cyan-500/40 text-cyan-400 bg-cyan-900/20',
    activeClass: 'border-cyan-500 text-cyan-300 bg-cyan-900/40',
  },
]

// ─── Derived ──────────────────────────────────────────────────────────────

const groupedFlags = computed(() => {
  const groups: Record<string, FeatureFlag[]> = {}
  for (const flag of flags.value) {
    const cat = flag.category || 'general'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(flag)
  }
  return groups
})

// ─── API ──────────────────────────────────────────────────────────────────

async function loadFlags() {
  loading.value = true
  try {
    const res = await $fetch<{ data: FeatureFlag[] }>(BASE)
    flags.value = res.data
  } finally {
    loading.value = false
  }
}

async function seedDefaults() {
  seeding.value = true
  try {
    const res = await $fetch<{ data: FeatureFlag[] }>(`${BASE}/seed`, { method: 'POST' })
    flags.value = res.data
  } finally {
    seeding.value = false
  }
}

async function toggleFlag(key: string) {
  toggling.value = key
  try {
    const res = await $fetch<{ data: FeatureFlag }>(`${BASE}/${key}/toggle`, { method: 'PATCH' })
    const idx = flags.value.findIndex((f) => f.key === key)
    if (idx !== -1) flags.value[idx] = res.data
  } finally {
    toggling.value = null
  }
}

async function saveFlag() {
  saving.value = true
  try {
    if (editFlag.value) {
      const dto: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        type: form.type,
        percentage: form.percentage,
        category: form.category,
        userIds: form.type === 'users' ? userIdsText.value.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      const res = await $fetch<{ data: FeatureFlag }>(`${BASE}/${editFlag.value.key}`, { method: 'PUT', body: dto })
      const idx = flags.value.findIndex((f) => f.key === editFlag.value!.key)
      if (idx !== -1) flags.value[idx] = res.data
    } else {
      const dto: Record<string, unknown> = {
        key: form.key,
        name: form.name,
        description: form.description,
        type: form.type,
        percentage: form.percentage,
        category: form.category,
        userIds: form.type === 'users' ? userIdsText.value.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      const res = await $fetch<{ data: FeatureFlag }>(BASE, { method: 'POST', body: dto })
      flags.value.push(res.data)
    }
    closeModal()
  } finally {
    saving.value = false
  }
}

async function deleteFlag(key: string) {
  if (!confirm(`Delete flag "${key}"?`)) return
  await $fetch(`${BASE}/${key}`, { method: 'DELETE' })
  flags.value = flags.value.filter((f) => f.key !== key)
}

async function runEvaluate() {
  if (!evaluateFlag.value) return
  evaluating.value = true
  evalResult.value = null
  try {
    const params = evalUserId.value ? `?userId=${evalUserId.value}` : ''
    const res = await $fetch<{ enabled: boolean; reason: string }>(`${BASE}/${evaluateFlag.value.key}/evaluate${params}`)
    evalResult.value = res
  } finally {
    evaluating.value = false
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────

function openEdit(flag: FeatureFlag) {
  editFlag.value = flag
  form.key = flag.key
  form.name = flag.name
  form.description = flag.description ?? ''
  form.type = flag.type
  form.percentage = flag.percentage
  form.category = flag.category
  userIdsText.value = (flag.userIds ?? []).join(', ')
}

function openEvaluate(flag: FeatureFlag) {
  evaluateFlag.value = flag
  evalUserId.value = ''
  evalResult.value = null
}

function closeModal() {
  showCreate.value = false
  editFlag.value = null
  Object.assign(form, { key: '', name: '', description: '', type: 'boolean', percentage: 100, category: 'general' })
  userIdsText.value = ''
}

function typeBadgeClass(type: string) {
  const t = flagTypes.find((f) => f.value === type)
  return t?.badgeClass ?? ''
}

function typeIcon(type: string) {
  const t = flagTypes.find((f) => f.value === type)
  return t?.icon ?? ''
}

// ─── Init ─────────────────────────────────────────────────────────────────

onMounted(loadFlags)
</script>
