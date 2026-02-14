import type { Label } from '~/types'

const labelsMap = ref<Record<string, Label[]>>({})
const loadingLabels = ref(false)

export function useLabels() {
  const { labelsApi } = useApi()

  function getProjectLabels(projectId: string): Label[] {
    return labelsMap.value[projectId] || []
  }

  function getLabelById(projectId: string, labelId: string): Label | undefined {
    return getProjectLabels(projectId).find(l => l._id === labelId)
  }

  async function loadLabels(projectId: string, force = false) {
    if (!force && labelsMap.value[projectId]?.length) return
    loadingLabels.value = true
    try {
      const labels = await labelsApi.getAll(projectId)
      labelsMap.value = { ...labelsMap.value, [projectId]: labels }
    } finally {
      loadingLabels.value = false
    }
  }

  async function createLabel(projectId: string, name: string, color: string): Promise<Label | null> {
    const label = await labelsApi.create(projectId, { name, color })
    if (label) {
      const existing = labelsMap.value[projectId] || []
      labelsMap.value = { ...labelsMap.value, [projectId]: [...existing, label] }
    }
    return label
  }

  async function deleteLabel(projectId: string, labelId: string): Promise<boolean> {
    const ok = await labelsApi.delete(projectId, labelId)
    if (ok) {
      const existing = labelsMap.value[projectId] || []
      labelsMap.value = { ...labelsMap.value, [projectId]: existing.filter(l => l._id !== labelId) }
    }
    return ok
  }

  return {
    labelsMap,
    loadingLabels,
    getProjectLabels,
    getLabelById,
    loadLabels,
    createLabel,
    deleteLabel,
  }
}
