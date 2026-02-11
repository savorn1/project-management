<template>
  <div
    class="bg-slate-800/30 rounded-2xl border border-slate-700/30 flex flex-col max-h-full min-w-0 transition-all duration-200"
    :class="isDropTarget ? 'ring-2 ring-indigo-500/50 bg-indigo-500/5' : ''"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column Header -->
    <div class="px-4 py-3.5 border-b border-slate-700/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full ring-2" :class="dotStyles"></div>
          <h3 class="text-sm font-semibold text-white">{{ column.title }}</h3>
          <span class="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-slate-700/50 text-gray-400 text-[11px] font-medium rounded-full">
            {{ tasks.length }}
          </span>
        </div>
        <button
          @click="$emit('add-task')"
          class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tasks Container -->
    <div
      class="flex-1 p-2.5 space-y-2.5 overflow-y-auto"
      :class="{ 'border-2 border-dashed border-indigo-500/30 rounded-xl m-2 bg-indigo-500/5': isDropTarget }"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task._id"
        :task="task"
        @toggle="$emit('toggle-task', $event)"
        @select="$emit('select-task', $event)"
        @dragstart="$emit('drag-start', task)"
        @dragend="$emit('drag-end')"
      />

      <div
        v-if="tasks.length === 0 && !isDropTarget"
        class="flex flex-col items-center justify-center py-8 px-4"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-700/30 flex items-center justify-center mb-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-gray-600 text-xs">No tasks yet</p>
      </div>

      <div
        v-if="isDropTarget && tasks.length === 0"
        class="flex items-center justify-center py-8"
      >
        <p class="text-indigo-400 text-xs font-medium">Drop here</p>
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
  (e: 'drop'): void
}>()

const dotStyles = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-400 ring-slate-400/20',
    blue: 'bg-blue-400 ring-blue-400/20',
    amber: 'bg-amber-400 ring-amber-400/20',
    emerald: 'bg-emerald-400 ring-emerald-400/20',
  }
  return colors[props.column.color] || 'bg-slate-400 ring-slate-400/20'
})

function onDragOver() {
  emit('drag-over')
}

function onDragLeave() {
  emit('drag-leave')
}

function onDrop() {
  emit('drop')
}
</script>
