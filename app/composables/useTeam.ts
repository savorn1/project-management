import type { TeamMember } from '~/types'

const members = ref<TeamMember[]>([])
const total = ref(0)
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useTeam() {
  const { teamApi, error: apiRequestError } = useApi()
  const toast = useToast()

  async function loadMembers(params?: {
    page?: number
    pageSize?: number
    name?: string
    email?: string
    role?: string
  }) {
    isLoading.value = true
    apiError.value = null

    const result = await teamApi.getAll(params)

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    members.value = result.data
    total.value = result.total
    isLoading.value = false
  }

  function getMemberById(id: string): TeamMember | undefined {
    return members.value.find(m => m._id === id)
  }

  async function createMember(data: Partial<TeamMember>): Promise<TeamMember | null> {
    const created = await teamApi.create(data)
    if (created) {
      members.value.push(created)
      toast.success('Member created successfully')
    }
    return created
  }

  async function updateMember(id: string, data: Partial<TeamMember>) {
    const index = members.value.findIndex(m => m._id === id)
    if (index === -1) return

    const updated = await teamApi.update(id, data)
    if (updated) {
      members.value[index] = { ...members.value[index], ...updated }
      toast.success('Member updated successfully')
    }
  }

  async function deleteMember(id: string) {
    const success = await teamApi.delete(id)
    if (success) {
      const index = members.value.findIndex(m => m._id === id)
      if (index !== -1) {
        members.value.splice(index, 1)
      }
      toast.success('Member deleted successfully')
    }
  }

  return {
    members,
    total,
    isLoading,
    apiError,
    loadMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
  }
}
