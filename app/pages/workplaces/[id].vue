<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading workplace...</div>
    </div>

    <template v-else-if="currentWorkplace">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/workplaces" class="text-gray-400 hover:text-white transition-colors">
            ← Back
          </NuxtLink>
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-3xl">
            🏢
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">{{ currentWorkplace.name }}</h1>
            <p class="text-gray-400 text-sm mt-1">{{ currentWorkplace.slug }}</p>
          </div>
          <BaseBadge :color="planColor">{{ currentWorkplace.plan }}</BaseBadge>
        </div>
        <div class="flex gap-2">
          <BaseButton variant="ghost" @click="showEditModal = true">Edit</BaseButton>
          <BaseButton @click="showAddMemberModal = true">
            <span>👥</span>
            Add Member
          </BaseButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Projects" :value="workplaceProjects.length" icon="📁" color="indigo" />
        <StatCard label="Members" :value="workplaceMembers.length" icon="👥" color="emerald" />
        <StatCard label="Plan" :value="currentWorkplace.plan.toUpperCase()" icon="⭐" color="amber" />
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-700">
        <div class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="pb-3 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === tab.id
              ? 'text-white border-indigo-500'
              : 'text-gray-400 hover:text-white border-transparent'"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="space-y-4">
        <div class="flex justify-end">
          <BaseButton @click="showCreateProjectModal = true">
            <span>➕</span>
            New Project
          </BaseButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BaseCard
            v-for="project in workplaceProjects"
            :key="project._id"
            class="hover:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <NuxtLink :to="`/projects/${project._id}`" class="block">
              <h3 class="text-white font-semibold">{{ project.name }}</h3>
              <p class="text-gray-400 text-sm mt-1 line-clamp-2">{{ project.description }}</p>
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                <BaseBadge :color="project.status === 'active' ? 'emerald' : 'slate'">
                  {{ project.status }}
                </BaseBadge>
                <span class="text-gray-500 text-sm">{{ project.priority }}</span>
              </div>
            </NuxtLink>
            <div v-if="memberStatusMap[project._id] && !memberStatusMap[project._id]!.isMember" class="mt-3 pt-3 border-t border-slate-700/50">
              <button
                @click.prevent.stop="handleJoinProject(project._id)"
                :disabled="joiningProjectId === project._id"
                class="w-full py-1.5 text-xs font-medium bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {{ joiningProjectId === project._id ? 'Joining...' : '+ Join' }}
              </button>
            </div>
          </BaseCard>
        </div>

        <EmptyState
          v-if="workplaceProjects.length === 0"
          icon="📁"
          title="No projects yet"
          description="Create a project in this workplace to get started"
        >
          <template #action>
            <BaseButton @click="showCreateProjectModal = true">Create Project</BaseButton>
          </template>
        </EmptyState>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BaseCard
            v-for="member in workplaceMembers"
            :key="member.userId"
            class="hover:border-slate-600 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {{ getMemberInitials(member.user?.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white font-medium truncate">{{ member.user?.name || 'Unknown' }}</p>
                <p class="text-gray-400 text-sm truncate">{{ member.user?.email || '' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <BaseBadge :color="getRoleColor(member.role)">
                  {{ member.role }}
                </BaseBadge>
                <button
                  v-if="member.role !== 'owner'"
                  @click="handleRemoveMember(member.userId)"
                  class="text-gray-500 hover:text-rose-400 transition-colors text-sm"
                  title="Remove member"
                >
                  ✕
                </button>
              </div>
            </div>
          </BaseCard>
        </div>

        <EmptyState
          v-if="workplaceMembers.length === 0"
          icon="👥"
          title="No members"
          description="Add members to collaborate on this workplace"
        />
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="max-w-2xl space-y-6">
        <BaseCard>
          <h3 class="text-white font-semibold mb-4">Workplace Settings</h3>
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
              <input
                v-model="editForm.name"
                type="text"
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Plan</label>
              <select
                v-model="editForm.plan"
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <BaseButton type="submit">Save Changes</BaseButton>
          </form>
        </BaseCard>

        <BaseCard>
          <h3 class="text-rose-400 font-semibold mb-2">Danger Zone</h3>
          <p class="text-gray-400 text-sm mb-4">Archiving a workplace will make it inaccessible to all members.</p>
          <BaseButton variant="ghost" @click="handleDelete" class="!text-rose-400 !border-rose-500/30 hover:!bg-rose-500/10">
            Archive Workplace
          </BaseButton>
        </BaseCard>
      </div>
    </template>

    <!-- Not Found -->
    <EmptyState
      v-else-if="!isLoading"
      icon="🔍"
      title="Workplace not found"
      description="The workplace you're looking for doesn't exist"
    >
      <template #action>
        <NuxtLink to="/workplaces">
          <BaseButton>Back to Workplaces</BaseButton>
        </NuxtLink>
      </template>
    </EmptyState>

    <!-- Edit Modal -->
    <BaseModal v-model="showEditModal" title="Edit Workplace" size="md">
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
          <input
            v-model="editForm.name"
            type="text"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Plan</label>
          <select
            v-model="editForm.plan"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton @click="handleUpdate">Save</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Create Project Modal -->
    <BaseModal v-model="showCreateProjectModal" title="Create New Project" size="md">
      <form @submit.prevent="handleCreateProject" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Project Name</label>
          <input
            v-model="newProjectForm.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="My Awesome Project"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Project Key</label>
          <input
            v-model="newProjectForm.key"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 uppercase"
            placeholder="WEB"
            maxlength="10"
          />
          <p class="text-gray-500 text-xs mt-1">Uppercase letters and numbers only (max 10 chars)</p>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
          <textarea
            v-model="newProjectForm.description"
            rows="3"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Describe your project..."
          ></textarea>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Priority</label>
          <select
            v-model="newProjectForm.priority"
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
          <BaseButton variant="ghost" @click="showCreateProjectModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreateProject">Create Project</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Add Member Modal -->
    <BaseModal v-model="showAddMemberModal" title="Add Member" size="md">
      <div class="space-y-5">
        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="memberSearchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-700 transition-colors"
          />
        </div>

        <!-- User List -->
        <div class="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
          <div v-if="filteredAvailableUsers.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No users available
          </div>
          <button
            v-for="user in filteredAvailableUsers"
            :key="user._id"
            type="button"
            @click="newMemberForm.userId = user._id"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border"
            :class="newMemberForm.userId === user._id
              ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
              : 'bg-slate-700/30 border-transparent hover:bg-slate-700/60 text-gray-300 hover:text-white'"
          >
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
              {{ getMemberInitials(user.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
            </div>
            <svg v-if="newMemberForm.userId === user._id" class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <!-- Role Selection -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Role</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="newMemberForm.role = 'member'"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center"
              :class="newMemberForm.role === 'member'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:border-slate-500/50 hover:text-gray-300'"
            >
              <span class="text-2xl">👤</span>
              <div>
                <p class="text-sm font-semibold">Member</p>
                <p class="text-xs text-gray-500 mt-0.5">View & contribute</p>
              </div>
            </button>
            <button
              type="button"
              @click="newMemberForm.role = 'admin'"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center"
              :class="newMemberForm.role === 'admin'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:border-slate-500/50 hover:text-gray-300'"
            >
              <span class="text-2xl">🛡️</span>
              <div>
                <p class="text-sm font-semibold">Admin</p>
                <p class="text-xs text-gray-500 mt-0.5">Full management</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showAddMemberModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!newMemberForm.userId" @click="handleAddMember">Add Member</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectPriority, WorkplacePlan } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Workplace | TaskFlow',
  description: 'Manage your workplace'
})

const route = useRoute()
const workplaceId = route.params.id as string

const {
  currentWorkplace,
  workplaceMembers,
  isLoading,
  loadWorkplace,
  loadWorkplaceMembers,
  updateWorkplace,
  deleteWorkplace,
  addMember,
  removeMember
} = useWorkplaces()

const { projectsApi, membershipApi } = useApi()
const { createProject } = useProjects()
const { members: allUsers, loadMembers } = useTeam()

const workplaceProjects = ref<Project[]>([])
const memberStatusMap = ref<Record<string, { isMember: boolean; role: string | null }>>({})
const joiningProjectId = ref<string | null>(null)
const activeTab = ref('projects')
const showEditModal = ref(false)
const showAddMemberModal = ref(false)
const showCreateProjectModal = ref(false)

const tabs = [
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'members', label: 'Members', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

const editForm = ref({
  name: '',
  plan: 'free' as WorkplacePlan
})

const newMemberForm = ref({
  userId: '',
  role: 'member'
})

const memberSearchQuery = ref('')

const newProjectForm = ref({
  name: '',
  key: '',
  description: '',
  priority: 'medium' as ProjectPriority
})

const planColor = computed((): 'slate' | 'blue' | 'amber' => {
  const colors: Record<string, 'slate' | 'blue' | 'amber'> = {
    free: 'slate',
    pro: 'blue',
    enterprise: 'amber'
  }
  return colors[currentWorkplace.value?.plan || 'free'] || 'slate'
})

const availableUsers = computed(() => {
  const memberUserIds = workplaceMembers.value.map(m => m.userId)
  return allUsers.value.filter(u => !memberUserIds.includes(u._id))
})

const filteredAvailableUsers = computed(() => {
  const q = memberSearchQuery.value.trim().toLowerCase()
  if (!q) return availableUsers.value
  return availableUsers.value.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  await Promise.all([
    loadWorkplace(workplaceId),
    loadWorkplaceMembers(workplaceId),
    loadWorkplaceProjects(),
    allUsers.value.length === 0 ? loadMembers() : Promise.resolve()
  ])
  await loadMemberStatuses()

  if (currentWorkplace.value) {
    editForm.value.name = currentWorkplace.value.name
    editForm.value.plan = currentWorkplace.value.plan
  }
})

async function loadWorkplaceProjects() {
  workplaceProjects.value = await projectsApi.getByWorkplace(workplaceId)
}

async function loadMemberStatuses() {
  if (workplaceProjects.value.length === 0) return
  const results = await Promise.all(
    workplaceProjects.value.map(p =>
      membershipApi.getMyMembership(p._id).then(s => ({ id: p._id, status: s }))
    )
  )
  memberStatusMap.value = Object.fromEntries(results.map(r => [r.id, r.status]))
}

async function handleJoinProject(projectId: string) {
  joiningProjectId.value = projectId
  await membershipApi.join(projectId)
  const updated = await membershipApi.getMyMembership(projectId)
  memberStatusMap.value = { ...memberStatusMap.value, [projectId]: updated }
  joiningProjectId.value = null
}

async function handleUpdate() {
  if (editForm.value.name) {
    await updateWorkplace(workplaceId, editForm.value)
    showEditModal.value = false
  }
}

async function handleDelete() {
  await deleteWorkplace(workplaceId)
  navigateTo('/workplaces')
}

async function handleCreateProject() {
  if (newProjectForm.value.name && newProjectForm.value.key) {
    const created = await createProject(newProjectForm.value, workplaceId)
    if (created) {
      workplaceProjects.value.push(created)
      const status = await membershipApi.getMyMembership(created._id)
      memberStatusMap.value = { ...memberStatusMap.value, [created._id]: status }
    }
    showCreateProjectModal.value = false
    newProjectForm.value = { name: '', key: '', description: '', priority: 'medium' }
  }
}

async function handleAddMember() {
  if (newMemberForm.value.userId) {
    await addMember(workplaceId, newMemberForm.value.userId, newMemberForm.value.role)
    showAddMemberModal.value = false
    newMemberForm.value = { userId: '', role: 'member' }
    memberSearchQuery.value = ''
  }
}

async function handleRemoveMember(userId: string) {
  await removeMember(workplaceId, userId)
}

function getMemberInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  }
  return parts[0]!.charAt(0).toUpperCase()
}

function getRoleColor(role: string): 'indigo' | 'emerald' | 'amber' {
  const colors: Record<string, 'indigo' | 'emerald' | 'amber'> = {
    owner: 'indigo',
    admin: 'emerald',
    member: 'amber'
  }
  return colors[role] || 'amber'
}
</script>
