<template>
  <div
    class="bg-slate-800/30 rounded-2xl border flex flex-col max-h-full min-w-0 transition-all duration-200 overflow-hidden"
    :class="isDropTarget
      ? 'border-indigo-500/50 ring-1 ring-indigo-500/30 bg-indigo-500/5'
      : 'border-slate-700/30'"
    @dragenter.prevent="onColumnDragEnter"
    @dragover.prevent
    @dragleave="onColumnDragLeave"
    @drop="onColumnDrop"
  >
    <!-- Colored top accent strip -->
    <div class="h-0.5 w-full flex-shrink-0 transition-all duration-200" :class="isDropTarget ? 'bg-indigo-500' : accentClass"></div>

    <!-- Column Header -->
    <div class="px-4 py-3.5 border-b border-slate-700/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-2 h-2 rounded-full" :class="dotSolidClass"></div>
          <h3 class="text-sm font-semibold text-white">{{ column.title }}</h3>
          <span class="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-semibold rounded-full" :class="countBadgeClass">
            {{ total }}
          </span>
        </div>
        <button
          @click="$emit('add-task')"
          class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all duration-200"
          title="Add task"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tasks Container -->
    <div ref="scrollContainer" class="flex-1 p-2.5 overflow-y-auto" @scroll.passive="onScroll">

      <!-- Empty column drop zone -->
      <div
        v-if="tasks.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center py-8 px-4 rounded-xl transition-all duration-200 min-h-[80px]"
        :class="isDropTarget ? 'border-2 border-dashed border-indigo-500/40 bg-indigo-500/5' : ''"
      >
        <template v-if="!isDropTarget">
          <div class="w-10 h-10 rounded-xl bg-slate-700/30 flex items-center justify-center mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-gray-600 text-xs">No tasks</p>
        </template>
        <template v-else>
          <p class="text-indigo-400 text-xs font-medium animate-pulse">Drop here</p>
        </template>
      </div>

      <!-- Task list with insert indicators -->
      <template v-for="(task, index) in tasks" :key="task._id">
        <!-- Insert indicator BEFORE this card -->
        <div
          class="mx-1 rounded-full transition-all duration-150 overflow-hidden"
          :class="isDropTarget && insertIndex === index ? 'h-0.5 bg-indigo-500 my-1.5 shadow-sm shadow-indigo-500/50' : 'h-0'"
        ></div>

        <div
          class="mb-2.5"
          @dragenter.prevent="insertIndex = index"
        >
          <TaskCard
            :task="task"
            @toggle="$emit('toggle-task', $event)"
            @select="$emit('select-task', $event)"
            @dragstart="$emit('drag-start', task)"
            @dragend="$emit('drag-end')"
          />
        </div>
      </template>

      <!-- Insert indicator AFTER last card -->
      <div
        class="mx-1 rounded-full transition-all duration-150 overflow-hidden"
        :class="isDropTarget && insertIndex === tasks.length ? 'h-0.5 bg-indigo-500 my-1.5 shadow-sm shadow-indigo-500/50' : 'h-0'"
      ></div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-1"></div>

      <!-- Load more / spinner -->
      <div v-if="hasMore || isLoading" class="pt-1 pb-2">
        <button
          v-if="hasMore && !isLoading"
          @click="$emit('load-more')"
          class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          :class="loadMoreBtnClass"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
          Load more ({{ total - tasks.length }} remaining)
        </button>
        <div v-else-if="isLoading" class="flex justify-center py-2">
          <div class="w-4 h-4 border-2 rounded-full animate-spin" :class="spinnerClass"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, KanbanColumn } from '~/types'

interface Props {
  column: KanbanColumn
  tasks: Task[]
  isDropTarget: boolean
  total: number
  isLoading: boolean
  hasMore: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'add-task'): void
  (e: 'toggle-task', id: string): void
  (e: 'select-task', task: Task): void
  (e: 'drag-start', task: Task): void
  (e: 'drag-end'): void
  (e: 'drag-over'): void
  (e: 'drag-leave'): void
  (e: 'drop', insertIndex: number): void
  (e: 'load-more'): void
}>()

// Track nested dragenter/dragleave to avoid flickering when moving over children
const dragEnterCount = ref(0)
const insertIndex = ref<number>(-1)

function onColumnDragEnter() {
  dragEnterCount.value++
  if (dragEnterCount.value === 1) {
    insertIndex.value = props.tasks.length
    emit('drag-over')
  }
}

function onColumnDragLeave() {
  dragEnterCount.value--
  if (dragEnterCount.value <= 0) {
    dragEnterCount.value = 0
    insertIndex.value = -1
    emit('drag-leave')
  }
}

function onColumnDrop() {
  dragEnterCount.value = 0
  const idx = insertIndex.value
  insertIndex.value = -1
  emit('drop', idx)
}

// Reset when drop target changes externally
watch(() => props.isDropTarget, (val) => {
  if (!val) {
    dragEnterCount.value = 0
    insertIndex.value = -1
  }
})

// Infinite scroll via IntersectionObserver
const sentinel = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function triggerLoadMore() {
  if (props.hasMore && !props.isLoading) {
    emit('load-more')
  }
}

function onScroll() {
  if (!scrollContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  if (scrollHeight - scrollTop - clientHeight < 80) {
    triggerLoadMore()
  }
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) triggerLoadMore()
    },
    { root: scrollContainer.value, threshold: 0.1 }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

// Color helpers
const accentClass = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-500/60',
    blue: 'bg-blue-500/70',
    amber: 'bg-amber-500/70',
    emerald: 'bg-emerald-500/70',
  }
  return colors[props.column.color] || 'bg-slate-500/60'
})

const dotSolidClass = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  }
  return colors[props.column.color] || 'bg-slate-400'
})

const countBadgeClass = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-700/60 text-slate-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  }
  return colors[props.column.color] || 'bg-slate-700/60 text-slate-400'
})

const spinnerClass = computed(() => {
  const colors: Record<string, string> = {
    slate: 'border-slate-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    amber: 'border-amber-500 border-t-transparent',
    emerald: 'border-emerald-500 border-t-transparent',
  }
  return colors[props.column.color] || 'border-slate-500 border-t-transparent'
})

const loadMoreBtnClass = computed(() => {
  const colors: Record<string, string> = {
    slate: 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/40',
    blue: 'text-blue-500/70 hover:text-blue-400 hover:bg-blue-500/10',
    amber: 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10',
    emerald: 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10',
  }
  return colors[props.column.color] || 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/40'
})
</script>
