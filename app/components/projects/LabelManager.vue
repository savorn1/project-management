<template>
  <div class="space-y-4">
    <!-- Create new label -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <button
          v-for="c in presetColors"
          :key="c"
          @click="newLabelColor = c"
          class="w-6 h-6 rounded-full transition-all duration-150 flex-shrink-0"
          :class="newLabelColor === c ? 'ring-2 ring-white/60 scale-110' : 'ring-1 ring-white/10 hover:scale-110'"
          :style="{ backgroundColor: c }"
        ></button>
      </div>
      <input
        v-model="newLabelName"
        type="text"
        placeholder="New label name..."
        class="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        @keydown.enter="handleCreate"
      />
      <button
        @click="handleCreate"
        :disabled="!newLabelName.trim()"
        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        Add
      </button>
    </div>

    <!-- Labels list -->
    <div v-if="labels.length > 0" class="space-y-1">
      <div
        v-for="label in labels"
        :key="label._id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-slate-800/60 transition-colors"
      >
        <!-- Color indicator -->
        <span
          class="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-white/10"
          :style="{ backgroundColor: label.color }"
        ></span>

        <!-- Name (editable) -->
        <template v-if="editingId === label._id">
          <input
            v-model="editName"
            ref="editInputRef"
            type="text"
            class="flex-1 px-2 py-1 bg-slate-700/50 border border-indigo-500/50 rounded text-sm text-white focus:outline-none"
            @keydown.enter="handleSaveEdit(label._id)"
            @keydown.escape="editingId = null"
          />
          <!-- Edit color -->
          <div class="flex items-center gap-1">
            <button
              v-for="c in presetColors"
              :key="c"
              @click="editColor = c"
              class="w-4 h-4 rounded-full transition-all duration-100"
              :class="editColor === c ? 'ring-2 ring-white/60 scale-110' : 'ring-1 ring-white/10'"
              :style="{ backgroundColor: c }"
            ></button>
          </div>
          <button
            @click="handleSaveEdit(label._id)"
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
        </template>

        <template v-else>
          <span class="flex-1 text-sm text-gray-300">{{ label.name }}</span>
          <!-- Actions (visible on hover) -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="startEdit(label)"
              class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Edit"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="handleDelete(label._id)"
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
      No labels yet. Create one above.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Label } from '~/types'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const { getProjectLabels, loadLabels, createLabel, deleteLabel } = useLabels()
const { labelsApi } = useApi()

const newLabelName = ref('')
const newLabelColor = ref('#6366f1')
const editingId = ref<string | null>(null)
const editName = ref('')
const editColor = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const presetColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
]

const labels = computed(() => getProjectLabels(props.projectId))

async function handleCreate() {
  const name = newLabelName.value.trim()
  if (!name) return
  await createLabel(props.projectId, name, newLabelColor.value)
  newLabelName.value = ''
}

function startEdit(label: Label) {
  editingId.value = label._id
  editName.value = label.name
  editColor.value = label.color
  nextTick(() => {
    editInputRef.value?.focus()
  })
}

async function handleSaveEdit(labelId: string) {
  const name = editName.value.trim()
  if (!name) return
  const updated = await labelsApi.update(props.projectId, labelId, { name, color: editColor.value })
  if (updated) {
    // Reload labels to get fresh data
    await loadLabels(props.projectId, true)
  }
  editingId.value = null
}

async function handleDelete(labelId: string) {
  await deleteLabel(props.projectId, labelId)
}

onMounted(() => {
  loadLabels(props.projectId, true)
})
</script>
