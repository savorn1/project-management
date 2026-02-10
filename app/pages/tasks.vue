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
    <TaskList :tasks="filteredTasks" @toggle="toggleTaskComplete" />

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
                {{ member.avatar }} {{ member.name }}
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
import type { TaskPriority } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Tasks | TaskFlow',
  description: 'Manage all your tasks'
})

const { filteredTasks, filters, toggleTaskComplete, createTask, clearFilters, loadTasks, tasks } = useTasks()
const { projects, loadProjects } = useProjects()
const { members, loadMembers } = useTeam()

onMounted(async () => {
  if (tasks.value.length === 0) await loadTasks()
  if (projects.value.length === 0) await loadProjects()
  if (members.value.length === 0) await loadMembers()
})

const showCreateModal = ref(false)

const newTask = ref({
  title: '',
  description: '',
  projectId: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeId: null as string | null
})

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
