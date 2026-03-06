<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- Zoom -->
        <div class="flex items-center gap-1 p-1 bg-slate-800/60 rounded-lg border border-slate-700/30">
          <button
            v-for="z in zoomOptions"
            :key="z.value"
            type="button"
            @click="zoom = z.value"
            class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
            :class="zoom === z.value ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200'"
          >
            {{ z.label }}
          </button>
        </div>

        <!-- Navigation -->
        <button type="button" @click="shiftLeft" class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button type="button" @click="goToToday" class="px-2.5 py-1 text-xs text-gray-400 hover:text-white border border-slate-700/30 hover:border-slate-600/50 rounded-lg transition-colors">Today</button>
        <button type="button" @click="shiftRight" class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <span class="text-sm text-gray-400 font-medium">{{ viewRangeLabel }}</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Legend -->
        <div class="flex items-center gap-3">
          <div v-for="opt in statusLegend" :key="opt.value" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm" :class="opt.color"></span>
            <span class="text-[11px] text-gray-400">{{ opt.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-500 text-sm">
      Loading tasks…
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-700/30">
      <div :style="{ minWidth: `${leftColWidth + colCount * colWidth}px` }">
        <!-- Timeline header -->
        <div class="flex border-b border-slate-700/30 bg-slate-800/60 sticky top-0 z-10">
          <!-- Task name column header -->
          <div :style="{ width: leftColWidth + 'px', minWidth: leftColWidth + 'px' }" class="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-slate-700/30 flex-shrink-0">
            Task
          </div>
          <!-- Date columns -->
          <div class="flex flex-1">
            <div
              v-for="(col, i) in timeColumns"
              :key="i"
              class="text-center text-[11px] font-medium py-2 border-r border-slate-700/20 flex-shrink-0"
              :style="{ width: colWidth + 'px' }"
              :class="col.isToday ? 'text-indigo-400 bg-indigo-500/5' : 'text-gray-500'"
            >
              <div>{{ col.label }}</div>
              <div v-if="zoom === 'month'" class="text-[10px] text-gray-600">{{ col.subLabel }}</div>
            </div>
          </div>
        </div>

        <!-- Task rows -->
        <div v-if="tasksToShow.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="text-3xl mb-3">📅</div>
          <p class="text-gray-400 text-sm font-medium">No tasks with dates</p>
          <p class="text-gray-600 text-xs mt-1">Tasks need a due date to appear on the timeline</p>
        </div>

        <div
          v-for="task in tasksToShow"
          :key="task._id"
          class="flex items-center border-b border-slate-700/20 hover:bg-slate-800/30 group transition-colors"
          style="min-height: 44px;"
        >
          <!-- Task name -->
          <div
            :style="{ width: leftColWidth + 'px', minWidth: leftColWidth + 'px' }"
            class="px-4 py-2 border-r border-slate-700/20 flex-shrink-0 cursor-pointer"
            @click="emit('select-task', task)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[10px] font-mono text-gray-600 flex-shrink-0">{{ task.key }}</span>
              <span class="text-sm text-white truncate" :class="{ 'line-through text-gray-500': task.status === 'done' }">{{ task.title }}</span>
            </div>
          </div>

          <!-- Timeline bar area -->
          <div class="flex-1 relative" :style="{ height: '44px' }">
            <!-- Grid lines -->
            <div class="absolute inset-0 flex pointer-events-none">
              <div
                v-for="(col, i) in timeColumns"
                :key="i"
                class="border-r border-slate-700/10 flex-shrink-0"
                :style="{ width: colWidth + 'px' }"
                :class="col.isToday ? 'bg-indigo-500/3' : ''"
              ></div>
            </div>

            <!-- Task bar -->
            <div
              v-if="getBar(task)"
              class="absolute top-1/2 -translate-y-1/2 rounded-md cursor-pointer flex items-center px-2 text-[11px] font-medium text-white overflow-hidden transition-opacity hover:opacity-90"
              :style="getBar(task)!.style"
              :class="barColorClass(task)"
              @click="emit('select-task', task)"
              :title="task.title"
            >
              <span class="truncate">{{ task.title }}</span>
            </div>

            <!-- Due date only (no start = just a pin) -->
            <div
              v-else-if="getDuePin(task) !== null"
              class="absolute top-1/2 -translate-y-1/2 cursor-pointer"
              :style="{ left: getDuePin(task)! + 'px' }"
              @click="emit('select-task', task)"
              :title="task.title"
            >
              <div class="w-3 h-3 rounded-full border-2 border-white -translate-x-1/2" :class="pinColorClass(task)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No-date tasks info -->
    <div v-if="!isLoading && noDateTasks.length > 0" class="text-xs text-gray-600 text-center">
      {{ noDateTasks.length }} task{{ noDateTasks.length !== 1 ? 's' : '' }} without dates not shown
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

type Zoom = 'week' | 'month' | 'quarter'
const zoom = ref<Zoom>('month')
const zoomOptions: { value: Zoom; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
]

const leftColWidth = 220
const colWidth = 44

// Anchor date (start of view)
const anchor = ref(startOfCurrentPeriod())

function startOfCurrentPeriod(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (zoom.value === 'week') {
    d.setDate(d.getDate() - d.getDay()) // Sunday
  } else if (zoom.value === 'month') {
    d.setDate(1)
  } else {
    // Quarter: start of current quarter
    const q = Math.floor(d.getMonth() / 3)
    d.setMonth(q * 3, 1)
  }
  return d
}

const colCount = computed(() => {
  if (zoom.value === 'week') return 7
  if (zoom.value === 'month') return 12 // weeks
  return 12 // months for quarter
})

onMounted(async () => {
  const result = await tasksApi.getByProject(props.projectId)
  tasks.value = result ?? []
  isLoading.value = false
})

watch(zoom, () => {
  anchor.value = startOfCurrentPeriod()
})

const today = new Date()
today.setHours(0, 0, 0, 0)

interface TimeColumn {
  label: string
  subLabel?: string
  date: Date
  isToday: boolean
}

const timeColumns = computed((): TimeColumn[] => {
  const cols: TimeColumn[] = []
  const a = new Date(anchor.value)

  for (let i = 0; i < colCount.value; i++) {
    const d = new Date(a)

    if (zoom.value === 'week') {
      d.setDate(a.getDate() + i)
      cols.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        subLabel: String(d.getDate()),
        date: d,
        isToday: d.toDateString() === today.toDateString(),
      })
    } else if (zoom.value === 'month') {
      // columns = weeks
      d.setDate(a.getDate() + i * 7)
      const end = new Date(d)
      end.setDate(d.getDate() + 6)
      cols.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        subLabel: d.toLocaleDateString('en-US', { month: 'short' }),
        date: d,
        isToday: today >= d && today <= end,
      })
    } else {
      // quarter: columns = months
      d.setMonth(a.getMonth() + i, 1)
      cols.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        subLabel: String(d.getFullYear()),
        date: d,
        isToday: d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth(),
      })
    }
  }
  return cols
})

const viewStart = computed(() => timeColumns.value[0]!.date)
const viewEnd = computed(() => {
  const last = timeColumns.value[timeColumns.value.length - 1]!.date
  const end = new Date(last)
  if (zoom.value === 'week') end.setDate(end.getDate() + 1)
  else if (zoom.value === 'month') end.setDate(end.getDate() + 7)
  else end.setMonth(end.getMonth() + 1)
  return end
})

const viewRangeLabel = computed(() => {
  const start = viewStart.value
  const end = new Date(viewEnd.value)
  end.setDate(end.getDate() - 1)
  if (zoom.value === 'week') {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (zoom.value === 'month') {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
})

const tasksToShow = computed(() => {
  // Show tasks that have a due date (and optionally are within view or near it)
  return tasks.value.filter(t => t.dueDate).sort((a, b) => {
    const da = new Date(a.dueDate!).getTime()
    const db = new Date(b.dueDate!).getTime()
    return da - db
  })
})

const noDateTasks = computed(() => tasks.value.filter(t => !t.dueDate))

// Convert a date to pixel offset from viewStart
function dateToX(d: Date): number {
  const totalMs = viewEnd.value.getTime() - viewStart.value.getTime()
  const offsetMs = d.getTime() - viewStart.value.getTime()
  const totalWidth = colCount.value * colWidth
  return (offsetMs / totalMs) * totalWidth
}

interface Bar {
  style: Record<string, string>
}

function getBar(task: Task): Bar | null {
  if (!task.dueDate) return null
  const due = new Date(task.dueDate)
  due.setHours(23, 59, 59)
  const created = new Date(task.createdAt)
  created.setHours(0, 0, 0, 0)

  const start = created < viewStart.value ? viewStart.value : created
  const end = due > viewEnd.value ? viewEnd.value : due

  if (end < viewStart.value || start > viewEnd.value) return null

  const x = dateToX(start)
  const w = Math.max(dateToX(end) - x, 20)

  return { style: { left: x + 'px', width: w + 'px', height: '26px' } }
}

function getDuePin(task: Task): number | null {
  if (!task.dueDate) return null
  const due = new Date(task.dueDate)
  if (due < viewStart.value || due > viewEnd.value) return null
  return dateToX(due)
}

function shiftLeft() {
  const a = new Date(anchor.value)
  if (zoom.value === 'week') a.setDate(a.getDate() - 7)
  else if (zoom.value === 'month') a.setMonth(a.getMonth() - 1)
  else a.setMonth(a.getMonth() - 3)
  anchor.value = a
}

function shiftRight() {
  const a = new Date(anchor.value)
  if (zoom.value === 'week') a.setDate(a.getDate() + 7)
  else if (zoom.value === 'month') a.setMonth(a.getMonth() + 1)
  else a.setMonth(a.getMonth() + 3)
  anchor.value = a
}

function goToToday() {
  anchor.value = startOfCurrentPeriod()
}

const statusLegend = [
  { value: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'in_review', label: 'In Review', color: 'bg-amber-500' },
  { value: 'done', label: 'Done', color: 'bg-emerald-500' },
]

function barColorClass(task: Task): string {
  const m: Record<TaskStatus, string> = {
    todo: 'bg-slate-600',
    in_progress: 'bg-blue-600',
    in_review: 'bg-amber-600',
    done: 'bg-emerald-600 opacity-70',
  }
  return m[task.status]
}

function pinColorClass(task: Task): string {
  const m: Record<TaskStatus, string> = {
    todo: 'bg-slate-500',
    in_progress: 'bg-blue-500',
    in_review: 'bg-amber-500',
    done: 'bg-emerald-500',
  }
  return m[task.status]
}
</script>
