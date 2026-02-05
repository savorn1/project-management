<template>
  <div class="space-y-6" v-if="project">
    <!-- Project Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/projects" class="text-gray-400 hover:text-white transition-colors">
          ← Back
        </NuxtLink>
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          :class="getColorClass(project.color)"
        >
          {{ project.icon }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">{{ project.name }}</h1>
          <p class="text-gray-400 mt-1">{{ project.description }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <AvatarGroup :members="projectMembers" :max="5" />
        <BaseButton variant="secondary">
          ⚙️ Settings
        </BaseButton>
      </div>
    </div>

    <!-- Project Stats -->
    <div class="grid grid-cols-4 gap-4">
      <BaseCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-white">{{ projectTasks.length }}</p>
          <p class="text-gray-400 text-sm mt-1">Total Tasks</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-emerald-400">{{ completedTasks }}</p>
          <p class="text-gray-400 text-sm mt-1">Completed</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-blue-400">{{ inProgressTasks }}</p>
          <p class="text-gray-400 text-sm mt-1">In Progress</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-indigo-400">{{ progress }}%</p>
          <p class="text-gray-400 text-sm mt-1">Progress</p>
        </div>
      </BaseCard>
    </div>

    <!-- Kanban Board -->
    <KanbanBoard :project-id="projectId" @add-task="handleAddTask" />

    <!-- Add Task Modal -->
    <BaseModal v-model="showAddTaskModal" title="Add Task" size="2xl">
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

          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Due Date</label>
            <input
              v-model="newTask.dueDate"
              type="date"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Assignee</label>
          <select
            v-model="newTask.assigneeId"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option :value="null">Unassigned</option>
            <option v-for="member in projectMembers" :key="member.id" :value="member.id">
              {{ member.avatar }} {{ member.name }}
            </option>
          </select>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showAddTaskModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreateTask">Add Task</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>

  <!-- Not Found -->
  <div v-else class="flex flex-col items-center justify-center py-20">
    <EmptyState
      icon="🔍"
      title="Project not found"
      description="The project you're looking for doesn't exist"
    >
      <template #action>
        <NuxtLink to="/projects">
          <BaseButton>Back to Projects</BaseButton>
        </NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import type { TaskStatus, TaskPriority } from '~/types'

const route = useRoute()
const projectId = route.params.id as string

const { createTask, getTasksByProject, loadTasks, tasks } = useTasks()
const { getProjectById, loadProjects, projects } = useProjects()
const { members, loadMembers, getMemberById } = useTeam()

onMounted(async () => {
  if (tasks.value.length === 0) await loadTasks()
  if (projects.value.length === 0) await loadProjects()
  if (members.value.length === 0) await loadMembers()
})

const project = computed(() => getProjectById(projectId))
const projectTasks = computed(() => getTasksByProject(projectId))
const projectMembers = computed(() => {
  if (!project.value) return []
  return project.value.memberIds
    .map(id => getMemberById(id))
    .filter(Boolean) as typeof members.value
})
const progress = computed(() => {
  if (projectTasks.value.length === 0) return 0
  const completed = projectTasks.value.filter(t => t.status === 'done').length
  return Math.round((completed / projectTasks.value.length) * 100)
})

const completedTasks = computed(() => projectTasks.value.filter(t => t.status === 'done').length)
const inProgressTasks = computed(() => projectTasks.value.filter(t => t.status === 'in_progress').length)

useSeoMeta({
  title: () => project.value ? `${project.value.name} | TaskFlow` : 'Project | TaskFlow',
  description: () => project.value?.description || 'Project details'
})

const showAddTaskModal = ref(false)
const newTaskStatus = ref<TaskStatus>('todo')

const newTask = ref({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeId: null as string | null
})

function handleAddTask(status: TaskStatus) {
  newTaskStatus.value = status
  showAddTaskModal.value = true
}

function handleCreateTask() {
  if (newTask.value.title) {
    createTask({
      ...newTask.value,
      projectId,
      status: newTaskStatus.value,
      dueDate: newTask.value.dueDate || null
    })
    showAddTaskModal.value = false
    newTask.value = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: null
    }
  }
}

function getColorClass(color: string): string {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    emerald: 'bg-emerald-500/20',
    amber: 'bg-amber-500/20',
    rose: 'bg-rose-500/20',
    cyan: 'bg-cyan-500/20',
    violet: 'bg-violet-500/20',
    pink: 'bg-pink-500/20',
    teal: 'bg-teal-500/20'
  }
  return colors[color] || 'bg-indigo-500/20'
}
</script>
