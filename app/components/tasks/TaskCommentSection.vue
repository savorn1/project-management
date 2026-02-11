<template>
  <div class="space-y-4">
    <!-- Comment Input -->
    <div class="flex gap-3">
      <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0">
        {{ currentUserInitials }}
      </div>
      <div class="flex-1">
        <div class="relative">
          <textarea
            ref="textareaRef"
            v-model="newComment"
            placeholder="Write a comment... Use @ to mention"
            rows="2"
            class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            @input="handleInput"
            @keydown="onKeydown"
          ></textarea>

          <!-- Mention Dropdown -->
          <div
            v-if="showDropdown && filteredOptions.length > 0"
            class="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50"
          >
            <button
              v-for="(option, index) in filteredOptions"
              :key="option.id"
              :ref="el => { if (index === selectedIndex) selectedEl = el as HTMLElement }"
              @mousedown.prevent="selectOption(option)"
              :class="[
                'w-full px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors',
                index === selectedIndex ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-600'
              ]"
            >
              <div
                v-if="option.type === 'everyone'"
                class="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
              >
                @
              </div>
              <div
                v-else
                class="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
              >
                {{ getInitials(option.name) }}
              </div>
              <span class="truncate">{{ option.type === 'everyone' ? '@everyone' : option.name }}</span>
            </button>
          </div>
        </div>
        <div class="flex justify-end mt-2">
          <button
            @click="submitComment"
            :disabled="!newComment.trim() || isSubmitting"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
          >
            {{ isSubmitting ? 'Sending...' : 'Comment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-400 text-sm">Loading comments...</p>
    </div>

    <!-- Comments List -->
    <div v-else-if="comments.length > 0" class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment._id"
        class="flex gap-3 group"
      >
        <div class="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0">
          {{ getInitials(comment.user?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-white">{{ comment.user?.name || 'Unknown' }}</span>
            <span class="text-xs text-gray-500">{{ formatRelative(comment.createdAt) }}</span>
            <span v-if="comment.updatedAt !== comment.createdAt" class="text-xs text-gray-600">(edited)</span>

            <!-- Actions (own comments only) -->
            <div v-if="isOwnComment(comment)" class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="startEdit(comment)"
                class="p-1 text-gray-400 hover:text-white rounded transition-colors"
                title="Edit"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleDelete(comment._id)"
                class="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                title="Delete"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-if="editingId === comment._id" class="mt-1">
            <div class="relative">
              <textarea
                ref="editTextareaRef"
                v-model="editContent"
                rows="2"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-indigo-500"
                @input="editMention.handleInput"
                @keydown="onEditKeydown"
              ></textarea>

              <!-- Edit Mention Dropdown -->
              <div
                v-if="editMention.showDropdown.value && editMention.filteredOptions.value.length > 0"
                class="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50"
              >
                <button
                  v-for="(option, index) in editMention.filteredOptions.value"
                  :key="option.id"
                  @mousedown.prevent="editMention.selectOption(option)"
                  :class="[
                    'w-full px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors',
                    index === editMention.selectedIndex.value ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-600'
                  ]"
                >
                  <div
                    v-if="option.type === 'everyone'"
                    class="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
                  >
                    @
                  </div>
                  <div
                    v-else
                    class="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
                  >
                    {{ getInitials(option.name) }}
                  </div>
                  <span class="truncate">{{ option.type === 'everyone' ? '@everyone' : option.name }}</span>
                </button>
              </div>
            </div>
            <div class="flex gap-2 mt-1">
              <button
                @click="saveEdit(comment._id)"
                :disabled="!editContent.trim()"
                class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded text-xs text-white transition-colors"
              >
                Save
              </button>
              <button
                @click="cancelEdit"
                class="px-2 py-1 text-gray-400 hover:text-white rounded text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Display mode -->
          <p v-else class="text-sm text-gray-300 mt-1 whitespace-pre-wrap"><template v-for="(seg, i) in parseMentions(comment.content)" :key="i"><span v-if="seg.type === 'everyone'" class="text-amber-400 font-medium bg-amber-400/10 rounded px-0.5">@everyone</span><span v-else-if="seg.type === 'mention'" class="text-indigo-400 font-medium bg-indigo-400/10 rounded px-0.5">@{{ seg.value }}</span><template v-else>{{ seg.value }}</template></template></p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6">
      <p class="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskComment } from '~/types'
import { parseMentions } from '~/utils/mentionRenderer'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

const { user } = useAuth()
const { members } = useTeam()
const { comments, isLoading, loadComments, addComment, editComment, removeComment } = useTaskComments()

const newComment = ref('')
const isSubmitting = ref(false)
const editingId = ref<string | null>(null)
const editContent = ref('')

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedEl = ref<HTMLElement | null>(null)

// Mention input for new comment
const {
  showDropdown,
  filteredOptions,
  selectedIndex,
  handleInput,
  handleKeydown: mentionKeydown,
  selectOption,
} = useMentionInput(textareaRef, members, newComment)

// Mention input for edit comment
const editMention = useMentionInput(editTextareaRef, members, editContent)

const currentUserInitials = computed(() => getInitials(user.value?.name))

// Scroll selected dropdown item into view
watch(selectedIndex, () => {
  nextTick(() => selectedEl.value?.scrollIntoView({ block: 'nearest' }))
})

watch(() => props.taskId, (id) => {
  if (id) loadComments(id)
}, { immediate: true })

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function isOwnComment(comment: TaskComment): boolean {
  return comment.userId === user.value?.id
}

function onKeydown(event: KeyboardEvent) {
  mentionKeydown(event)
  if (event.defaultPrevented) return
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    submitComment()
  }
}

function onEditKeydown(event: KeyboardEvent) {
  editMention.handleKeydown(event)
  if (event.defaultPrevented) return
  if (event.key === 'Escape') {
    cancelEdit()
  }
}

async function submitComment() {
  if (!newComment.value.trim() || isSubmitting.value) return
  isSubmitting.value = true
  const success = await addComment(props.taskId, newComment.value.trim())
  if (success) newComment.value = ''
  isSubmitting.value = false
}

function startEdit(comment: TaskComment) {
  editingId.value = comment._id
  editContent.value = comment.content
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
  editMention.closeDropdown()
}

async function saveEdit(commentId: string) {
  if (!editContent.value.trim()) return
  const success = await editComment(props.taskId, commentId, editContent.value.trim())
  if (success) cancelEdit()
}

async function handleDelete(commentId: string) {
  await removeComment(props.taskId, commentId)
}
</script>
