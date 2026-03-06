<template>
  <div class="space-y-4">
    <!-- Calendar header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="prevMonth"
          class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-white min-w-[150px] text-center">
          {{ monthLabel }}
        </h3>
        <button
          type="button"
          @click="nextMonth"
          class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          @click="goToToday"
          class="px-2.5 py-1 text-xs text-gray-400 hover:text-white border border-slate-700/30 hover:border-slate-600/50 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      <div class="text-xs text-gray-500">
        {{ tasksWithDueDate.length }} task{{ tasksWithDueDate.length !== 1 ? 's' : '' }} with due dates
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-500 text-sm">
      Loading tasks…
    </div>

    <div v-else>
      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 gap-1 mb-1">
        <div
          v-for="day in dayHeaders"
          :key="day"
          class="text-center text-[11px] font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="min-h-[100px] rounded-xl border p-1.5 transition-colors"
          :class="[
            cell.isCurrentMonth ? 'bg-slate-800/30 border-slate-700/30' : 'bg-slate-900/20 border-slate-800/20',
            cell.isToday ? 'border-indigo-500/50 bg-indigo-500/5' : '',
          ]"
        >
          <!-- Date number -->
          <div class="mb-1 px-0.5">
            <span
              class="text-xs font-medium w-6 h-6 inline-flex items-center justify-center rounded-full"
              :class="[
                cell.isToday ? 'bg-indigo-500 text-white' : cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
              ]"
            >{{ cell.day }}</span>
          </div>

          <!-- Tasks for this day -->
          <div class="space-y-0.5">
            <div
              v-for="task in cell.tasks.slice(0, 3)"
              :key="task._id"
              @click.stop="emit('select-task', task)"
              class="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-opacity hover:opacity-80"
              :class="taskChipClass(task)"
              :title="task.title"
            >
              {{ task.title }}
            </div>
            <div
              v-if="cell.tasks.length > 3"
              class="px-1.5 py-0.5 text-[10px] text-gray-500 font-medium"
            >
              +{{ cell.tasks.length - 3 }} more
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/30">
        <span class="text-xs text-gray-500 font-medium">Status:</span>
        <div v-for="opt in statusLegend" :key="opt.value" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm" :class="opt.bg"></span>
          <span class="text-[11px] text-gray-400">{{ opt.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-task', task: Task): void
}>()

const { tasksApi } = useApi()

const tasks = ref<Task[]>([])
const isLoading = ref(true)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

onMounted(async () => {
  const result = await tasksApi.getByProject(props.projectId)
  tasks.value = result ?? []
  isLoading.value = false
})

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const statusLegend = [
  { value: 'todo', label: 'To Do', bg: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', bg: 'bg-blue-500' },
  { value: 'in_review', label: 'In Review', bg: 'bg-amber-500' },
  { value: 'done', label: 'Done', bg: 'bg-emerald-500' },
]

const monthLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const tasksWithDueDate = computed(() => tasks.value.filter(t => t.dueDate))

const tasksByDate = computed(() => {
  const map = new Map<string, Task[]>()
  for (const task of tasks.value) {
    if (!task.dueDate) continue
    const key = task.dueDate.split('T')[0]!
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(task)
  }
  return map
})

interface CalendarCell {
  day: number
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

const calendarCells = computed((): CalendarCell[] => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() // 0 = Sunday

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: CalendarCell[] = []

  // Prev month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const dateStr = formatDateKey(d)
    cells.push({ day: d.getDate(), date: dateStr, isCurrentMonth: false, isToday: false, tasks: tasksByDate.value.get(dateStr) ?? [] })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const dateStr = formatDateKey(date)
    cells.push({
      day: d,
      date: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      tasks: tasksByDate.value.get(dateStr) ?? [],
    })
  }

  // Next month padding to fill grid
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    const dateStr = formatDateKey(date)
    cells.push({ day: d, date: dateStr, isCurrentMonth: false, isToday: false, tasks: tasksByDate.value.get(dateStr) ?? [] })
  }

  return cells
})

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

function goToToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

function taskChipClass(task: Task): string {
  const m: Record<TaskStatus, string> = {
    todo: 'bg-slate-600/60 text-slate-200',
    in_progress: 'bg-blue-500/30 text-blue-200',
    in_review: 'bg-amber-500/30 text-amber-200',
    done: 'bg-emerald-500/30 text-emerald-200 line-through',
  }
  return m[task.status]
}
</script>
