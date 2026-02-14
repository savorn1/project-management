<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <div
      class="cursor-pointer group min-h-[32px] flex items-center"
      @click.stop="toggleDropdown"
    >
      <!-- Show selected sprint -->
      <div v-if="selectedSprint" class="flex items-center gap-2 text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30 transition-colors">
        <span
          class="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full flex-shrink-0"
          :class="statusBadgeClass(selectedSprint.status)"
        >
          {{ selectedSprint.status }}
        </span>
        <span class="text-gray-300 group-hover:text-white transition-colors">{{ selectedSprint.name }}</span>
        <button
          @click.stop="clearSprint"
          class="ml-auto p-0.5 text-gray-600 hover:text-gray-300 rounded transition-colors"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <!-- Empty state -->
      <div v-else class="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Select sprint</span>
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
        class="fixed w-64 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        style="z-index: 99999;"
        :style="dropdownStyle"
        @click.stop
      >
        <!-- Sprint list -->
        <div class="max-h-56 overflow-y-auto py-1">
          <!-- No sprint option -->
          <button
            @click.stop="selectSprint(null)"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
            :class="!modelValue ? 'bg-slate-700/50 text-white' : 'text-gray-400 hover:bg-slate-700/30 hover:text-gray-200'"
          >
            <span class="text-gray-500">No sprint</span>
            <svg v-if="!modelValue" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <div class="border-t border-slate-700/40 my-1"></div>

          <button
            v-for="sprint in availableSprints"
            :key="sprint._id"
            @click.stop="selectSprint(sprint._id)"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
            :class="modelValue === sprint._id ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'"
          >
            <span
              class="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full flex-shrink-0"
              :class="statusBadgeClass(sprint.status)"
            >
              {{ sprint.status }}
            </span>
            <span class="truncate">{{ sprint.name }}</span>
            <svg v-if="modelValue === sprint._id" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Empty -->
          <div v-if="sprints.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
            No sprints yet. Create sprints in project settings.
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SprintStatus } from '~/types'

interface Props {
  projectId: string
  modelValue: string | null | undefined
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { getProjectSprints, loadSprints } = useSprints()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const sprints = computed(() => getProjectSprints(props.projectId))

// Show active and planning sprints for selection (not closed)
const availableSprints = computed(() => {
  const statusOrder: Record<SprintStatus, number> = { active: 0, planning: 1, closed: 2 }
  return [...sprints.value]
    .filter(s => s.status !== 'closed')
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
})

const selectedSprint = computed(() => {
  if (!props.modelValue) return null
  return sprints.value.find(s => s._id === props.modelValue) || null
})

function statusBadgeClass(status: SprintStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'planning':
      return 'bg-blue-500/20 text-blue-400'
    case 'closed':
      return 'bg-gray-500/20 text-gray-500'
  }
}

function selectSprint(sprintId: string | null) {
  emit('update:modelValue', sprintId)
  isOpen.value = false
}

function clearSprint() {
  emit('update:modelValue', null)
}

function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  computePosition()
  isOpen.value = true
  loadSprints(props.projectId, true)
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelH = 300
  const panelW = 256

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
