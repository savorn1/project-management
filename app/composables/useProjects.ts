import type { Project, ProjectInput } from '~/types'

const projects = ref<Project[]>([])
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useProjects() {
  const { projectsApi, error: apiRequestError } = useApi()
  const toast = useToast()

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
    deleteProject
  }
}
