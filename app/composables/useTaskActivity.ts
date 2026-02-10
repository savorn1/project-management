import type { TaskActivity } from '~/types'

export function useTaskActivity() {
  const { activityApi } = useApi()

  const activities = ref<TaskActivity[]>([])
  const isLoading = ref(false)

  async function loadActivities(taskId: string) {
    isLoading.value = true
    try {
      activities.value = await activityApi.getByTask(taskId)
    } finally {
      isLoading.value = false
    }
  }

  return {
    activities,
    isLoading,
    loadActivities,
  }
}
