import type { DashboardStats } from '~/types'
import { getDueDateStatus } from '~/utils/formatters'

export function useDashboard() {
  const { tasks, loadTasks, isLoading: tasksLoading } = useTasks()
  const { projects, loadProjects, isLoading: projectsLoading } = useProjects()
  const { members, loadMembers, isLoading: membersLoading } = useTeam()

  const isLoading = computed(() => tasksLoading.value || projectsLoading.value || membersLoading.value)

  async function loadDashboardData() {
    await Promise.all([
      loadTasks(),
      loadProjects(),
      loadMembers()
    ])
  }

  const stats = computed<DashboardStats>(() => {
    const completedTasks = tasks.value.filter(t => t.status === 'done').length
    const overdueTasks = tasks.value.filter(t => getDueDateStatus(t.dueDate) === 'overdue' && t.status !== 'done').length

    // Tasks created this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const tasksThisWeek = tasks.value.filter(t => new Date(t.createdAt) > oneWeekAgo).length

    return {
      totalProjects: projects.value.length,
      totalTasks: tasks.value.length,
      completedTasks,
      overdueTasks,
      teamMembers: members.value.length,
      tasksThisWeek
    }
  })

  const recentTasks = computed(() => {
    return [...tasks.value]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8)
  })

  const projectsWithProgress = computed(() => {
    return projects.value.map(project => {
      const projectTasks = tasks.value.filter(t => t.projectId === project._id)
      const completedCount = projectTasks.filter(t => t.status === 'done').length
      const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0

      return {
        ...project,
        progress,
        taskCount: projectTasks.length,
        completedCount
      }
    })
  })

  const overdueTasks = computed(() => {
    return tasks.value.filter(t => getDueDateStatus(t.dueDate) === 'overdue' && t.status !== 'done')
  })

  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo').length,
      in_progress: tasks.value.filter(t => t.status === 'in_progress').length,
      in_review: tasks.value.filter(t => t.status === 'in_review').length,
      done: tasks.value.filter(t => t.status === 'done').length
    }
  })

  return {
    stats,
    recentTasks,
    projectsWithProgress,
    overdueTasks,
    tasksByStatus,
    isLoading,
    loadDashboardData
  }
}
