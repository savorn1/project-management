<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Projects</h1>
        <p class="text-gray-400 mt-1">Manage and track all your projects</p>
      </div>
      <BaseButton @click="showCreateModal = true">
        <span>➕</span>
        New Project
      </BaseButton>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="project in projectsWithStats"
        :key="project.id"
        :project="project"
      />
    </div>

    <EmptyState
      v-if="projectsWithStats.length === 0"
      icon="📁"
      title="No projects yet"
      description="Create your first project to start organizing your work"
    >
      <template #action>
        <BaseButton @click="showCreateModal = true">Create Project</BaseButton>
      </template>
    </EmptyState>

    <!-- Create Project Modal -->
    <BaseModal v-model="showCreateModal" title="Create New Project" size="md">
      <form @submit.prevent="handleCreateProject" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Project Name</label>
          <input
            v-model="newProject.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="My Awesome Project"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
          <textarea
            v-model="newProject.description"
            rows="3"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Describe your project..."
          ></textarea>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Color</label>
          <div class="flex gap-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              @click="newProject.color = color"
              class="w-8 h-8 rounded-lg transition-transform"
              :class="[getColorBg(color), newProject.color === color ? 'ring-2 ring-white scale-110' : '']"
            ></button>
          </div>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Icon</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="icon in iconOptions"
              :key="icon"
              type="button"
              @click="newProject.icon = icon"
              class="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors"
              :class="newProject.icon === icon ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'"
            >
              {{ icon }}
            </button>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreateProject">Create Project</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_COLORS, PROJECT_ICONS } from '~/utils/constants'

useSeoMeta({
  title: 'Projects | TaskFlow',
  description: 'Manage your projects'
})

const { projectsWithStats, createProject, loadProjects, projects } = useProjects()

onMounted(async () => {
  if (projects.value.length === 0) await loadProjects()
})

const showCreateModal = ref(false)
const colorOptions = PROJECT_COLORS
const iconOptions = PROJECT_ICONS

const newProject = ref({
  name: '',
  description: '',
  color: 'indigo',
  icon: '📊'
})

function getColorBg(color: string): string {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500'
  }
  return colors[color] || 'bg-indigo-500'
}

function handleCreateProject() {
  if (newProject.value.name) {
    createProject(newProject.value)
    showCreateModal.value = false
    newProject.value = { name: '', description: '', color: 'indigo', icon: '📊' }
  }
}
</script>
