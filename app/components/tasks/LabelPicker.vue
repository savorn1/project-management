<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <div
      class="cursor-pointer group min-h-[32px] flex items-center"
      @click.stop="toggleDropdown"
    >
      <!-- Show selected labels as colored badges -->
      <div v-if="selectedLabels.length > 0" class="flex flex-wrap gap-1.5">
        <span
          v-for="label in selectedLabels"
          :key="label._id"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          :style="{ backgroundColor: label.color + '20', color: label.color, boxShadow: `inset 0 0 0 1px ${label.color}30` }"
        >
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: label.color }"></span>
          {{ label.name }}
        </span>
        <button
          class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/50 text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <!-- Empty state -->
      <div v-else class="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors text-sm py-1 px-2 rounded-lg group-hover:bg-slate-700/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>Select labels</span>
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
        <!-- Search input -->
        <div v-if="labels.length > 5" class="p-2 border-b border-slate-700/40">
          <input
            ref="searchInputRef"
            v-model="search"
            type="text"
            placeholder="Search labels..."
            class="w-full px-3 py-1.5 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            @click.stop
          />
        </div>

        <!-- Label list -->
        <div class="max-h-56 overflow-y-auto py-1">
          <button
            v-for="label in filteredLabels"
            :key="label._id"
            @click.stop="toggleLabel(label._id)"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150"
            :class="isSelected(label._id) ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'"
          >
            <span class="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10" :style="{ backgroundColor: label.color }"></span>
            <span class="truncate">{{ label.name }}</span>
            <svg v-if="isSelected(label._id)" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Empty -->
          <div v-if="labels.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
            No labels yet. Create labels in project settings.
          </div>
          <div v-else-if="filteredLabels.length === 0" class="px-3 py-4 text-center text-xs text-gray-500">
            No matching labels
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Label } from '~/types'

interface Props {
  projectId: string
  modelValue: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { getProjectLabels, loadLabels } = useLabels()

const isOpen = ref(false)
const search = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const labels = computed(() => getProjectLabels(props.projectId))

const filteredLabels = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return labels.value
  return labels.value.filter(l => l.name.toLowerCase().includes(q))
})

const selectedLabels = computed(() => {
  return props.modelValue
    .map(id => labels.value.find(l => l._id === id))
    .filter((l): l is Label => !!l)
})

function isSelected(labelId: string): boolean {
  return props.modelValue.includes(labelId)
}

function toggleLabel(labelId: string) {
  if (isSelected(labelId)) {
    emit('update:modelValue', props.modelValue.filter(id => id !== labelId))
  } else {
    emit('update:modelValue', [...props.modelValue, labelId])
  }
}

function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  computePosition()
  isOpen.value = true
  loadLabels(props.projectId, true)
  nextTick(() => {
    searchInputRef.value?.focus()
  })
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
