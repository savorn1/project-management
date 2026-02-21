<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Projects</h1>
        <p class="text-gray-400 mt-1">Manage and track all your projects</p>
      </div>
      <BaseButton @click="openCreateModal">
        <span>➕</span>
        New Project
      </BaseButton>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="project in projects"
        :key="project._id"
        :project="project"
        :member-status="memberStatusMap[project._id]"
        @request-join="handleRequestJoin"
      />
    </div>

    <EmptyState
      v-if="projects.length === 0"
      icon="📁"
      title="No projects yet"
      description="Create your first project to start organizing your work"
    >
      <template #action>
        <BaseButton @click="openCreateModal">Create Project</BaseButton>
      </template>
    </EmptyState>

    <!-- Create Project Modal -->
    <BaseModal v-model="showCreateModal" title="New Project" size="lg">
      <div class="space-y-5">
        <!-- Name -->
        <div>
          <input
            v-model="newProject.name"
            type="text"
            autofocus
            placeholder="Project name..."
            class="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
          />
        </div>

        <!-- Key -->
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Project Key</p>
            <span v-if="!keyManuallyEdited" class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">auto</span>
          </div>
          <input
            v-model="newProject.key"
            @input="onKeyInput"
            type="text"
            placeholder="e.g. WEB"
            maxlength="10"
            class="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm tracking-widest uppercase transition-colors"
          />
          <p class="text-gray-600 text-xs mt-1">Uppercase letters and numbers only, max 10 chars</p>
        </div>

        <!-- Description -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
          <textarea
            v-model="newProject.description"
            rows="3"
            placeholder="Describe what this project is about..."
            class="w-full px-3 py-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
          ></textarea>
        </div>

        <!-- Workplace -->
        <div class="relative" ref="workplaceDropdownRef">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Workplace</p>
          <button
            type="button"
            @click="showWorkplaceDropdown = !showWorkplaceDropdown; workplaceSearch = ''"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50 transition-colors"
          >
            <span class="text-base">🏢</span>
            <span class="flex-1 text-left truncate" :class="selectedWorkplaceId ? 'text-gray-300' : 'text-gray-500'">
              {{ workplaces.find(w => w._id === selectedWorkplaceId)?.name || 'Select a workplace...' }}
            </span>
            <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div v-if="showWorkplaceDropdown" class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
            <div class="p-2 border-b border-slate-700/30">
              <input
                v-model="workplaceSearch"
                type="text"
                placeholder="Search workplaces..."
                class="w-full bg-slate-700/50 border border-slate-600/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                @click.stop
                autofocus
              />
            </div>
            <div class="max-h-60 overflow-y-auto py-1">
              <button
                v-for="wp in filteredWorkplaces"
                :key="wp._id"
                type="button"
                @click="selectedWorkplaceId = wp._id; showWorkplaceDropdown = false; workplaceSearch = ''"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all"
                :class="selectedWorkplaceId === wp._id ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
              >
                <span class="text-sm">🏢</span>
                <span class="truncate">{{ wp.name }}</span>
                <svg v-if="selectedWorkplaceId === wp._id" class="w-3.5 h-3.5 ml-auto text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <div v-if="filteredWorkplaces.length === 0" class="px-3 py-3 text-xs text-gray-500 text-center">No workplaces found</div>
            </div>
          </div>
        </div>

        <!-- Priority -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</p>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="p in projectPriorityOptions"
              :key="p.value"
              type="button"
              @click="newProject.priority = p.value"
              class="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium border transition-all"
              :class="newProject.priority === p.value
                ? p.activeClass
                : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:text-gray-300 hover:border-slate-500/50'"
            >
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="p.dot"></span>
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!newProject.name.trim() || !newProject.key.trim() || !selectedWorkplaceId" @click="handleCreateProject">
            Create Project
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { ProjectPriority } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Projects | TaskFlow',
  description: 'Manage your projects'
})

const { projects, createProject, loadProjects } = useProjects()
const { workplaces, loadWorkplaces } = useWorkplaces()
const { membershipApi } = useApi()

const memberStatusMap = ref<Record<string, { isMember: boolean; role: string | null }>>({})

async function loadMemberStatuses() {
  const results = await Promise.all(
    projects.value.map(p => membershipApi.getMyMembership(p._id).then(s => ({ id: p._id, status: s })))
  )
  memberStatusMap.value = Object.fromEntries(results.map(r => [r.id, r.status]))
}

onMounted(async () => {
  if (projects.value.length === 0) await loadProjects()
  if (workplaces.value.length === 0) await loadWorkplaces()
  await loadMemberStatuses()
})

async function handleRequestJoin(projectId: string) {
  await membershipApi.join(projectId)
  const updated = await membershipApi.getMyMembership(projectId)
  memberStatusMap.value = { ...memberStatusMap.value, [projectId]: updated }
}

const showCreateModal = ref(false)
const selectedWorkplaceId = ref('')
const keyManuallyEdited = ref(false)

const newProject = ref({
  name: '',
  key: '',
  description: '',
  priority: 'medium' as ProjectPriority
})

const projectPriorityOptions = [
  { value: 'low' as ProjectPriority, label: 'Low', dot: 'bg-slate-400', activeClass: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  { value: 'medium' as ProjectPriority, label: 'Medium', dot: 'bg-blue-400', activeClass: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { value: 'high' as ProjectPriority, label: 'High', dot: 'bg-amber-400', activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { value: 'critical' as ProjectPriority, label: 'Critical', dot: 'bg-rose-400', activeClass: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
]

// Auto-generate key from project name
watch(() => newProject.value.name, (name) => {
  if (!keyManuallyEdited.value) {
    const generated = name
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10)
    newProject.value.key = generated
  }
})

function onKeyInput(event: Event) {
  keyManuallyEdited.value = true
  const input = event.target as HTMLInputElement
  newProject.value.key = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Workplace search dropdown
const showWorkplaceDropdown = ref(false)
const workplaceSearch = ref('')
const workplaceDropdownRef = ref<HTMLElement | null>(null)

const filteredWorkplaces = computed(() => {
  const q = workplaceSearch.value.toLowerCase().trim()
  if (!q) return workplaces.value
  return workplaces.value.filter(w => w.name.toLowerCase().includes(q))
})

function handleClickOutside(event: MouseEvent) {
  if (workplaceDropdownRef.value && !workplaceDropdownRef.value.contains(event.target as Node)) {
    showWorkplaceDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function openCreateModal() {
  newProject.value = { name: '', key: '', description: '', priority: 'medium' }
  selectedWorkplaceId.value = ''
  keyManuallyEdited.value = false
  workplaceSearch.value = ''
  showCreateModal.value = true
}

function handleCreateProject() {
  if (newProject.value.name && newProject.value.key && selectedWorkplaceId.value) {
    createProject(newProject.value, selectedWorkplaceId.value)
    showCreateModal.value = false
    newProject.value = { name: '', key: '', description: '', priority: 'medium' }
    selectedWorkplaceId.value = ''
    keyManuallyEdited.value = false
  }
}
</script>
