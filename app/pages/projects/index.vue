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
          <label class="block text-gray-300 text-sm font-medium mb-2">Project Key</label>
          <input
            v-model="newProject.key"
            type="text"
            required
            pattern="^[A-Z0-9]+$"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 uppercase"
            placeholder="WEB"
            maxlength="10"
          />
          <p class="text-gray-500 text-xs mt-1">Uppercase letters and numbers only (max 10 chars)</p>
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
          <label class="block text-gray-300 text-sm font-medium mb-2">Workplace</label>
          <select
            v-model="selectedWorkplaceId"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="" disabled>Select workplace</option>
            <option v-for="wp in workplaces" :key="wp._id" :value="wp._id">
              {{ wp.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Priority</label>
          <select
            v-model="newProject.priority"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
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

const newProject = ref({
  name: '',
  key: '',
  description: '',
  priority: 'medium' as ProjectPriority
})

function handleCreateProject() {
  if (newProject.value.name && newProject.value.key && selectedWorkplaceId.value) {
    createProject(newProject.value, selectedWorkplaceId.value)
    showCreateModal.value = false
    newProject.value = { name: '', key: '', description: '', priority: 'medium' }
    selectedWorkplaceId.value = ''
  }
}
</script>
