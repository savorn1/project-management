import type { Project, ProjectInput } from '~/types'

const projects = ref<Project[]>([])
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useProjects() {
  const { projectsApi, error: apiRequestError } = useApi()
  const toast = useToast()
  const socket = useSocket()

  // Socket event handlers
  function handleProjectCreated(data: { project: Project; userId?: string }) {
    // Skip if this client created the project
    if (data.userId && data.userId === socket.clientId) return

    const exists = projects.value.find(p => p._id === data.project._id)
    if (!exists) {
      projects.value.push(data.project)
      toast.info('New project created')
    }
  }

  function handleProjectUpdated(data: { project: Project }) {
    const index = projects.value.findIndex(p => p._id === data.project._id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data.project }
    }
  }

  function handleProjectDeleted(data: { project: { _id: string } }) {
    const index = projects.value.findIndex(p => p._id === data.project._id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      toast.info('Project archived')
    }
  }

  // Setup socket listeners for a workplace
  function setupRealtimeUpdates(workplaceId: string) {
    if (!socket.isConnected.value) {
      socket.connect()
    }

    // Join workplace room
    socket.joinRoom(`workplace:${workplaceId}`)

    // Listen to events
    socket.on('project:created', handleProjectCreated)
    socket.on('project:updated', handleProjectUpdated)
    socket.on('project:deleted', handleProjectDeleted)
  }

  // Cleanup socket listeners
  function cleanupRealtimeUpdates(workplaceId: string) {
    socket.leaveRoom(`workplace:${workplaceId}`)
    socket.off('project:created', handleProjectCreated)
    socket.off('project:updated', handleProjectUpdated)
    socket.off('project:deleted', handleProjectDeleted)
  }

  async function loadProjects() {
    isLoading.value = true
    apiError.value = null

    const apiProjects = await projectsApi.getAll()

    if (apiRequestError.value) {
      apiError.value = apiRequestError.value
    }

    projects.value = apiProjects
    isLoading.value = false
  }

  function getProjectById(id: string): Project | undefined {
    return projects.value.find(p => p._id === id)
  }

  async function createProject(data: ProjectInput, workplaceId: string): Promise<Project | null> {
    const created = await projectsApi.create(data, workplaceId)
    if (created) {
      projects.value.push(created)
      toast.success('Project created successfully')
    }
    return created
  }

  async function updateProject(id: string, data: Partial<ProjectInput>) {
    const index = projects.value.findIndex(p => p._id === id)
    if (index === -1) return

    const updated = await projectsApi.update(id, data)
    if (updated) {
      projects.value[index] = { ...projects.value[index], ...updated }
      toast.success('Project updated successfully')
    }
  }

  async function deleteProject(id: string) {
    const success = await projectsApi.delete(id)
    if (success) {
      const index = projects.value.findIndex(p => p._id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
      }
      toast.success('Project deleted successfully')
    }
  }

  return {
    projects,
    isLoading,
    apiError,
    loadProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    setupRealtimeUpdates,
    cleanupRealtimeUpdates
  }
}
