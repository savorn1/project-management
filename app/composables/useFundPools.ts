import type { FundPool, FundPoolExecution, FundPoolInput } from '~/types'

export function useFundPools() {
  const { fundPoolsApi } = useApi()
  const { joinRoom, leaveRoom, on, off } = useSocket()

  const pools = ref<FundPool[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const executorEnabled = ref(false)

  // Execution history per pool: poolId → last 5 executions (newest first)
  const poolExecutions = reactive(new Map<string, FundPoolExecution[]>())

  // Tracks pool IDs that received a real-time update (for flash animation)
  const recentlyUpdated = reactive(new Set<string>())
  const updateTimers = new Map<string, ReturnType<typeof setTimeout>>()

  async function loadExecutorFlag() {
    const { request } = useApi()
    const res = await request<{ success: boolean; flags: Record<string, boolean> }>(
      '/feature-flags/evaluate?keys=fund-pool-executor',
    )
    if (res) executorEnabled.value = res.flags['fund-pool-executor'] ?? false
  }

  async function loadPools() {
    isLoading.value = true
    error.value = null
    try {
      const result = await fundPoolsApi.getAll()
      pools.value = result.data
      total.value = result.total
      // Fetch execution history for all pools in parallel
      await Promise.all(result.data.map(p => loadExecutions(p._id)))
    } catch (e) {
      error.value = 'Failed to load fund pools'
    } finally {
      isLoading.value = false
    }
  }

  async function loadExecutions(poolId: string) {
    const execs = await fundPoolsApi.getExecutions(poolId, 5)
    poolExecutions.set(poolId, execs)
  }

  async function createPool(data: FundPoolInput): Promise<FundPool | null> {
    const created = await fundPoolsApi.create(data)
    if (created) {
      pools.value.unshift(created)
      total.value++
      poolExecutions.set(created._id, [])
    }
    return created
  }

  async function updatePool(id: string, data: Partial<FundPoolInput>): Promise<FundPool | null> {
    const updated = await fundPoolsApi.update(id, data)
    if (updated) {
      const idx = pools.value.findIndex(p => p._id === id)
      if (idx !== -1) pools.value[idx] = updated
    }
    return updated
  }

  async function togglePool(id: string): Promise<FundPool | null> {
    const updated = await fundPoolsApi.toggle(id)
    if (updated) {
      const idx = pools.value.findIndex(p => p._id === id)
      if (idx !== -1) pools.value[idx] = updated
    }
    return updated
  }

  async function deletePool(id: string): Promise<boolean> {
    const ok = await fundPoolsApi.delete(id)
    if (ok) {
      pools.value = pools.value.filter(p => p._id !== id)
      total.value--
      poolExecutions.delete(id)
    }
    return ok
  }

  async function recordExecution(id: string): Promise<FundPool | null> {
    const updated = await fundPoolsApi.recordExecution(id)
    if (updated) {
      const idx = pools.value.findIndex(p => p._id === id)
      if (idx !== -1) pools.value[idx] = updated
    }
    return updated
  }

  function handlePoolUpdated(data: FundPool) {
    const idx = pools.value.findIndex(p => p._id === data._id)
    if (idx !== -1) {
      pools.value[idx] = data

      // Refresh execution history for this pool
      loadExecutions(data._id)

      // Cancel any existing flash timer for this pool (in case of rapid updates)
      const existing = updateTimers.get(data._id)
      if (existing) clearTimeout(existing)

      // Trigger flash and auto-clear after 1.5s
      recentlyUpdated.add(data._id)
      updateTimers.set(data._id, setTimeout(() => {
        recentlyUpdated.delete(data._id)
        updateTimers.delete(data._id)
      }, 1500))
    }
  }

  function handleFlagUpdated(data: { key: string; enabled: boolean }) {
    if (data.key === 'fund-pool-executor') {
      executorEnabled.value = data.enabled
    }
  }

  function setupRealtime() {
    joinRoom('fund-pools')
    on<FundPool>('fund-pool:updated', handlePoolUpdated)
    joinRoom('feature-flags')
    on<{ key: string; enabled: boolean }>('feature-flag:updated', handleFlagUpdated)
    loadExecutorFlag()
  }

  function teardownRealtime() {
    off('fund-pool:updated', handlePoolUpdated)
    leaveRoom('fund-pools')
    off('feature-flag:updated', handleFlagUpdated)
    leaveRoom('feature-flags')
    updateTimers.forEach(t => clearTimeout(t))
    updateTimers.clear()
  }

  return {
    pools,
    total,
    isLoading,
    error,
    poolExecutions,
    recentlyUpdated,
    executorEnabled,
    loadPools,
    createPool,
    updatePool,
    togglePool,
    deletePool,
    recordExecution,
    setupRealtime,
    teardownRealtime,
  }
}
