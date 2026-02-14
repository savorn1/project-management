<template>
  <div class="space-y-4">
    <!-- Create new sprint -->
    <div class="flex items-center gap-3">
      <input
        v-model="newSprintName"
        type="text"
        placeholder="New sprint name..."
        class="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        @keydown.enter="handleCreate"
      />
      <button
        @click="handleCreate"
        :disabled="!newSprintName.trim()"
        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        Add
      </button>
    </div>

    <!-- Sprints list -->
    <div v-if="sortedSprints.length > 0" class="space-y-1">
      <div
        v-for="sprint in sortedSprints"
        :key="sprint._id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-slate-800/60 transition-colors"
      >
        <!-- Editing mode -->
        <template v-if="editingId === sprint._id">
          <div class="flex-1 space-y-2">
            <input
              v-model="editName"
              ref="editInputRef"
              type="text"
              placeholder="Sprint name"
              class="w-full px-2 py-1 bg-slate-700/50 border border-indigo-500/50 rounded text-sm text-white focus:outline-none"
              @keydown.escape="editingId = null"
            />
            <input
              v-model="editGoal"
              type="text"
              placeholder="Sprint goal (optional)"
              class="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500">Start:</span>
                <input
                  v-model="editStartDate"
                  type="date"
                  class="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500">End:</span>
                <input
                  v-model="editEndDate"
                  type="date"
                  class="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-white focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="handleSaveEdit(sprint._id)"
              class="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click="editingId = null"
              class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-slate-700/50 rounded transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </template>

        <!-- Display mode -->
        <template v-else>
          <!-- Status badge -->
          <span
            class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full flex-shrink-0"
            :class="statusBadgeClass(sprint.status)"
          >
            {{ sprint.status }}
          </span>

          <!-- Sprint info -->
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-300">{{ sprint.name }}</div>
            <div v-if="sprint.goal" class="text-xs text-gray-500 truncate mt-0.5">{{ sprint.goal }}</div>
            <div v-if="sprint.startDate || sprint.endDate" class="text-xs text-gray-600 mt-0.5">
              {{ formatDate(sprint.startDate) }} — {{ formatDate(sprint.endDate) }}
            </div>
          </div>

          <!-- Actions (visible on hover) -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <!-- Start (planning only) -->
            <button
              v-if="sprint.status === 'planning'"
              @click="handleStart(sprint._id)"
              class="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
              title="Start Sprint"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <!-- Close (active only) -->
            <button
              v-if="sprint.status === 'active'"
              @click="handleClose(sprint._id)"
              class="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
              title="Close Sprint"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <!-- Edit -->
            <button
              @click="startEdit(sprint)"
              class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Edit"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <!-- Delete (not active) -->
            <button
              v-if="sprint.status !== 'active'"
              @click="handleDelete(sprint._id)"
              class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Delete"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-6 text-gray-500 text-sm">
      No sprints yet. Create one above.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sprint, SprintStatus } from '~/types'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const { getProjectSprints, loadSprints, createSprint, updateSprint, startSprint, closeSprint, deleteSprint } = useSprints()

const newSprintName = ref('')
const editingId = ref<string | null>(null)
const editName = ref('')
const editGoal = ref('')
const editStartDate = ref('')
const editEndDate = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const sprints = computed(() => getProjectSprints(props.projectId))

const statusOrder: Record<SprintStatus, number> = { active: 0, planning: 1, closed: 2 }

const sortedSprints = computed(() => {
  return [...sprints.value].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function handleCreate() {
  const name = newSprintName.value.trim()
  if (!name) return
  await createSprint(props.projectId, { name })
  newSprintName.value = ''
}

function startEdit(sprint: Sprint) {
  editingId.value = sprint._id
  editName.value = sprint.name
  editGoal.value = sprint.goal || ''
  editStartDate.value = sprint.startDate ? sprint.startDate.split('T')[0] : ''
  editEndDate.value = sprint.endDate ? sprint.endDate.split('T')[0] : ''
  nextTick(() => {
    editInputRef.value?.focus()
  })
}

async function handleSaveEdit(sprintId: string) {
  const name = editName.value.trim()
  if (!name) return
  await updateSprint(props.projectId, sprintId, {
    name,
    goal: editGoal.value.trim() || undefined,
    startDate: editStartDate.value || undefined,
    endDate: editEndDate.value || undefined,
  })
  editingId.value = null
}

async function handleStart(sprintId: string) {
  await startSprint(props.projectId, sprintId)
}

async function handleClose(sprintId: string) {
  await closeSprint(props.projectId, sprintId)
}

async function handleDelete(sprintId: string) {
  await deleteSprint(props.projectId, sprintId)
}

onMounted(() => {
  loadSprints(props.projectId, true)
})
</script>
