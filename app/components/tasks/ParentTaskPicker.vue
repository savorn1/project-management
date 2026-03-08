<template>
  <BaseDropdown ref="dropdownRef" :width="288" :estimated-height="340">
    <!-- Trigger -->
    <template #trigger>
      <div
        class="cursor-pointer group min-h-[32px] flex items-center"
        @click.stop="toggleDropdown"
      >
        <div v-if="selectedParent" class="flex items-center gap-2 text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30 transition-colors">
          <span class="text-[10px] font-mono text-gray-500 flex-shrink-0">{{ selectedParent.key }}</span>
          <span class="text-gray-300 group-hover:text-white transition-colors truncate">{{ selectedParent.title }}</span>
          <button
            @click.stop="clearParent"
            class="ml-auto p-0.5 text-gray-600 hover:text-gray-300 rounded transition-colors flex-shrink-0"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-else class="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Select parent task</span>
        </div>
      </div>
    </template>

    <!-- Panel -->
    <template #default="{ close }">
      <div class="px-3 pt-3 pb-2">
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          placeholder="Search tasks..."
          class="w-full px-2.5 py-1.5 bg-slate-700/50 border border-slate-600/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
          @click.stop
        />
      </div>
      <div class="max-h-56 overflow-y-auto py-1">
        <button
          @click.stop="selectParent(null, close)"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
          :class="!modelValue ? 'bg-slate-700/50 text-white' : 'text-gray-400 hover:bg-slate-700/30 hover:text-gray-200'"
        >
          <span class="text-gray-500">No parent</span>
          <svg v-if="!modelValue" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <div class="border-t border-slate-700/40 my-1"></div>

        <button
          v-for="task in filteredTasks"
          :key="task._id"
          @click.stop="selectParent(task._id, close)"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
          :class="modelValue === task._id ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'"
        >
          <span class="text-[10px] font-mono text-gray-500 flex-shrink-0">{{ task.key }}</span>
          <span class="truncate">{{ task.title }}</span>
          <svg v-if="modelValue === task._id" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <div v-if="filteredTasks.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
          No tasks found
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>

<script setup lang="ts">
import type { Task } from '~/types'

interface Props {
  projectId: string
  modelValue: string | null | undefined
  excludeTaskId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { tasksApi } = useApi()

const dropdownRef = ref<InstanceType<typeof import('~/components/base/BaseDropdown.vue').default> | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const search = ref('')
const projectTasks = ref<Task[]>([])

const availableTasks = computed(() => {
  return projectTasks.value.filter(t => {
    if (props.excludeTaskId && t._id === props.excludeTaskId) return false
    if (t.parentId) return false
    return true
  })
})

const filteredTasks = computed(() => {
  if (!search.value.trim()) return availableTasks.value
  const q = search.value.toLowerCase()
  return availableTasks.value.filter(t =>
    t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q)
  )
})

const selectedParent = computed(() => {
  if (!props.modelValue) return null
  return projectTasks.value.find(t => t._id === props.modelValue) || null
})

function selectParent(taskId: string | null, close: () => void) {
  emit('update:modelValue', taskId)
  close()
}

function clearParent() {
  emit('update:modelValue', null)
}

async function toggleDropdown() {
  if (dropdownRef.value?.isOpen) {
    dropdownRef.value.close()
    return
  }
  search.value = ''
  projectTasks.value = await tasksApi.getByProject(props.projectId)
  dropdownRef.value?.open()
  nextTick(() => searchInputRef.value?.focus())
}

onMounted(async () => {
  if (props.projectId && props.modelValue) {
    projectTasks.value = await tasksApi.getByProject(props.projectId)
  }
})
</script>
