<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">All Tasks</h1>
        <p class="text-gray-400 mt-1">View and manage tasks across all projects</p>
      </div>
      <BaseButton @click="showCreateModal = true">
        <span>➕</span>
        New Task
      </BaseButton>
    </div>

    <!-- Filters -->
    <BaseCard>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search tasks..."
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          v-model="filters.status"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>

        <select
          v-model="filters.priority"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          v-model="filters.projectId"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Projects</option>
          <option v-for="project in projects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>

        <BaseButton variant="ghost" @click="clearFilters" size="sm">
          Clear
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Task List -->
    <TaskList :tasks="filteredTasks" @toggle="toggleTaskComplete" @select="openPreview" />

    <!-- Task Preview Slide-over -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="selectedTask" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selectedTask = null"></div>

          <div class="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-slate-700/50 shadow-2xl overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white truncate">Task Preview</h2>
              <div class="flex items-center gap-2">
                <button
                  @click="handleDeleteFromPreview"
                  class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  @click="selectedTask = null"
                  class="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Title (editable) -->
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Title</p>
                <input
                  :value="selectedTask.title"
                  @blur="handleFieldUpdate('title', ($event.target as HTMLInputElement).value)"
                  @keydown.enter="($event.target as HTMLInputElement).blur()"
                  class="w-full text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none pb-1 transition-colors"
                />
              </div>

              <!-- Status & Priority -->
              <div class="flex items-center gap-3">
                <select
                  :value="selectedTask.status"
                  @change="handleStatusChange(($event.target as HTMLSelectElement).value as TaskStatus)"
                  class="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>

                <select
                  :value="selectedTask.priority"
                  @change="handlePriorityChange(($event.target as HTMLSelectElement).value as TaskPriority)"
                  class="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Project</p>
                  <p class="text-sm text-gray-300">{{ getProjectName(selectedTask.projectId) }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Assignee</p>
                  <select
                    :value="selectedTask.assigneeId || ''"
                    @change="handleAssigneeChange(($event.target as HTMLSelectElement).value || null)"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  >
                    <option value="">Unassigned</option>
                    <option v-for="member in members" :key="member._id" :value="member._id">
                      {{ member.name }}
                    </option>
                  </select>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
                  <input
                    type="date"
                    :value="selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''"
                    @change="handleFieldUpdate('dueDate', ($event.target as HTMLInputElement).value || null)"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                  <p class="text-sm text-gray-300">{{ formatDate(selectedTask.createdAt) }}</p>
                </div>
              </div>

              <!-- Description (editable) -->
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
                <ClientOnly>
                  <WysiwygEditor
                    :model-value="selectedTask.description || ''"
                    @update:model-value="handleDescriptionUpdate"
                    placeholder="Add a description..."
                  />
                  <template #fallback>
                    <div class="w-full min-h-[100px] px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-gray-400 animate-pulse">
                      Loading editor...
                    </div>
                  </template>
                </ClientOnly>
              </div>

              <!-- Tags -->
              <div v-if="selectedTask.tags && selectedTask.tags.length > 0">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in selectedTask.tags"
                    :key="tag"
                    class="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-md"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Comments / Activity Tabs -->
              <div class="border-t border-slate-700/50 pt-4">
                <div class="flex gap-4 mb-4">
                  <button
                    @click="previewTab = 'comments'"
                    class="text-sm font-medium pb-2 border-b-2 transition-colors"
                    :class="previewTab === 'comments' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent hover:text-white'"
                  >
                    Comments
                  </button>
                  <button
                    @click="previewTab = 'activity'"
                    class="text-sm font-medium pb-2 border-b-2 transition-colors"
                    :class="previewTab === 'activity' ? 'text-indigo-400 border-indigo-400' : 'text-gray-400 border-transparent hover:text-white'"
                  >
                    Activity
                  </button>
                </div>

                <TaskCommentSection v-if="previewTab === 'comments'" :task-id="selectedTask._id" />
                <TaskActivitySection v-else :task-id="selectedTask._id" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Create Task Modal -->
    <BaseModal v-model="showCreateModal" title="Create New Task" size="2xl">
      <form @submit.prevent="handleCreateTask" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Title</label>
          <input
            v-model="newTask.title"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Task title"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
          <ClientOnly>
            <WysiwygEditor
              v-model="newTask.description"
              placeholder="Task description..."
            />
            <template #fallback>
              <div class="w-full min-h-[120px] px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 animate-pulse">
                Loading editor...
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Project</label>
            <select
              v-model="newTask.projectId"
              required
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Select project</option>
              <option v-for="project in projects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Priority</label>
            <select
              v-model="newTask.priority"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Due Date</label>
            <input
              v-model="newTask.dueDate"
              type="date"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Assignee</label>
            <select
              v-model="newTask.assigneeId"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option :value="null">Unassigned</option>
              <option v-for="member in members" :key="member._id" :value="member._id">
               {{ member.name }}
              </option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreateTask">Create Task</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskPriority, TaskStatus } from '~/types'
import { formatDate } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Tasks | TaskFlow',
  description: 'Manage all your tasks'
})

const { filteredTasks, filters, toggleTaskComplete, createTask, updateTask, deleteTask, clearFilters, loadTasks, tasks } = useTasks()
const { projects, loadProjects, getProjectById } = useProjects()
const { members, loadMembers } = useTeam()

onMounted(async () => {
  if (tasks.value.length === 0) await loadTasks()
  if (projects.value.length === 0) await loadProjects()
  if (members.value.length === 0) await loadMembers()
})

const showCreateModal = ref(false)
const selectedTask = ref<Task | null>(null)
const previewTab = ref<'comments' | 'activity'>('comments')

const newTask = ref({
  title: '',
  description: '',
  projectId: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeId: null as string | null
})

function openPreview(task: Task) {
  selectedTask.value = task
}

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
}

async function handleStatusChange(status: TaskStatus) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { status })
  selectedTask.value = { ...selectedTask.value, status }
}

async function handlePriorityChange(priority: TaskPriority) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { priority })
  selectedTask.value = { ...selectedTask.value, priority }
}

async function handleAssigneeChange(assigneeId: string | null) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { assigneeId })
  selectedTask.value = { ...selectedTask.value, assigneeId }
}

async function handleFieldUpdate(field: string, value: string | null) {
  if (!selectedTask.value) return
  if (field === 'title' && value === selectedTask.value.title) return
  if (field === 'title' && !value?.trim()) return
  await updateTask(selectedTask.value._id, { [field]: value })
  selectedTask.value = { ...selectedTask.value, [field]: value }
}

let descriptionTimer: ReturnType<typeof setTimeout> | null = null
function handleDescriptionUpdate(value: string) {
  if (!selectedTask.value) return
  selectedTask.value = { ...selectedTask.value, description: value }
  if (descriptionTimer) clearTimeout(descriptionTimer)
  descriptionTimer = setTimeout(() => {
    if (selectedTask.value) {
      updateTask(selectedTask.value._id, { description: value })
    }
  }, 800)
}

async function handleDeleteFromPreview() {
  if (!selectedTask.value) return
  await deleteTask(selectedTask.value._id)
  selectedTask.value = null
}

function handleCreateTask() {
  if (newTask.value.title && newTask.value.projectId) {
    createTask({
      ...newTask.value,
      dueDate: newTask.value.dueDate || null
    })
    showCreateModal.value = false
    newTask.value = {
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: null
    }
  }
}
</script>
