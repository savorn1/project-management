<template>
  <BaseDropdown ref="dropdownRef" :width="256" :estimated-height="300">
    <!-- Trigger -->
    <template #trigger>
      <div
        class="cursor-pointer group min-h-[32px] flex items-center"
        @click.stop="toggleDropdown"
      >
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
        <div v-else class="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Select sprint</span>
        </div>
      </div>
    </template>

    <!-- Panel -->
    <template #default="{ close }">
      <div class="max-h-56 overflow-y-auto py-1">
        <button
          @click.stop="selectSprint(null, close)"
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
          @click.stop="selectSprint(sprint._id, close)"
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

        <div v-if="sprints.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
          No sprints yet. Create sprints in project settings.
        </div>
      </div>
    </template>
  </BaseDropdown>
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

const dropdownRef = ref<InstanceType<typeof import('~/components/base/BaseDropdown.vue').default> | null>(null)

const sprints = computed(() => getProjectSprints(props.projectId))

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
    case 'active': return 'bg-emerald-500/20 text-emerald-400'
    case 'planning': return 'bg-blue-500/20 text-blue-400'
    case 'closed': return 'bg-gray-500/20 text-gray-500'
  }
}

function selectSprint(sprintId: string | null, close: () => void) {
  emit('update:modelValue', sprintId)
  close()
}

function clearSprint() {
  emit('update:modelValue', null)
}

function toggleDropdown() {
  if (dropdownRef.value?.isOpen) {
    dropdownRef.value.close()
    return
  }
  loadSprints(props.projectId, true)
  dropdownRef.value?.open()
}

onMounted(() => {
  if (props.projectId) loadSprints(props.projectId)
})
</script>
