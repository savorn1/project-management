<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9996] flex items-center justify-center p-4"
      @click.self="close"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5 z-10">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-white">Create Task</h3>
          <button @click="close" class="ml-auto w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Title -->
          <div>
            <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">Title</label>
            <input
              ref="titleRef"
              v-model="form.title"
              type="text"
              placeholder="Task title…"
              class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              @keydown.enter.prevent="submit"
            />
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Priority</label>
            <div class="flex gap-1.5">
              <button
                v-for="p in priorities"
                :key="p.value"
                @click="form.priority = p.value"
                class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                :class="form.priority === p.value ? p.activeClass : 'bg-slate-800 border-slate-700/60 text-gray-500 hover:border-slate-600'"
              >{{ p.label }}</button>
            </div>
          </div>

          <!-- Project (if provided) -->
          <div v-if="projects && projects.length > 0">
            <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">Project</label>
            <select
              v-model="form.projectId"
              class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— No project —</option>
              <option v-for="p in projects" :key="p._id" :value="p._id">{{ p.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button @click="close" class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800 text-gray-400 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="!form.title.trim() || saving"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {{ saving ? 'Creating…' : 'Create Task' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Project } from '~/types'

const props = defineProps<{
  modelValue: boolean
  initialTitle?: string
  projects?: Project[]
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  created: [data: { title: string; priority: string; projectId: string }]
}>()

const titleRef = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const form = reactive({ title: '', priority: 'medium', projectId: '' })

const priorities = [
  { value: 'low',    label: 'Low',    activeClass: 'bg-slate-700 border-slate-500 text-gray-200' },
  { value: 'medium', label: 'Med',    activeClass: 'bg-amber-600/30 border-amber-500/50 text-amber-300' },
  { value: 'high',   label: 'High',   activeClass: 'bg-orange-600/30 border-orange-500/50 text-orange-300' },
  { value: 'urgent', label: 'Urgent', activeClass: 'bg-red-600/30 border-red-500/50 text-red-300' },
]

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!form.title.trim() || saving.value) return
  saving.value = true
  try {
    emit('created', { title: form.title.trim(), priority: form.priority, projectId: form.projectId })
    close()
  } finally {
    saving.value = false
  }
}

watch(() => props.modelValue, (v) => {
  if (v) {
    form.title = props.initialTitle ?? ''
    form.priority = 'medium'
    form.projectId = ''
    nextTick(() => titleRef.value?.focus())
  }
})
</script>
