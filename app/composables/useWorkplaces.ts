import type { Workplace, WorkplaceInput, WorkplaceMember, WorkplaceMemberWithUser } from '~/types'

const workplaces = ref<Workplace[]>([])
const currentWorkplace = ref<Workplace | null>(null)
const workplaceMembers = ref<WorkplaceMemberWithUser[]>([])
const workplaceStats = ref<Record<string, { projectCount: number; memberCount: number }>>({})
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useWorkplaces() {
  const { workplacesApi, workplaceMembersApi, error: apiRequestError } = useApi()
  const toast = useToast()

  async function loadWorkplaces() {
    isLoading.value = true
    apiError.value = null

    const result = await workplacesApi.getAll()

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    workplaces.value = result
    isLoading.value = false

    // Load stats in background
    workplacesApi.getStats().then((stats) => {
      workplaceStats.value = stats
    })
  }

  async function loadWorkplace(id: string) {
    isLoading.value = true
    apiError.value = null

    const workplace = await workplacesApi.getById(id)

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    currentWorkplace.value = workplace
    isLoading.value = false
  }

  async function loadWorkplaceMembers(workplaceId: string) {
    const members = await workplaceMembersApi.getAllWithDetails(workplaceId)

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    workplaceMembers.value = members
  }

  function getWorkplaceById(id: string): Workplace | undefined {
    return workplaces.value.find(w => w._id === id)
  }

  async function createWorkplace(data: WorkplaceInput): Promise<Workplace | null> {
    const created = await workplacesApi.create(data)
    if (created) {
      workplaces.value.push(created)
      toast.success('Workplace created successfully')
    }
    return created
  }

  async function updateWorkplace(id: string, data: Partial<WorkplaceInput>) {
    const updated = await workplacesApi.update(id, data)
    if (updated) {
      const index = workplaces.value.findIndex(w => w._id === id)
      if (index !== -1) {
        workplaces.value[index] = { ...workplaces.value[index], ...updated }
      }
      if (currentWorkplace.value?._id === id) {
        currentWorkplace.value = { ...currentWorkplace.value, ...updated }
      }
      toast.success('Workplace updated successfully')
    }
  }

  async function deleteWorkplace(id: string) {
    const success = await workplacesApi.delete(id)
    if (success) {
      const index = workplaces.value.findIndex(w => w._id === id)
      if (index !== -1) {
        workplaces.value.splice(index, 1)
      }
      toast.success('Workplace archived successfully')
    }
  }

  async function addMember(workplaceId: string, userId: string, role?: string): Promise<WorkplaceMember | null> {
    const member = await workplaceMembersApi.addMember(workplaceId, userId, role)
    if (member) {
      await loadWorkplaceMembers(workplaceId)
      toast.success('Member added successfully')
    }
    return member
  }

  async function updateMemberRole(workplaceId: string, userId: string, role: string) {
    await workplaceMembersApi.updateRole(workplaceId, userId, role)
    await loadWorkplaceMembers(workplaceId)
    toast.success('Member role updated')
  }

  async function removeMember(workplaceId: string, userId: string) {
    const success = await workplaceMembersApi.removeMember(workplaceId, userId)
    if (success) {
      workplaceMembers.value = workplaceMembers.value.filter(m => m.userId !== userId)
      toast.success('Member removed')
    }
  }

  return {
    workplaces,
    currentWorkplace,
    workplaceMembers,
    workplaceStats,
    isLoading,
    apiError,
    loadWorkplaces,
    loadWorkplace,
    loadWorkplaceMembers,
    getWorkplaceById,
    createWorkplace,
    updateWorkplace,
    deleteWorkplace,
    addMember,
    updateMemberRole,
    removeMember
  }
}
