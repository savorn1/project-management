<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <div
      class="flex items-center gap-2 text-sm transition-all duration-200 group cursor-pointer"
      :class="triggerClass"
      @click.stop="toggleCalendar"
    >
      <svg class="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span :class="modelValue ? 'text-gray-300' : 'text-gray-400'">
        {{ modelValue ? formatDisplay(modelValue) : placeholder }}
      </span>
      <span
        v-if="modelValue && clearable"
        role="button"
        @click.stop="clearDate"
        class="ml-auto p-0.5 text-gray-600 hover:text-gray-300 rounded transition-colors"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    </div>

    <!-- Calendar (Teleported to body so it escapes overflow containers) -->
    <ClientOnly>
      <Teleport to="body">
        <!-- Invisible backdrop to catch outside clicks -->
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[9998]"
          @click.stop="isOpen = false"
        ></div>

        <!-- Calendar panel -->
        <div
          v-if="isOpen"
          class="fixed z-[9999] p-4 bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 w-[280px]"
          :style="calendarStyle"
          @click.stop
        >
          <!-- Month/Year Header -->
          <div class="flex items-center justify-between mb-3">
            <button
              type="button"
              @click.stop="prevMonth"
              class="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span class="text-sm font-semibold text-white">
              {{ monthNames[viewMonth] }} {{ viewYear }}
            </span>

            <button
              type="button"
              @click.stop="nextMonth"
              class="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Day Names -->
          <div class="grid grid-cols-7 mb-1">
            <div
              v-for="day in dayNames"
              :key="day"
              class="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-0.5">
            <button
              v-for="(cell, idx) in calendarCells"
              :key="idx"
              type="button"
              @click.stop="cell.day ? selectDate(cell) : undefined"
              :disabled="!cell.day"
              class="relative w-9 h-9 flex items-center justify-center text-xs rounded-lg transition-all duration-150"
              :class="getCellClass(cell)"
            >
              <span v-if="cell.day" class="relative z-10">{{ cell.day }}</span>
            </button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/40">
            <button
              type="button"
              @click.stop="selectToday"
              class="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1 hover:bg-indigo-500/10 rounded-md transition-all duration-150"
            >
              Today
            </button>
            <button
              v-if="modelValue && clearable"
              type="button"
              @click.stop="clearDate; isOpen = false"
              class="text-xs font-medium text-gray-500 hover:text-gray-300 px-2 py-1 hover:bg-slate-700/50 rounded-md transition-all duration-150"
            >
              Clear
            </button>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | null
  placeholder?: string
  clearable?: boolean
  triggerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Set date',
  clearable: true,
  triggerClass: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const calendarStyle = ref<Record<string, string>>({})

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const today = new Date()
const initialDate = props.modelValue ? new Date(props.modelValue) : today
const viewMonth = ref(initialDate.getMonth())
const viewYear = ref(initialDate.getFullYear())

watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val)
    viewMonth.value = d.getMonth()
    viewYear.value = d.getFullYear()
  }
})

function toggleCalendar() {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  computePosition()
  isOpen.value = true
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const calH = 390
  const calW = 280

  let top = rect.bottom + 8
  if (top + calH > window.innerHeight) {
    top = rect.top - calH - 8
  }
  if (top < 8) top = 8

  let left = rect.left
  if (left + calW > window.innerWidth - 16) {
    left = window.innerWidth - calW - 16
  }
  if (left < 8) left = 8

  calendarStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function clearDate() {
  emit('update:modelValue', null)
  isOpen.value = false
}

interface CalendarCell {
  day: number | null
  month: number
  year: number
  isCurrentMonth: boolean
}

const calendarCells = computed((): CalendarCell[] => {
  const cells: CalendarCell[] = []
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      month: viewMonth.value === 0 ? 11 : viewMonth.value - 1,
      year: viewMonth.value === 0 ? viewYear.value - 1 : viewYear.value,
      isCurrentMonth: false,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      month: viewMonth.value,
      year: viewYear.value,
      isCurrentMonth: true,
    })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      month: viewMonth.value === 11 ? 0 : viewMonth.value + 1,
      year: viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value,
      isCurrentMonth: false,
    })
  }

  return cells
})

function isSelected(cell: CalendarCell): boolean {
  if (!props.modelValue || !cell.day) return false
  const selected = new Date(props.modelValue)
  return (
    selected.getDate() === cell.day &&
    selected.getMonth() === cell.month &&
    selected.getFullYear() === cell.year
  )
}

function isToday(cell: CalendarCell): boolean {
  if (!cell.day) return false
  const now = new Date()
  return (
    now.getDate() === cell.day &&
    now.getMonth() === cell.month &&
    now.getFullYear() === cell.year
  )
}

function getCellClass(cell: CalendarCell): string {
  if (!cell.day) return ''

  if (isSelected(cell)) {
    return 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500'
  }

  if (isToday(cell)) {
    return cell.isCurrentMonth
      ? 'text-indigo-400 font-semibold ring-1 ring-indigo-500/40 hover:bg-indigo-500/20'
      : 'text-indigo-400/50 font-semibold ring-1 ring-indigo-500/20 hover:bg-slate-700/30'
  }

  if (!cell.isCurrentMonth) {
    return 'text-gray-600 hover:text-gray-400 hover:bg-slate-700/30'
  }

  return 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
}

function selectDate(cell: CalendarCell) {
  if (!cell.day) return
  const date = new Date(cell.year, cell.month, cell.day, 12)
  const iso = date.toISOString().split('T')[0]
  emit('update:modelValue', iso)
  isOpen.value = false
}

function selectToday() {
  const now = new Date()
  viewMonth.value = now.getMonth()
  viewYear.value = now.getFullYear()
  const iso = now.toISOString().split('T')[0]
  emit('update:modelValue', iso)
  isOpen.value = false
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>
