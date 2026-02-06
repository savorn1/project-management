import type { Project } from '~/types'
import { projects as mockProjects, getProjectTasks, calculateProjectProgress, getProjectMembers } from '~/data/mockData'
import { generateId } from '~/utils/formatters'

const projects = ref<Project[]>([])
const isApiConnected = ref(false)
const isLoading = ref(false)
const apiError = ref<string | null>(null)

export function useProjects() {
  const { projectsApi } = useApi()

  async function loadProjects() {
    isLoading.value = true
    apiError.value = null

    try {
      const apiProjects = await projectsApi.getAll()
      projects.value = apiProjects
      isApiConnected.value = true
    } catch (err) {
      console.warn('API not available, using mock data:', err)
      projects.value = [...mockProjects]
      isApiConnected.value = false
      apiError.value = err instanceof Error ? err.message : 'Failed to connect to API'
    } finally {
      isLoading.value = false
    }
  }

  function getProjectById(id: string): Project | undefined {
    return projects.value.find(p => p.id === id)
  }

  async function createProject(data: Partial<Project>): Promise<Project> {
    const newProject: Project = {
      id: generateId(),
      name: data.name || 'New Project',
      description: data.description || '',
      color: data.color || 'indigo',
      icon: data.icon || '📁',
      memberIds: data.memberIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (isApiConnected.value) {
      try {
        const created = await projectsApi.create(newProject)
        projects.value.push(created)
        return created
      } catch (err) {
        console.warn('Failed to create project via API, using local:', err)
      }
    }

    projects.value.push(newProject)
    return newProject
  }

  async function updateProject(id: string, data: Partial<Project>) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index === -1) return

    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    if (isApiConnected.value) {
      try {
        const updated = await projectsApi.update(id, updatedData)
        projects.value[index] = { ...projects.value[index], ...updated }
        return
      } catch (err) {
        console.warn('Failed to update project via API, using local:', err)
      }
    }

    projects.value[index] = {
      ...projects.value[index],
      ...updatedData
    }
  }

  async function deleteProject(id: string) {
    if (isApiConnected.value) {
      try {
        await projectsApi.delete(id)
      } catch (err) {
        console.warn('Failed to delete project via API, using local:', err)
      }
    }

    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
  }

  const projectsWithStats = computed(() => {
    return projects.value.map(project => ({
      ...project,
      tasks: getProjectTasks(project.id),
      progress: calculateProjectProgress(project.id),
      members: getProjectMembers(project.id)
    }))
  })

  return {
    projects,
    projectsWithStats,
    isApiConnected,
    isLoading,
    apiError,
    loadProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
  }
}
