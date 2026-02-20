import type { TaskComment } from '~/types'

export function useTaskComments() {
  const { commentsApi } = useApi()
  const { user } = useAuth()
  const toast = useToast()

  const comments = ref<TaskComment[]>([])
  const isLoading = ref(false)

  async function loadComments(taskId: string) {
    isLoading.value = true
    try {
      comments.value = await commentsApi.getByTask(taskId)
    } finally {
      isLoading.value = false
    }
  }

  async function addComment(taskId: string, content: string, file?: File): Promise<boolean> {
    const created = await commentsApi.create(taskId, content, file)
    if (created) {
      // Backend returns raw doc without populate, so inject current user info
      if (!created.user && user.value) {
        created.user = { _id: user.value.id, name: user.value.name, email: user.value.email }
        created.userId = user.value.id
      }
      comments.value = [created, ...comments.value]
      toast.success('Comment added')
      return true
    }
    return false
  }

  async function editComment(taskId: string, commentId: string, content: string): Promise<boolean> {
    const updated = await commentsApi.update(taskId, commentId, content)
    if (updated) {
      // Preserve existing user info since update response is also unpopulated
      const existing = comments.value.find(c => c._id === commentId)
      if (!updated.user && existing?.user) {
        updated.user = existing.user
      }
      comments.value = comments.value.map(c => c._id === commentId ? updated : c)
      toast.success('Comment updated')
      return true
    }
    return false
  }

  async function removeComment(taskId: string, commentId: string): Promise<boolean> {
    const success = await commentsApi.delete(taskId, commentId)
    if (success) {
      comments.value = comments.value.filter(c => c._id !== commentId)
      toast.success('Comment deleted')
      return true
    }
    return false
  }

  return {
    comments,
    isLoading,
    loadComments,
    addComment,
    editComment,
    removeComment,
  }

}
