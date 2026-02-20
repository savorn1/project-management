<template>
  <div class="space-y-5">
    <!-- Comment Input -->
    <div class="flex gap-3">
      <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[11px] text-white font-medium flex-shrink-0 ring-2 ring-slate-900">
        {{ currentUserInitials }}
      </div>
      <div class="flex-1">
        <div class="relative">
          <textarea
            ref="textareaRef"
            v-model="newComment"
            placeholder="Write a comment... Use @ to mention"
            rows="2"
            class="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 text-sm resize-none transition-all duration-200"
            @input="handleInput"
            @keydown="onKeydown"
          ></textarea>

          <!-- Mention Dropdown -->
          <div
            v-if="showDropdown && filteredOptions.length > 0"
            class="absolute bottom-full left-0 mb-1.5 w-64 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 z-50"
          >
            <button
              v-for="(option, index) in filteredOptions"
              :key="option.id"
              :ref="el => { if (index === selectedIndex) selectedEl = el as HTMLElement }"
              @mousedown.prevent="selectOption(option)"
              :class="[
                'w-full px-3 py-2 flex items-center gap-2.5 text-left text-sm transition-all duration-150',
                index === selectedIndex ? 'bg-indigo-600/90 text-white' : 'text-gray-300 hover:bg-slate-700/50'
              ]"
            >
              <div
                v-if="option.type === 'everyone'"
                class="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
              >
                @
              </div>
              <div
                v-else
                class="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium flex-shrink-0"
              >
                {{ getInitials(option.name) }}
              </div>
              <span class="truncate">{{ option.type === 'everyone' ? '@everyone' : option.name }}</span>
            </button>
          </div>
        </div>
        <!-- Staged attachment preview -->
        <div v-if="stagedFile" class="mt-2 flex items-center gap-2 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2">
          <span class="text-base">{{ fileIcon(stagedFile.type) }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-xs text-white truncate">{{ stagedFile.name }}</div>
            <div class="text-[11px] text-gray-500">{{ formatBytes(stagedFile.size) }}</div>
          </div>
          <button @click="stagedFile = null" class="text-gray-600 hover:text-rose-400 text-xs ml-1">✕</button>
        </div>

        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-gray-600">Ctrl+Enter to send</span>
            <!-- Attach file button -->
            <button
              type="button"
              @click="attachInput?.click()"
              class="flex items-center gap-1 text-[11px] text-gray-500 hover:text-indigo-400 transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-500/10"
              title="Attach file"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attach
            </button>
            <input ref="attachInput" type="file" class="hidden" @change="onAttach" />
          </div>
          <button
            @click="submitComment"
            :disabled="(!newComment.trim() && !stagedFile) || isSubmitting"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 disabled:shadow-none"
          >
            {{ isSubmitting ? 'Sending...' : 'Comment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-6">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm">Loading comments...</p>
      </div>
    </div>

    <!-- Comments List -->
    <div v-else-if="comments.length > 0" class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment._id"
        class="flex gap-3 group"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-[11px] text-white font-medium flex-shrink-0">
          {{ getInitials(comment.user?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-white">{{ comment.user?.name || 'Unknown' }}</span>
            <span class="text-[11px] text-gray-600">{{ formatRelative(comment.createdAt) }}</span>
            <span v-if="comment.updatedAt !== comment.createdAt" class="text-[10px] text-gray-600 bg-slate-800/50 px-1.5 py-0.5 rounded-full">(edited)</span>

            <!-- Actions (own comments only) -->
            <div v-if="isOwnComment(comment)" class="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button
                @click="startEdit(comment)"
                class="p-1.5 text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                title="Edit"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleDelete(comment._id)"
                class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Delete"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-if="editingId === comment._id" class="mt-2">
            <div class="relative">
              <textarea
                ref="editTextareaRef"
                v-model="editContent"
                rows="2"
                class="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/40 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                @input="editMention.handleInput"
                @keydown="onEditKeydown"
              ></textarea>

              <!-- Edit Mention Dropdown -->
              <div
                v-if="editMention.showDropdown.value && editMention.filteredOptions.value.length > 0"
                class="absolute bottom-full left-0 mb-1.5 w-64 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 z-50"
              >
                <button
                  v-for="(option, index) in editMention.filteredOptions.value"
                  :key="option.id"
                  @mousedown.prevent="editMention.selectOption(option)"
                  :class="[
                    'w-full px-3 py-2 flex items-center gap-2.5 text-left text-sm transition-all duration-150',
                    index === editMention.selectedIndex.value ? 'bg-indigo-600/90 text-white' : 'text-gray-300 hover:bg-slate-700/50'
                  ]"
                >
                  <div
                    v-if="option.type === 'everyone'"
                    class="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
                  >
                    @
                  </div>
                  <div
                    v-else
                    class="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium flex-shrink-0"
                  >
                    {{ getInitials(option.name) }}
                  </div>
                  <span class="truncate">{{ option.type === 'everyone' ? '@everyone' : option.name }}</span>
                </button>
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <button
                @click="saveEdit(comment._id)"
                :disabled="!editContent.trim()"
                class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg text-xs font-medium text-white transition-all duration-200"
              >
                Save
              </button>
              <button
                @click="cancelEdit"
                class="px-3 py-1 text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg text-xs transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Display mode -->
          <div v-else class="mt-1.5 px-3 py-2 bg-slate-800/30 rounded-xl">
            <p v-if="comment.content" class="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"><template v-for="(seg, i) in parseCommentContent(comment.content)" :key="i"><span v-if="seg.type === 'everyone'" class="text-amber-400 font-medium bg-amber-400/10 rounded px-1 py-0.5">@everyone</span><span v-else-if="seg.type === 'mention'" class="text-indigo-400 font-medium bg-indigo-400/10 rounded px-1 py-0.5">@{{ seg.value }}</span><a v-else-if="seg.type === 'link'" :href="seg.value" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 decoration-indigo-400/30 hover:decoration-indigo-300/50 transition-colors">{{ seg.value }}</a><template v-else>{{ seg.value }}</template></template></p>
            <!-- Media embeds (rendered below the text) -->
            <template v-if="comment.content" v-for="(seg, i) in parseCommentContent(comment.content)" :key="'media-' + i">
              <a v-if="seg.type === 'image'" :href="seg.value" target="_blank" rel="noopener noreferrer" class="block mt-2">
                <img :src="seg.value" :alt="seg.value" class="max-w-full max-h-64 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 cursor-pointer" loading="lazy" />
              </a>
              <video v-else-if="seg.type === 'video'" :src="seg.value" controls preload="metadata" class="max-w-full max-h-64 rounded-lg border border-slate-700/30 mt-2"></video>
            </template>
            <!-- File attachments -->
            <div v-if="comment.attachments?.length" :class="comment.content ? 'mt-2' : ''" class="space-y-1.5">
              <template v-for="att in comment.attachments" :key="att.fileId">
                <!-- Image preview -->
                <a v-if="att.mimeType.startsWith('image/')" :href="att.url" target="_blank" rel="noopener noreferrer" class="block">
                  <img :src="att.url" :alt="att.originalName" class="max-w-full max-h-48 rounded-lg border border-slate-700/30 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer" loading="lazy" />
                  <div class="text-[11px] text-gray-500 mt-0.5">{{ att.originalName }} · {{ formatBytes(att.size) }}</div>
                </a>
                <!-- Other file types -->
                <a
                  v-else
                  :href="att.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2.5 px-3 py-2 bg-slate-900/60 border border-slate-700/40 hover:border-indigo-500/40 rounded-lg transition-all duration-200 group/att"
                >
                  <span class="text-lg flex-shrink-0">{{ fileIcon(att.mimeType) }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs text-white truncate group-hover/att:text-indigo-300 transition-colors">{{ att.originalName }}</div>
                    <div class="text-[11px] text-gray-500">{{ formatBytes(att.size) }} · {{ att.mimeType }}</div>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-600 group-hover/att:text-indigo-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-10">
      <div class="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3 ring-1 ring-slate-700/30">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p class="text-gray-500 text-sm font-medium">No comments yet</p>
      <p class="text-gray-600 text-xs mt-1">Be the first to start the conversation</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskComment } from '~/types'
import { parseCommentContent } from '~/utils/mentionRenderer'

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
const stagedFile = ref<File | null>(null)

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)
const attachInput = ref<HTMLInputElement | null>(null)
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
    if (newComment.value.trim() || stagedFile.value) submitComment()
  }
}

function onEditKeydown(event: KeyboardEvent) {
  editMention.handleKeydown(event)
  if (event.defaultPrevented) return
  if (event.key === 'Escape') {
    cancelEdit()
  }
}

function onAttach(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  stagedFile.value = file
  input.value = ''
}

function fileIcon(mimeType: string): string {
  if (mimeType?.startsWith('image/')) return '🖼️'
  if (mimeType?.startsWith('video/')) return '🎬'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return '📊'
  if (mimeType?.includes('zip') || mimeType?.includes('tar')) return '📦'
  return '📎'
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

async function submitComment() {
  if (!newComment.value.trim() && !stagedFile.value) return
  if (isSubmitting.value) return
  isSubmitting.value = true
  const success = await addComment(props.taskId, newComment.value.trim(), stagedFile.value ?? undefined)
  if (success) {
    newComment.value = ''
    stagedFile.value = null
  }
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
