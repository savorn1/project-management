<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Fund Pools</h1>
        <p class="text-gray-400 mt-1">Manage scheduled fund pools and their configurations</p>
      </div>
      <BaseButton @click="toggleCreateForm">
        <svg class="w-4 h-4 transition-transform duration-200" :class="showCreateForm ? 'rotate-45' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ showCreateForm ? 'Cancel' : 'New Fund Pool' }}
      </BaseButton>
    </div>

    <!-- Inline Create Form -->
    <BaseCard v-if="showCreateForm" class="border border-indigo-500/30">
      <h2 class="text-white font-semibold mb-5">New Fund Pool</h2>
      <form @submit.prevent="handleCreate" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Type -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Type</label>
          <select
            v-model="createForm.type"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/60 text-sm"
            required
          >
            <option v-for="t in poolTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <!-- Name -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Name</label>
          <input
            v-model="createForm.name"
            type="text"
            placeholder="e.g. Q1 Emergency Reserve"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
            required
            maxlength="100"
          />
        </div>
        <!-- Recurring Amount -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Recurring Amount</label>
          <input
            v-model.number="createForm.recurringAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
          />
        </div>
        <!-- Interval -->
        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Interval (minutes)</label>
          <input
            v-model.number="createForm.intervalMinutes"
            type="number"
            min="1"
            placeholder="60"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
            required
          />
          <p class="text-xs text-gray-500 mt-1">{{ formatInterval(createForm.intervalMinutes) }}</p>
        </div>
        <!-- Enabled -->
        <div class="flex items-center gap-3 pt-5">
          <button
            type="button"
            @click="createForm.isEnabled = !createForm.isEnabled"
            class="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
            :class="createForm.isEnabled ? 'bg-indigo-500' : 'bg-slate-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="createForm.isEnabled ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-sm text-gray-300">{{ createForm.isEnabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
        <!-- Submit -->
        <div class="flex items-end">
          <BaseButton type="submit" class="w-full" :disabled="submitting">
            {{ submitting ? 'Creating...' : 'Create Fund Pool' }}
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- Stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <BaseCard class="text-center py-4">
        <p class="text-2xl font-bold text-white">{{ total }}</p>
        <p class="text-xs text-gray-400 mt-1">Total Pools</p>
      </BaseCard>
      <BaseCard class="text-center py-4">
        <p class="text-2xl font-bold text-emerald-400">{{ enabledCount }}</p>
        <p class="text-xs text-gray-400 mt-1">Enabled</p>
      </BaseCard>
      <BaseCard class="text-center py-4">
        <p class="text-2xl font-bold text-slate-400">{{ disabledCount }}</p>
        <p class="text-xs text-gray-400 mt-1">Disabled</p>
      </BaseCard>
      <BaseCard class="text-center py-4">
        <p class="text-2xl font-bold text-indigo-400">{{ formatAmount(totalAmount) }}</p>
        <p class="text-xs text-gray-400 mt-1">Total Amount</p>
      </BaseCard>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty state -->
    <BaseCard v-else-if="pools.length === 0 && !showCreateForm" class="py-16 text-center">
      <div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-white font-medium mb-2">No fund pools yet</h3>
      <p class="text-gray-400 text-sm mb-6">Create your first fund pool to get started</p>
      <BaseButton @click="toggleCreateForm">Create Fund Pool</BaseButton>
    </BaseCard>

    <!-- Pool list -->
    <div v-else-if="pools.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <BaseCard
        v-for="pool in pools"
        :key="pool._id"
        class="flex flex-col gap-4 transition-all duration-700"
        :class="recentlyUpdated.has(pool._id) ? 'ring-1 ring-indigo-400/60 shadow-lg shadow-indigo-500/10' : ''"
      >
        <!-- Card header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" :class="typeColor(pool.type)">
              <span class="text-base">{{ typeIcon(pool.type) }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="text-white font-semibold truncate">{{ pool.name }}</h3>
              <span class="text-xs text-gray-400 capitalize">{{ pool.type }}</span>
            </div>
          </div>
          <!-- Enable toggle -->
          <button
            type="button"
            @click="handleToggle(pool)"
            class="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
            :class="pool.isEnabled ? 'bg-indigo-500' : 'bg-slate-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="pool.isEnabled ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>

        <!-- Amounts -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-slate-700/30 rounded-lg px-3 py-2.5">
            <p class="text-xs text-gray-400 mb-1">Current</p>
            <p class="text-base font-bold text-white">{{ formatAmount(pool.currentAmount) }}</p>
          </div>
          <div class="bg-slate-700/30 rounded-lg px-3 py-2.5">
            <p class="text-xs text-gray-400 mb-1">Recurring</p>
            <p class="text-base font-bold text-indigo-300">{{ formatAmount(pool.recurringAmount) }}</p>
          </div>
        </div>

        <!-- Meta -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-500 text-xs">Interval</p>
            <p class="text-gray-200 font-medium">{{ formatInterval(pool.intervalMinutes) }}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs">Last Executed</p>
            <p class="text-gray-200 font-medium">{{ formatLastExecuted(pool.lastExecutedAt) }}</p>
          </div>
        </div>

        <!-- Countdown -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500">Next execution</span>
            <span :class="countdownTextColor(pool)" class="font-mono font-medium tabular-nums">{{ getCountdown(pool) }}</span>
          </div>
          <div class="h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-[width] duration-1000"
              :class="countdownBarColor(pool)"
              :style="{ width: `${getCountdownProgress(pool)}%` }"
            ></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <button
            type="button"
            @click="openEditModal(pool)"
            class="flex-1 text-xs text-gray-400 hover:text-white py-1.5 rounded-lg hover:bg-slate-700/40 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            @click="handleRecordExecution(pool._id)"
            class="flex-1 text-xs text-indigo-400 hover:text-indigo-300 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            Run Now
          </button>
          <button
            type="button"
            @click="confirmDelete(pool)"
            class="flex-1 text-xs text-red-400 hover:text-red-300 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </BaseCard>
    </div>

    <!-- Edit Modal -->
    <BaseModal v-model="showEditModal" title="Edit Fund Pool">
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-300 mb-1.5">Type</label>
          <select
            v-model="editForm.type"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/60 text-sm"
          >
            <option v-for="t in poolTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1.5">Name</label>
          <input
            v-model="editForm.name"
            type="text"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
            required
            maxlength="100"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1.5">Recurring Amount</label>
          <input
            v-model.number="editForm.recurringAmount"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1.5">Interval (minutes)</label>
          <input
            v-model.number="editForm.intervalMinutes"
            type="number"
            min="1"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 text-sm"
            required
          />
          <p class="text-xs text-gray-500 mt-1">{{ formatInterval(editForm.intervalMinutes) }}</p>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-300">Enabled</span>
          <button
            type="button"
            @click="editForm.isEnabled = !editForm.isEnabled"
            class="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
            :class="editForm.isEnabled ? 'bg-indigo-500' : 'bg-slate-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="editForm.isEnabled ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>
        <div class="flex gap-3 pt-2">
          <BaseButton type="button" variant="ghost" class="flex-1" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton type="submit" class="flex-1" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirm Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete Fund Pool">
      <p class="text-gray-300 text-sm mb-6">
        Are you sure you want to delete <span class="text-white font-semibold">{{ deletingPool?.name }}</span>? This action cannot be undone.
      </p>
      <div class="flex gap-3">
        <BaseButton variant="ghost" class="flex-1" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" class="flex-1" :disabled="submitting" @click="handleDelete">
          {{ submitting ? 'Deleting...' : 'Delete' }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { FundPool, FundPoolType } from '~/types'

definePageMeta({ middleware: 'auth' })

const { pools, total, isLoading, recentlyUpdated, loadPools, createPool, updatePool, togglePool, deletePool, recordExecution, setupRealtime, teardownRealtime } = useFundPools()
const toast = useToast()

const showCreateForm = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingPool = ref<FundPool | null>(null)
const deletingPool = ref<FundPool | null>(null)
const submitting = ref(false)

const defaultCreateForm = () => ({
  type: 'general' as FundPoolType,
  name: '',
  recurringAmount: 0,
  intervalMinutes: 60,
  isEnabled: true,
})

const createForm = ref(defaultCreateForm())
const editForm = ref(defaultCreateForm())

const poolTypes = [
  { value: 'general', label: 'General' },
  { value: 'savings', label: 'Savings' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'investment', label: 'Investment' },
  { value: 'operational', label: 'Operational' },
  { value: 'reserve', label: 'Reserve' },
]

const enabledCount = computed(() => pools.value.filter(p => p.isEnabled).length)
const disabledCount = computed(() => pools.value.filter(p => !p.isEnabled).length)
const totalAmount = computed(() => pools.value.reduce((sum, p) => sum + p.currentAmount, 0))

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) createForm.value = defaultCreateForm()
}

function openEditModal(pool: FundPool) {
  editingPool.value = pool
  editForm.value = {
    type: pool.type,
    name: pool.name,
    recurringAmount: pool.recurringAmount,
    intervalMinutes: pool.intervalMinutes,
    isEnabled: pool.isEnabled,
  }
  showEditModal.value = true
}

async function handleCreate() {
  submitting.value = true
  try {
    await createPool(createForm.value)
    toast.success('Fund pool created')
    showCreateForm.value = false
    createForm.value = defaultCreateForm()
  } finally {
    submitting.value = false
  }
}

async function handleUpdate() {
  if (!editingPool.value) return
  submitting.value = true
  try {
    await updatePool(editingPool.value._id, editForm.value)
    toast.success('Fund pool updated')
    showEditModal.value = false
    editingPool.value = null
  } finally {
    submitting.value = false
  }
}

async function handleToggle(pool: FundPool) {
  await togglePool(pool._id)
  toast.success(`Pool ${pool.isEnabled ? 'disabled' : 'enabled'}`)
}

async function handleRecordExecution(id: string) {
  await recordExecution(id)
  toast.success('Execution recorded')
}

function confirmDelete(pool: FundPool) {
  deletingPool.value = pool
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingPool.value) return
  submitting.value = true
  try {
    await deletePool(deletingPool.value._id)
    toast.success('Fund pool deleted')
    showDeleteModal.value = false
    deletingPool.value = null
  } finally {
    submitting.value = false
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}

function formatInterval(minutes: number): string {
  if (!minutes || minutes < 1) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatLastExecuted(date: string | null): string {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

function typeIcon(type: FundPoolType): string {
  const icons: Record<FundPoolType, string> = {
    savings: '💰',
    emergency: '🚨',
    investment: '📈',
    operational: '⚙️',
    reserve: '🏦',
    general: '💼',
  }
  return icons[type] ?? '💼'
}

// ── Countdown ────────────────────────────────────────────────────────────────

const now = ref(Date.now())
let tickInterval: ReturnType<typeof setInterval> | null = null

function getCountdown(pool: FundPool): string {
  const t = now.value  // always read so Vue tracks this dependency in every branch
  if (!pool.isEnabled) return '—'
  if (!pool.lastExecutedAt) return 'Due now'
  const remaining = new Date(pool.lastExecutedAt).getTime() + pool.intervalMinutes * 60_000 - t
  if (remaining <= 0) return 'Due now'
  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

function getCountdownProgress(pool: FundPool): number {
  const t = now.value  // always read so Vue tracks this dependency in every branch
  if (!pool.isEnabled || !pool.lastExecutedAt) return 100
  const elapsed = t - new Date(pool.lastExecutedAt).getTime()
  const total = pool.intervalMinutes * 60_000
  return Math.min(100, Math.round((elapsed / total) * 100))
}

function countdownTextColor(pool: FundPool): string {
  if (!pool.isEnabled) return 'text-gray-600'
  const p = getCountdownProgress(pool)
  if (p >= 100) return 'text-red-400'
  if (p >= 85) return 'text-amber-400'
  return 'text-gray-400'
}

function countdownBarColor(pool: FundPool): string {
  const p = getCountdownProgress(pool)
  if (p >= 100) return 'bg-red-500'
  if (p >= 85) return 'bg-amber-500'
  return 'bg-indigo-500'
}

function typeColor(type: FundPoolType): string {
  const colors: Record<FundPoolType, string> = {
    savings: 'bg-emerald-500/15 text-emerald-400',
    emergency: 'bg-red-500/15 text-red-400',
    investment: 'bg-blue-500/15 text-blue-400',
    operational: 'bg-amber-500/15 text-amber-400',
    reserve: 'bg-violet-500/15 text-violet-400',
    general: 'bg-slate-600/50 text-gray-400',
  }
  return colors[type] ?? 'bg-slate-600/50 text-gray-400'
}

onMounted(() => {
  loadPools()
  setupRealtime()
  tickInterval = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  teardownRealtime()
  if (tickInterval) clearInterval(tickInterval)
})
</script>
