<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <div
      class="cursor-pointer group min-h-[32px] flex items-center"
      @click.stop="toggleDropdown"
    >
      <!-- Show selected parent -->
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
      <!-- Empty state -->
      <div v-else class="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Select parent task</span>
      </div>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <!-- Backdrop -->
      <div
        v-if="isOpen"
        class="fixed inset-0"
        style="z-index: 99998;"
        @click.stop="isOpen = false"
      ></div>

      <!-- Panel -->
      <div
        v-if="isOpen"
        class="fixed w-72 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        style="z-index: 99999;"
        :style="dropdownStyle"
        @click.stop
      >
        <!-- Search -->
        <div class="px-3 pt-3 pb-2">
          <input
            v-model="search"
            ref="searchInputRef"
            type="text"
            placeholder="Search tasks..."
            class="w-full px-2.5 py-1.5 bg-slate-700/50 border border-slate-600/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <!-- Task list -->
        <div class="max-h-56 overflow-y-auto py-1">
          <!-- No parent option -->
          <button
            @click.stop="selectParent(null)"
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
            @click.stop="selectParent(task._id)"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
            :class="modelValue === task._id ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'"
          >
            <span class="text-[10px] font-mono text-gray-500 flex-shrink-0">{{ task.key }}</span>
            <span class="truncate">{{ task.title }}</span>
            <svg v-if="modelValue === task._id" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Empty -->
          <div v-if="filteredTasks.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
            No tasks found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
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

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const search = ref('')
const projectTasks = ref<Task[]>([])

// Filter: exclude self, exclude tasks that already have a parentId (one-level nesting)
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

function selectParent(taskId: string | null) {
  emit('update:modelValue', taskId)
  isOpen.value = false
}

function clearParent() {
  emit('update:modelValue', null)
}

async function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  computePosition()
  isOpen.value = true
  search.value = ''
  // Load project tasks
  projectTasks.value = await tasksApi.getByProject(props.projectId)
  nextTick(() => searchInputRef.value?.focus())
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelH = 340
  const panelW = 288

  let top = rect.bottom + 8
  if (top + panelH > window.innerHeight) {
    top = rect.top - panelH - 8
  }
  if (top < 8) top = 8

  let left = rect.left
  if (left + panelW > window.innerWidth - 16) {
    left = window.innerWidth - panelW - 16
  }
  if (left < 8) left = 8

  dropdownStyle.value = { top: `${top}px`, left: `${left}px` }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
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
