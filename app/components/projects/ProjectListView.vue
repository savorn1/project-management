<template>
  <div class="space-y-3">
    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- Status filter -->
        <select
          v-model="filterStatus"
          class="bg-slate-800/50 border border-slate-700/30 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>

        <!-- Priority filter -->
        <select
          v-model="filterPriority"
          class="bg-slate-800/50 border border-slate-700/30 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks..."
            class="pl-8 pr-3 py-1.5 bg-slate-800/50 border border-slate-700/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 w-44"
          />
        </div>
      </div>

      <button
        type="button"
        @click="emit('add-task', 'todo')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-500 text-sm">
      Loading tasks…
    </div>

    <!-- Table header -->
    <div v-else class="space-y-1.5">
      <div class="grid grid-cols-[1fr_120px_100px_100px_80px] gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
        <span>Task</span>
        <span>Assignee</span>
        <span>Status</span>
        <span>Priority</span>
        <span class="text-right">Due</span>
      </div>

      <!-- Tasks -->
      <TransitionGroup name="list-fade">
        <div
          v-for="task in filteredTasks"
          :key="task._id"
          @click="emit('select-task', task)"
          class="grid grid-cols-[1fr_120px_100px_100px_80px] gap-3 items-center px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 cursor-pointer transition-all duration-150 group"
        >
          <!-- Title + key -->
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-gray-600 flex-shrink-0">{{ task.key }}</span>
              <span
                class="text-sm font-medium text-white truncate"
                :class="{ 'line-through text-gray-500': task.status === 'done' }"
              >{{ task.title }}</span>
              <TaskPriorityBadge :priority="task.priority" class="flex-shrink-0" />
            </div>
          </div>

          <!-- Assignee -->
          <div>
            <div v-if="getAssignee(task.assigneeId)" class="flex items-center gap-1.5">
              <div class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[9px] text-white font-medium flex-shrink-0">
                {{ getInitials(getAssignee(task.assigneeId)?.name) }}
              </div>
              <span class="text-xs text-gray-400 truncate">{{ getAssignee(task.assigneeId)?.name }}</span>
            </div>
            <span v-else class="text-xs text-gray-600">—</span>
          </div>

          <!-- Status -->
          <div>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" :class="statusPillClass(task.status)">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(task.status)"></span>
              {{ statusLabel(task.status) }}
            </span>
          </div>

          <!-- Priority -->
          <div>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" :class="priorityPillClass(task.priority)">
              <span class="w-1.5 h-1.5 rounded-full" :class="priorityDotClass(task.priority)"></span>
              {{ priorityLabel(task.priority) }}
            </span>
          </div>

          <!-- Due date -->
          <div class="text-right">
            <span class="text-xs" :class="getDueDateClass(task)">
              {{ task.dueDate ? formatShortDate(task.dueDate) : '—' }}
            </span>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty -->
      <div v-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="text-3xl mb-3">📋</div>
        <p class="text-gray-400 text-sm font-medium">No tasks found</p>
        <p class="text-gray-600 text-xs mt-1">Try adjusting your filters or add a new task</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus, TaskPriority } from '~/types'
import { formatShortDate, getDueDateStatus } from '~/utils/formatters'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-task', status: TaskStatus): void
  (e: 'select-task', task: Task): void
}>()

const { tasksApi } = useApi()
const { getMemberById } = useTeam()

const tasks = ref<Task[]>([])
const isLoading = ref(true)
const search = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

onMounted(async () => {
  const result = await tasksApi.getByProject(props.projectId)
  tasks.value = result ?? []
  isLoading.value = false
})

const filteredTasks = computed(() => {
  return tasks.value.filter(t => {
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterPriority.value && t.priority !== filterPriority.value) return false
    if (search.value && !t.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }).sort((a, b) => a.order - b.order)
})

function getAssignee(id: string | null) {
  if (!id) return null
  return getMemberById(id)
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

function statusLabel(s: TaskStatus) {
  const m: Record<TaskStatus, string> = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
  return m[s]
}

function priorityLabel(p: TaskPriority) {
  const m: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
  return m[p]
}

function statusDotClass(s: TaskStatus) {
  const m: Record<TaskStatus, string> = { todo: 'bg-slate-400', in_progress: 'bg-blue-400', in_review: 'bg-amber-400', done: 'bg-emerald-400' }
  return m[s]
}

function priorityDotClass(p: TaskPriority) {
  const m: Record<TaskPriority, string> = { low: 'bg-slate-400', medium: 'bg-blue-400', high: 'bg-amber-400', urgent: 'bg-rose-400' }
  return m[p]
}

function statusPillClass(s: TaskStatus) {
  const m: Record<TaskStatus, string> = {
    todo: 'bg-slate-500/20 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    in_review: 'bg-amber-500/20 text-amber-300',
    done: 'bg-emerald-500/20 text-emerald-300',
  }
  return m[s]
}

function priorityPillClass(p: TaskPriority) {
  const m: Record<TaskPriority, string> = {
    low: 'bg-slate-500/20 text-slate-300',
    medium: 'bg-blue-500/20 text-blue-300',
    high: 'bg-amber-500/20 text-amber-300',
    urgent: 'bg-rose-500/20 text-rose-300',
  }
  return m[p]
}

function getDueDateClass(task: Task): string {
  if (task.status === 'done') return 'text-gray-600'
  const status = getDueDateStatus(task.dueDate)
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-500'
}
</script>

<style scoped>
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.2s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
