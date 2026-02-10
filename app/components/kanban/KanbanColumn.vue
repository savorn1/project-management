<template>
  <div
    class="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col max-h-full min-w-0"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column Header -->
    <div class="p-4 border-b border-slate-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :class="dotColor"></div>
          <h3 class="font-semibold text-white">{{ column.title }}</h3>
          <span class="text-gray-400 text-sm">({{ tasks.length }})</span>
        </div>
        <button
          @click="$emit('add-task')"
          class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          +
        </button>
      </div>
    </div>

    <!-- Tasks Container -->
    <div
      class="flex-1 p-3 space-y-3 overflow-y-auto"
      :class="{ 'bg-indigo-500/10 border-2 border-dashed border-indigo-500 rounded-lg m-2': isDropTarget }"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task._id"
        :task="task"
        @toggle="$emit('toggle-task', $event)"
        @dragstart="$emit('drag-start', task)"
        @dragend="$emit('drag-end')"
      />

      <div
        v-if="tasks.length === 0"
        class="p-4 text-center text-gray-500 text-sm"
      >
        No tasks
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
  (e: 'drag-start', task: Task): void
  (e: 'drag-end'): void
  (e: 'drag-over'): void
  (e: 'drag-leave'): void
  (e: 'drop'): void
}>()

const dotColor = computed(() => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400'
  }
  return colors[props.column.color] || 'bg-slate-400'
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
