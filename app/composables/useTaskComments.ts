import type { TaskComment } from '~/types'

interface CommentAddedEvent {
  taskId: string
  userId: string
  commentId: string
  hasAttachment: boolean
  timestamp: string
}

export function useTaskComments() {
  const { commentsApi } = useApi()
  const { user } = useAuth()
  const toast = useToast()
  const { joinRoom, leaveRoom, on, off } = useSocket()

  const comments = ref<TaskComment[]>([])
  const isLoading = ref(false)

  // Track which task room we're currently in so we can leave on change
  let currentRoom: string | null = null

  async function loadComments(taskId: string) {
    // Leave previous room if switching tasks
    if (currentRoom && currentRoom !== `task:${taskId}`) {
      leaveRoom(currentRoom)
      off('task:comment.added', onCommentAdded)
    }

    isLoading.value = true
    try {
      comments.value = await commentsApi.getByTask(taskId)
    } finally {
      isLoading.value = false
    }

    // Join the task room for real-time updates
    currentRoom = `task:${taskId}`
    joinRoom(currentRoom)
    on<CommentAddedEvent>('task:comment.added', onCommentAdded)
  }

  function onCommentAdded(event: CommentAddedEvent) {
    // Skip if posted by current user in this tab (already added optimistically)
    if (event.userId === user.value?.id) return
    // Skip if already present (duplicate event guard)
    if (comments.value.some(c => c._id === event.commentId)) return

    // Fetch only the new comment by ID — no need to reload the full list
    commentsApi.getById(event.taskId, event.commentId).then(comment => {
      if (comment && !comments.value.some(c => c._id === comment._id)) {
        comments.value = [comment, ...comments.value]
        toast.info('New comment from a team member')
      }
    })
  }

  function stopListening() {
    if (currentRoom) {
      leaveRoom(currentRoom)
      off('task:comment.added', onCommentAdded)
      currentRoom = null
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
    stopListening,
    addComment,
    editComment,
    removeComment,
  }
}
