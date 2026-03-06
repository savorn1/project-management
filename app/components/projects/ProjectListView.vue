<template>
  <div class="space-y-3">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Status filter -->
        <div class="relative" ref="filterStatusRef">
          <button
            type="button"
            @click="showFilterStatus = !showFilterStatus; showFilterPriority = false"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap"
            :class="filterStatus ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:text-gray-300 hover:border-slate-500/50'"
          >
            <span v-if="filterStatus" class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotClass(filterStatus as TaskStatus)"></span>
            <svg v-else class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ filterStatus ? statusLabel(filterStatus as TaskStatus) : 'Status' }}</span>
            <svg class="w-3 h-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div v-if="showFilterStatus" class="absolute top-full left-0 mt-1.5 w-44 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
            <button type="button" @click="filterStatus = ''; showFilterStatus = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all"
              :class="!filterStatus ? 'bg-slate-700/60 text-white' : 'text-gray-400 hover:bg-slate-700/40 hover:text-white'">
              <span class="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0"></span>
              All Statuses
              <svg v-if="!filterStatus" class="w-3 h-3 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button v-for="opt in statusOptions" :key="opt.value" type="button"
              @click="filterStatus = opt.value; showFilterStatus = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all"
              :class="filterStatus === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="opt.dot"></span>
              {{ opt.label }}
              <svg v-if="filterStatus === opt.value" class="w-3 h-3 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </div>

        <!-- Priority filter -->
        <div class="relative" ref="filterPriorityRef">
          <button
            type="button"
            @click="showFilterPriority = !showFilterPriority; showFilterStatus = false"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap"
            :class="filterPriority ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:text-gray-300 hover:border-slate-500/50'"
          >
            <span v-if="filterPriority" class="w-2 h-2 rounded-full flex-shrink-0" :class="priorityDotClass(filterPriority as TaskPriority)"></span>
            <svg v-else class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{{ filterPriority ? priorityLabel(filterPriority as TaskPriority) : 'Priority' }}</span>
            <svg class="w-3 h-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div v-if="showFilterPriority" class="absolute top-full left-0 mt-1.5 w-44 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
            <button type="button" @click="filterPriority = ''; showFilterPriority = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all"
              :class="!filterPriority ? 'bg-slate-700/60 text-white' : 'text-gray-400 hover:bg-slate-700/40 hover:text-white'">
              <span class="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0"></span>
              All Priorities
              <svg v-if="!filterPriority" class="w-3 h-3 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button v-for="opt in priorityOptions" :key="opt.value" type="button"
              @click="filterPriority = opt.value; showFilterPriority = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all"
              :class="filterPriority === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="opt.dot"></span>
              {{ opt.label }}
              <svg v-if="filterPriority === opt.value" class="w-3 h-3 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks..."
            class="pl-8 pr-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 w-48 transition-colors"
          />
        </div>

        <!-- Clear filters -->
        <button
          v-if="filterStatus || filterPriority || search"
          type="button"
          @click="filterStatus = ''; filterPriority = ''; search = ''"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>

      <button
        type="button"
        @click="emit('add-task', 'todo')"
        class="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
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

    <div v-else>
      <!-- Column headers -->
      <div class="grid items-center gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider" style="grid-template-columns: 1fr 150px 140px 140px 80px">
        <span>Task</span>
        <span>Assignee</span>
        <span>Status</span>
        <span>Priority</span>
        <span class="text-right">Due</span>
      </div>

      <!-- Task rows -->
      <TransitionGroup name="list-fade" tag="div" class="space-y-1">
        <div
          v-for="task in filteredTasks"
          :key="task._id"
          @click="emit('select-task', task)"
          class="grid items-center gap-3 px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 cursor-pointer transition-all duration-150 group"
          style="grid-template-columns: 1fr 150px 140px 140px 80px"
        >
          <!-- Title + key -->
          <div class="min-w-0 flex items-center gap-2">
            <span class="text-[10px] font-mono text-gray-600 flex-shrink-0">{{ task.key }}</span>
            <span
              class="text-sm font-medium text-white truncate"
              :class="{ 'line-through text-gray-500': task.status === 'done' }"
            >{{ task.title }}</span>
            <TaskPriorityBadge :priority="task.priority" class="flex-shrink-0" />
          </div>

          <!-- Assignee -->
          <div @click.stop>
            <div v-if="getAssignee(task.assigneeId)" class="flex items-center gap-1.5">
              <div class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[9px] text-white font-medium flex-shrink-0">
                {{ getInitials(getAssignee(task.assigneeId)?.name) }}
              </div>
              <span class="text-xs text-gray-400 truncate">{{ getAssignee(task.assigneeId)?.name }}</span>
            </div>
            <span v-else class="text-xs text-gray-600">—</span>
          </div>

          <!-- Status inline dropdown -->
          <div class="relative" @click.stop>
            <button
              type="button"
              @click="toggleStatusDropdownWithPos(task._id, $event)"
              class="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold transition-all duration-150"
              :class="statusPillClass(task.status)"
            >
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusDotClass(task.status)"></span>
              {{ statusLabel(task.status) }}
              <svg class="w-3 h-3 opacity-60 ml-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="openStatusDropdown === task._id"
                class="fixed bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 py-1 overflow-hidden"
                :style="dropdownStyle(task._id, 'status')"
                style="z-index: 99999; min-width: 160px;"
              >
                <button
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  type="button"
                  @click.stop="updateStatus(task, opt.value); openStatusDropdown = null"
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all"
                  :class="task.status === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="opt.dot"></span>
                  {{ opt.label }}
                  <svg v-if="task.status === opt.value" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </Teleport>
            <!-- Backdrop to close -->
            <Teleport to="body">
              <div
                v-if="openStatusDropdown === task._id"
                class="fixed inset-0"
                style="z-index: 99998;"
                @click.stop="openStatusDropdown = null"
              ></div>
            </Teleport>
          </div>

          <!-- Priority inline dropdown -->
          <div class="relative" @click.stop>
            <button
              type="button"
              @click="togglePriorityDropdownWithPos(task._id, $event)"
              class="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold transition-all duration-150"
              :class="priorityPillClass(task.priority)"
            >
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="priorityDotClass(task.priority)"></span>
              {{ priorityLabel(task.priority) }}
              <svg class="w-3 h-3 opacity-60 ml-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="openPriorityDropdown === task._id"
                class="fixed bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 py-1 overflow-hidden"
                :style="dropdownStyle(task._id, 'priority')"
                style="z-index: 99999; min-width: 160px;"
              >
                <button
                  v-for="opt in priorityOptions"
                  :key="opt.value"
                  type="button"
                  @click.stop="updatePriority(task, opt.value); openPriorityDropdown = null"
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all"
                  :class="task.priority === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="opt.dot"></span>
                  {{ opt.label }}
                  <svg v-if="task.priority === opt.value" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </Teleport>
            <Teleport to="body">
              <div
                v-if="openPriorityDropdown === task._id"
                class="fixed inset-0"
                style="z-index: 99998;"
                @click.stop="openPriorityDropdown = null"
              ></div>
            </Teleport>
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

// Filter dropdown open state
const showFilterStatus = ref(false)
const showFilterPriority = ref(false)
const filterStatusRef = ref<HTMLElement | null>(null)
const filterPriorityRef = ref<HTMLElement | null>(null)

// Inline row dropdown state
const openStatusDropdown = ref<string | null>(null)
const openPriorityDropdown = ref<string | null>(null)
// Store button positions for Teleport positioning
const dropdownPositions = reactive<Record<string, { top: number; left: number }>>({})

onMounted(async () => {
  const result = await tasksApi.getByProject(props.projectId)
  tasks.value = result ?? []
  isLoading.value = false

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e: MouseEvent) {
  if (filterStatusRef.value && !filterStatusRef.value.contains(e.target as Node)) {
    showFilterStatus.value = false
  }
  if (filterPriorityRef.value && !filterPriorityRef.value.contains(e.target as Node)) {
    showFilterPriority.value = false
  }
}

function toggleStatusDropdown(taskId: string) {
  if (openStatusDropdown.value === taskId) {
    openStatusDropdown.value = null
    return
  }
  openPriorityDropdown.value = null
  openStatusDropdown.value = taskId
}

function togglePriorityDropdown(taskId: string) {
  if (openPriorityDropdown.value === taskId) {
    openPriorityDropdown.value = null
    return
  }
  openStatusDropdown.value = null
  openPriorityDropdown.value = taskId
}

function dropdownStyle(taskId: string, type: 'status' | 'priority') {
  const pos = dropdownPositions[`${taskId}-${type}`]
  if (!pos) return {}
  return { top: pos.top + 'px', left: pos.left + 'px' }
}

// Capture button position when toggling so Teleport dropdown can position itself
function toggleStatusDropdownWithPos(taskId: string, event: MouseEvent) {
  const btn = (event.currentTarget as HTMLElement)
  const rect = btn.getBoundingClientRect()
  dropdownPositions[`${taskId}-status`] = { top: rect.bottom + 6, left: rect.left }
  toggleStatusDropdown(taskId)
}

function togglePriorityDropdownWithPos(taskId: string, event: MouseEvent) {
  const btn = (event.currentTarget as HTMLElement)
  const rect = btn.getBoundingClientRect()
  dropdownPositions[`${taskId}-priority`] = { top: rect.bottom + 6, left: rect.left }
  togglePriorityDropdown(taskId)
}

const filteredTasks = computed(() => {
  return tasks.value.filter(t => {
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterPriority.value && t.priority !== filterPriority.value) return false
    if (search.value && !t.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }).sort((a, b) => a.order - b.order)
})

async function updateStatus(task: Task, status: TaskStatus) {
  const idx = tasks.value.findIndex(t => t._id === task._id)
  if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx]!, status }
  await tasksApi.update(task._id, { status })
}

async function updatePriority(task: Task, priority: TaskPriority) {
  const idx = tasks.value.findIndex(t => t._id === task._id)
  if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx]!, priority }
  await tasksApi.update(task._id, { priority })
}

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

const statusOptions = [
  { value: 'todo' as TaskStatus, label: 'To Do', dot: 'bg-slate-400' },
  { value: 'in_progress' as TaskStatus, label: 'In Progress', dot: 'bg-blue-400' },
  { value: 'in_review' as TaskStatus, label: 'In Review', dot: 'bg-amber-400' },
  { value: 'done' as TaskStatus, label: 'Done', dot: 'bg-emerald-400' },
]

const priorityOptions = [
  { value: 'low' as TaskPriority, label: 'Low', dot: 'bg-slate-400' },
  { value: 'medium' as TaskPriority, label: 'Medium', dot: 'bg-blue-400' },
  { value: 'high' as TaskPriority, label: 'High', dot: 'bg-amber-400' },
  { value: 'urgent' as TaskPriority, label: 'Urgent', dot: 'bg-rose-400' },
]

function statusLabel(s: TaskStatus) {
  return statusOptions.find(o => o.value === s)?.label ?? s
}
function priorityLabel(p: TaskPriority) {
  return priorityOptions.find(o => o.value === p)?.label ?? p
}
function statusDotClass(s: TaskStatus) {
  return statusOptions.find(o => o.value === s)?.dot ?? 'bg-slate-400'
}
function priorityDotClass(p: TaskPriority) {
  return priorityOptions.find(o => o.value === p)?.dot ?? 'bg-slate-400'
}

function statusPillClass(s: TaskStatus) {
  const m: Record<TaskStatus, string> = {
    todo: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30 hover:ring-slate-400/50',
    in_progress: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30 hover:ring-blue-400/50',
    in_review: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 hover:ring-amber-400/50',
    done: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 hover:ring-emerald-400/50',
  }
  return m[s]
}

function priorityPillClass(p: TaskPriority) {
  const m: Record<TaskPriority, string> = {
    low: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30 hover:ring-slate-400/50',
    medium: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30 hover:ring-blue-400/50',
    high: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 hover:ring-amber-400/50',
    urgent: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30 hover:ring-rose-400/50',
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
