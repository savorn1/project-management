<template>
  <BaseDropdown :estimated-height="280">
    <!-- Trigger -->
    <template #trigger="{ toggle, isOpen }">
      <button
        type="button"
        @click.stop="toggle"
        class="w-full flex items-center justify-between gap-2 bg-slate-800/60 border rounded-xl px-3 py-2 text-sm text-left transition-colors"
        :class="isOpen
          ? 'border-indigo-500/50'
          : 'border-slate-700/40 hover:border-slate-600/60'"
      >
        <span class="truncate" :class="selectedProject ? 'text-gray-200' : 'text-gray-500'">
          {{ selectedProject?.name ?? placeholder }}
        </span>
        <svg
          class="w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform duration-150"
          :class="isOpen ? 'rotate-180 text-indigo-400' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </template>

    <!-- Panel content -->
    <template #default="{ close }">
      <!-- Search -->
      <div class="p-1.5 border-b border-slate-700/40">
        <input
          v-model="search"
          type="text"
          placeholder="Search projects…"
          class="w-full bg-slate-900/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          @click.stop
        />
      </div>
      <!-- List -->
      <div class="max-h-48 overflow-y-auto py-1">
        <button
          v-for="p in filteredProjects"
          :key="p._id"
          type="button"
          @click.stop="select(p._id, close)"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
          :class="modelValue === p._id
            ? 'bg-indigo-500/15 text-indigo-300'
            : 'text-gray-300 hover:bg-slate-700/50'"
        >
          <span
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :class="modelValue === p._id ? 'bg-indigo-400' : 'bg-slate-600'"
          />
          <span class="truncate flex-1">{{ p.name }}</span>
          <svg v-if="modelValue === p._id" class="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <p v-if="filteredProjects.length === 0" class="text-[11px] text-gray-600 text-center py-3">No projects found</p>
      </div>
    </template>
  </BaseDropdown>
</template>

<script setup lang="ts">
import type { Project } from '~/types'

interface Props {
  modelValue: string
  projects: Project[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select project…',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const search = ref('')

const selectedProject = computed(() =>
  props.projects.find(p => p._id === props.modelValue) ?? null
)

const filteredProjects = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.projects
  return props.projects.filter(p => p.name.toLowerCase().includes(q))
})

function select(id: string, close: () => void) {
  emit('update:modelValue', id)
  close()
}
</script>
