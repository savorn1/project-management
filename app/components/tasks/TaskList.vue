<template>
  <div
    class="space-y-1.5"
    :class="{ 'select-none': isDragging }"
    role="list"
    :aria-label="isDragging ? 'Reordering tasks' : 'Task list'"
  >
    <TransitionGroup name="task-list">
      <div
        v-for="(task, index) in localTasks"
        :key="task._id"
        ref="itemRefs"
        role="listitem"
        :aria-grabbed="draggedIndex === index"
        :aria-label="`${task.title}, position ${index + 1} of ${localTasks.length}`"
        class="relative transition-all duration-200"
        :style="{
          marginTop: isDragging && dropTargetIndex === index && draggedIndex !== index ? `${DROP_ZONE_SPACING}px` : '0',
          marginBottom: isDragging && dropTargetIndex === index + 1 && draggedIndex !== index + 1 ? `${DROP_ZONE_SPACING}px` : '0'
        }"
      >
        <!-- Drop zone indicator above (subtle for all, prominent for target) -->
        <div
          v-if="isDragging && index !== draggedIndex && index !== draggedIndex + 1"
          class="absolute -top-1 left-8 right-8 flex items-center z-10 pointer-events-none transition-all duration-200"
          :class="dropTargetIndex === index ? 'opacity-100 -top-4 left-0 right-0' : 'opacity-30'"
          aria-hidden="true"
        >
          <div
            class="rounded-full bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index ? 'w-2 h-2 shadow-lg shadow-indigo-500/50 animate-pulse' : 'w-1 h-1'"
          ></div>
          <div
            class="flex-1 bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index ? 'h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-500/30' : 'h-[1px] opacity-50'"
          ></div>
          <div
            class="rounded-full bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index ? 'w-2 h-2 shadow-lg shadow-indigo-500/50 animate-pulse' : 'w-1 h-1'"
          ></div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3.5 bg-slate-800/40 rounded-xl border cursor-pointer"
          :class="[
            draggedIndex === index
              ? 'border-indigo-500/40 bg-indigo-500/5 shadow-xl shadow-indigo-500/20 opacity-60 scale-[1.02] rotate-[0.5deg]'
              : isDragging && dropTargetIndex === index
                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/20 scale-[1.01]'
                : 'border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/10 group'
          ]"
          :style="{
            transition: draggedIndex === index
              ? 'opacity 0.15s ease-out, transform 0.15s ease-out, border-color 0.2s ease'
              : 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }"
          @click="!isDragging && $emit('select', task)"
        >
          <!-- Drag handle -->
          <div
            class="flex-shrink-0 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded transition-colors"
            :class="{ 'cursor-grabbing': draggedIndex === index }"
            :aria-label="`Drag to reorder ${task.title}`"
            role="button"
            tabindex="0"
            @pointerdown.stop.prevent="onPointerDown(index, $event)"
            @keydown.space.prevent="onKeyboardReorder(index, 1)"
            @keydown.up.prevent="onKeyboardReorder(index, -1)"
            @keydown.down.prevent="onKeyboardReorder(index, 1)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" />
              <circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" />
              <circle cx="9" cy="20" r="1.5" /><circle cx="15" cy="20" r="1.5" />
            </svg>
          </div>

          <!-- Checkbox -->
          <button
            @click.stop="$emit('toggle', task._id)"
            class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            :class="task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
              : 'border-gray-600 hover:border-indigo-500 hover:bg-indigo-500/10'"
            :aria-label="`Mark ${task.title} as ${task.status === 'done' ? 'incomplete' : 'complete'}`"
          >
            <svg v-if="task.status === 'done'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Task Key -->
          <span class="text-[11px] font-mono text-gray-500 tracking-wide flex-shrink-0 w-20 truncate">
            {{ task.key }}
          </span>

          <!-- Title + Project -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5">
              <h4
                class="text-sm font-medium text-white truncate"
                :class="{ 'line-through text-gray-500': task.status === 'done' }"
              >
                {{ task.title }}
              </h4>
              <TaskPriorityBadge :priority="task.priority" />
            </div>
            <p class="text-xs text-gray-500 mt-0.5 truncate">{{ getProjectName(task.projectId) }}</p>
          </div>

          <!-- Sprint badge -->
          <span
            v-if="task.sprintId && getSprintName(task.sprintId, task.projectId)"
            class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/25"
          >
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ getSprintName(task.sprintId, task.projectId) }}
          </span>

          <!-- Assignee -->
          <div v-if="getAssignee(task.assigneeId)" class="flex-shrink-0">
            <div
              class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium ring-2 ring-slate-900"
              :title="getAssignee(task.assigneeId)?.name"
            >
              {{ getInitials(getAssignee(task.assigneeId)?.name) }}
            </div>
          </div>

          <!-- Due Date -->
          <div class="flex-shrink-0 flex items-center gap-1 text-xs min-w-[70px] justify-end" :class="getDueDateClass(task)">
            <svg v-if="task.dueDate" class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ task.dueDate ? formatShortDate(task.dueDate) : '-' }}
          </div>

          <!-- Status Badge -->
          <BaseBadge :color="getStatusColor(task.status)" size="xs">
            {{ getStatusLabel(task.status) }}
          </BaseBadge>
        </div>

        <!-- Drop zone indicator below (subtle for all, prominent for target) -->
        <div
          v-if="isDragging && index + 1 !== draggedIndex && index !== draggedIndex"
          class="absolute -bottom-1 left-8 right-8 flex items-center z-10 pointer-events-none transition-all duration-200"
          :class="dropTargetIndex === index + 1 ? 'opacity-100 -bottom-4 left-0 right-0' : 'opacity-30'"
          aria-hidden="true"
        >
          <div
            class="rounded-full bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index + 1 ? 'w-2 h-2 shadow-lg shadow-indigo-500/50 animate-pulse' : 'w-1 h-1'"
          ></div>
          <div
            class="flex-1 bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index + 1 ? 'h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-500/30' : 'h-[1px] opacity-50'"
          ></div>
          <div
            class="rounded-full bg-indigo-500 transition-all duration-200"
            :class="dropTargetIndex === index + 1 ? 'w-2 h-2 shadow-lg shadow-indigo-500/50 animate-pulse' : 'w-1 h-1'"
          ></div>
        </div>
      </div>
    </TransitionGroup>

    <EmptyState
      v-if="localTasks.length === 0"
      icon="✅"
      title="No tasks found"
      description="Try adjusting your filters or create a new task"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'
import { formatShortDate, getDueDateStatus } from '~/utils/formatters'
import { STATUS_CONFIG } from '~/utils/constants'

// Constants for drag behavior
const DRAG_THRESHOLD = 5 // pixels before drag starts
const DROP_ZONE_SPACING = 32 // spacing expansion in pixels
const SCROLL_THRESHOLD = 80 // pixels from edge to trigger scroll
const SCROLL_SPEED = 10 // pixels per frame
const THROTTLE_MS = 16 // ~60fps

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'select', task: Task): void
  (e: 'reorder', tasks: Task[]): void
}>()

const { getProjectById } = useProjects()
const { getMemberById } = useTeam()
const { getProjectSprints } = useSprints()

// Drag state
const localTasks = ref<Task[]>([...props.tasks])
const isDragging = ref(false)
const draggedIndex = ref<number | null>(null)
const dropTargetIndex = ref<number | null>(null)
const itemRefs = ref<HTMLElement[]>([])
const currentPointerY = ref(0)

// Cleanup references
let cleanupFunctions: Array<() => void> = []
let autoScrollFrame: number | null = null
let startY = 0
let lastMoveTime = 0

// Sync local tasks with props when not dragging
watch(() => props.tasks, (newTasks) => {
  if (!isDragging.value) {
    localTasks.value = [...newTasks]
  }
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})

function cleanup() {
  cleanupFunctions.forEach(fn => fn())
  cleanupFunctions = []
  if (autoScrollFrame !== null) {
    cancelAnimationFrame(autoScrollFrame)
    autoScrollFrame = null
  }
  isDragging.value = false
  draggedIndex.value = null
  dropTargetIndex.value = null
}

function autoScroll() {
  const clientY = currentPointerY.value
  const viewportHeight = window.innerHeight

  if (clientY < SCROLL_THRESHOLD) {
    window.scrollBy({ top: -SCROLL_SPEED, behavior: 'instant' })
  } else if (clientY > viewportHeight - SCROLL_THRESHOLD) {
    window.scrollBy({ top: SCROLL_SPEED, behavior: 'instant' })
  }

  if (isDragging.value) {
    autoScrollFrame = requestAnimationFrame(autoScroll)
  }
}

function onKeyboardReorder(index: number, direction: number) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localTasks.value.length) return

  const arr = [...localTasks.value]
  const [moved] = arr.splice(index, 1)
  if (!moved) return

  arr.splice(newIndex, 0, moved)
  localTasks.value = arr
  emit('reorder', arr)
}

function onPointerDown(index: number, event: PointerEvent) {
  draggedIndex.value = index
  dropTargetIndex.value = index
  startY = event.clientY
  currentPointerY.value = event.clientY
  isDragging.value = false

  const onPointerMove = (e: PointerEvent) => {
    currentPointerY.value = e.clientY

    // Only start dragging after threshold
    if (!isDragging.value && Math.abs(e.clientY - startY) < DRAG_THRESHOLD) return

    if (!isDragging.value) {
      isDragging.value = true
      autoScrollFrame = requestAnimationFrame(autoScroll)
    }

    // Throttle for performance
    const now = Date.now()
    if (now - lastMoveTime < THROTTLE_MS) return
    lastMoveTime = now

    // Calculate drop target
    const items = itemRefs.value
    if (!items || items.length === 0 || draggedIndex.value === null) return

    let targetIndex = draggedIndex.value
    for (let i = 0; i < items.length; i++) {
      const rect = items[i]?.getBoundingClientRect()
      if (!rect) continue
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        targetIndex = i
        break
      }
      targetIndex = i + 1
    }

    targetIndex = Math.max(0, Math.min(targetIndex, localTasks.value.length))
    dropTargetIndex.value = targetIndex

    // Swap items
    if (targetIndex !== draggedIndex.value && targetIndex < localTasks.value.length) {
      const arr = [...localTasks.value]
      const [moved] = arr.splice(draggedIndex.value, 1)
      if (moved) {
        arr.splice(targetIndex, 0, moved)
        localTasks.value = arr
        draggedIndex.value = targetIndex
      }
    }
  }

  const onPointerUp = () => {
    cleanup()

    if (isDragging.value) {
      const changed = localTasks.value.some((t, i) => t._id !== props.tasks[i]?._id)
      if (changed) {
        emit('reorder', [...localTasks.value])
      }
    }

    draggedIndex.value = null
    dropTargetIndex.value = null
    isDragging.value = false
  }

  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)

  cleanupFunctions.push(() => {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  })
}

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
}

function getSprintName(sprintId: string, projectId: string): string | null {
  const sprints = getProjectSprints(projectId)
  return sprints.find(s => s._id === sprintId)?.name || null
}

function getAssignee(assigneeId: string | null) {
  if (!assigneeId) return null
  return getMemberById(assigneeId)
}

function getDueDateClass(task: Task): string {
  if (task.status === 'done') return 'text-gray-600'
  const status = getDueDateStatus(task.dueDate)
  if (status === 'overdue') return 'text-rose-400'
  if (status === 'today') return 'text-amber-400'
  return 'text-gray-500'
}

function getStatusColor(status: TaskStatus): 'slate' | 'blue' | 'amber' | 'emerald' {
  const colors: Record<TaskStatus, 'slate' | 'blue' | 'amber' | 'emerald'> = {
    todo: 'slate',
    in_progress: 'blue',
    in_review: 'amber',
    done: 'emerald'
  }
  return colors[status]
}

function getStatusLabel(status: TaskStatus): string {
  return STATUS_CONFIG[status].label
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}
</script>

<style scoped>
/* Spring-based movement animation with overshoot */
.task-list-move {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Smooth enter/leave animations */
.task-list-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.task-list-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
  position: absolute;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
