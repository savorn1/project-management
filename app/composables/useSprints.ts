import type { Sprint } from '~/types'

const sprintsMap = ref<Record<string, Sprint[]>>({})
const loadingSprints = ref(false)

export function useSprints() {
  const { sprintsApi } = useApi()

  function getProjectSprints(projectId: string): Sprint[] {
    return sprintsMap.value[projectId] || []
  }

  async function loadSprints(projectId: string, force = false) {
    if (!force && sprintsMap.value[projectId]?.length) return
    loadingSprints.value = true
    try {
      const sprints = await sprintsApi.getAll(projectId)
      sprintsMap.value = { ...sprintsMap.value, [projectId]: sprints }
    } finally {
      loadingSprints.value = false
    }
  }

  async function createSprint(projectId: string, data: { name: string; startDate?: string; endDate?: string; goal?: string }): Promise<Sprint | null> {
    const sprint = await sprintsApi.create(projectId, data)
    if (sprint) {
      const existing = sprintsMap.value[projectId] || []
      sprintsMap.value = { ...sprintsMap.value, [projectId]: [...existing, sprint] }
    }
    return sprint
  }

  async function updateSprint(projectId: string, sprintId: string, data: { name?: string; startDate?: string; endDate?: string; goal?: string }): Promise<Sprint | null> {
    const sprint = await sprintsApi.update(projectId, sprintId, data)
    if (sprint) {
      await loadSprints(projectId, true)
    }
    return sprint
  }

  async function startSprint(projectId: string, sprintId: string): Promise<Sprint | null> {
    const sprint = await sprintsApi.start(projectId, sprintId)
    if (sprint) {
      await loadSprints(projectId, true)
    }
    return sprint
  }

  async function closeSprint(projectId: string, sprintId: string): Promise<Sprint | null> {
    const sprint = await sprintsApi.close(projectId, sprintId)
    if (sprint) {
      await loadSprints(projectId, true)
    }
    return sprint
  }

  async function deleteSprint(projectId: string, sprintId: string): Promise<boolean> {
    const ok = await sprintsApi.delete(projectId, sprintId)
    if (ok) {
      const existing = sprintsMap.value[projectId] || []
      sprintsMap.value = { ...sprintsMap.value, [projectId]: existing.filter(s => s._id !== sprintId) }
    }
    return ok
  }

  return {
    sprintsMap,
    loadingSprints,
    getProjectSprints,
    loadSprints,
    createSprint,
    updateSprint,
    startSprint,
    closeSprint,
    deleteSprint,
  }
}
