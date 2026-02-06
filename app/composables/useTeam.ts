import type { TeamMember } from '~/types'
import { teamMembers as mockMembers, tasks } from '~/data/mockData'
import { generateId } from '~/utils/formatters'

const members = ref<TeamMember[]>([])
const isApiConnected = ref(false)
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useTeam() {
  const { teamApi } = useApi()

  async function loadMembers() {
    isLoading.value = true
    apiError.value = null

    try {
      const apiMembers = await teamApi.getAll()
      members.value = apiMembers
      isApiConnected.value = true
    } catch (err) {
      console.warn('API not available, using mock data:', err)
      members.value = [...mockMembers]
      isApiConnected.value = false
      apiError.value = err instanceof Error ? err.message : 'Failed to connect to API'
    } finally {
      isLoading.value = false
    }
  }

  function getMemberById(id: string): TeamMember | undefined {
    return members.value.find(m => m.id === id)
  }

  async function createMember(data: Partial<TeamMember>): Promise<TeamMember> {
    const newMember: TeamMember = {
      id: generateId(),
      name: data.name || 'New Member',
      email: data.email || '',
      avatar: data.avatar || '👤',
      role: data.role || 'developer',
      createdAt: new Date().toISOString()
    }

    if (isApiConnected.value) {
      try {
        const created = await teamApi.create(newMember)
        members.value.push(created)
        return created
      } catch (err) {
        console.warn('Failed to create member via API, using local:', err)
      }
    }

    members.value.push(newMember)
    return newMember
  }

  async function updateMember(id: string, data: Partial<TeamMember>) {
    const index = members.value.findIndex(m => m.id === id)
    if (index === -1) return

    if (isApiConnected.value) {
      try {
        const updated = await teamApi.update(id, data)
        members.value[index] = { ...members.value[index], ...updated }
        return
      } catch (err) {
        console.warn('Failed to update member via API, using local:', err)
      }
    }

    members.value[index] = {
      ...members.value[index],
      ...data
    }
  }

  async function deleteMember(id: string) {
    if (isApiConnected.value) {
      try {
        await teamApi.delete(id)
      } catch (err) {
        console.warn('Failed to delete member via API, using local:', err)
      }
    }

    const index = members.value.findIndex(m => m.id === id)
    if (index !== -1) {
      members.value.splice(index, 1)
    }
  }

  function getMemberTasks(memberId: string) {
    return tasks.filter(task => task.assigneeId === memberId)
  }

  const membersWithStats = computed(() => {
    return members.value.map(member => ({
      ...member,
      taskCount: getMemberTasks(member.id).length,
      activeTasks: getMemberTasks(member.id).filter(t => t.status !== 'done').length
    }))
  })

  return {
    members,
    membersWithStats,
    isApiConnected,
    isLoading,
    apiError,
    loadMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    getMemberTasks
  }
}
