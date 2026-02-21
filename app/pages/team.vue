<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">User Management</h1>
        <p class="text-gray-400 mt-1">Manage users and their roles</p>
      </div>
      <BaseButton @click="openCreateModal">
        <span>➕</span>
        Add User
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading users...</div>
    </div>

    <!-- User Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TeamMemberCard
        v-for="member in members"
        :key="member._id"
        :member="member"
        :current-user-id="user?.id"
        @edit="openEditModal"
        @delete="openDeleteConfirm"
      />
    </div>

    <EmptyState
      v-if="!isLoading && members.length === 0"
      icon="👥"
      title="No users"
      description="Add your first user to get started"
    >
      <template #action>
        <BaseButton @click="openCreateModal">Add User</BaseButton>
      </template>
    </EmptyState>

    <!-- Create User Modal -->
    <BaseModal v-model="showCreateModal" title="New User" size="md">
      <div class="space-y-5">
        <!-- Avatar preview + Name -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ring-4 ring-indigo-500/20">
            {{ getInitials(createForm.name) || '?' }}
          </div>
          <input
            v-model="createForm.name"
            type="text"
            autofocus
            placeholder="Full name..."
            class="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-1 transition-all"
          />
        </div>

        <!-- Email -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email</p>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <input
              v-model="createForm.email"
              type="email"
              placeholder="john@example.com"
              class="w-full pl-10 pr-3 py-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm transition-colors"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              v-model="createForm.password"
              :type="showCreatePassword ? 'text' : 'password'"
              placeholder="Min. 6 characters"
              minlength="6"
              class="w-full pl-10 pr-10 py-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              @click="showCreatePassword = !showCreatePassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg v-if="showCreatePassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Role -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Role</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="r in roleOptions"
              :key="r.value"
              type="button"
              @click="createForm.role = r.value"
              class="flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left"
              :class="createForm.role === r.value
                ? r.activeClass
                : 'bg-slate-700/20 border-slate-600/30 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50'"
            >
              <span class="text-xl leading-none flex-shrink-0">{{ r.icon }}</span>
              <div class="min-w-0">
                <p class="text-xs font-semibold">{{ r.label }}</p>
                <p class="text-[10px] opacity-70 leading-tight mt-0.5">{{ r.description }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!createForm.name.trim() || !createForm.email.trim() || createForm.password.length < 6" @click="handleCreate">
            Create User
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit User Modal -->
    <BaseModal v-model="showEditModal" title="Edit User" size="md">
      <div class="space-y-5">
        <!-- Avatar preview + Name -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ring-4 ring-indigo-500/20">
            {{ getInitials(editForm.name) || '?' }}
          </div>
          <input
            v-model="editForm.name"
            type="text"
            placeholder="Full name..."
            class="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-1 transition-all"
          />
        </div>

        <!-- Email -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email</p>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            <input
              v-model="editForm.email"
              type="email"
              class="w-full pl-10 pr-3 py-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm transition-colors"
            />
          </div>
        </div>

        <!-- New Password -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            New Password
            <span class="normal-case text-gray-600 ml-1">(leave empty to keep current)</span>
          </p>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              v-model="editForm.password"
              :type="showEditPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              minlength="6"
              class="w-full pl-10 pr-10 py-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              @click="showEditPassword = !showEditPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg v-if="showEditPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Role -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Role</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="r in roleOptions"
              :key="r.value"
              type="button"
              @click="editForm.role = r.value"
              class="flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left"
              :class="editForm.role === r.value
                ? r.activeClass
                : 'bg-slate-700/20 border-slate-600/30 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50'"
            >
              <span class="text-xl leading-none flex-shrink-0">{{ r.icon }}</span>
              <div class="min-w-0">
                <p class="text-xs font-semibold">{{ r.label }}</p>
                <p class="text-[10px] opacity-70 leading-tight mt-0.5">{{ r.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Active toggle -->
        <div class="flex items-center justify-between px-3 py-3 bg-slate-700/20 border border-slate-600/30 rounded-xl">
          <div>
            <p class="text-sm font-medium text-gray-300">Account Active</p>
            <p class="text-xs text-gray-500 mt-0.5">User can log in and access the system</p>
          </div>
          <button
            type="button"
            @click="editForm.isActive = !editForm.isActive"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
            :class="editForm.isActive ? 'bg-indigo-600' : 'bg-slate-600'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="editForm.isActive ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!editForm.name.trim() || !editForm.email.trim()" @click="handleUpdate">
            Save Changes
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete User" size="sm">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="text-gray-300 text-sm">
            Are you sure you want to delete <span class="text-white font-semibold">{{ deletingMember?.name }}</span>?
          </p>
          <p class="text-gray-500 text-xs mt-1">This action cannot be undone.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showDeleteModal = false">Cancel</BaseButton>
          <BaseButton @click="handleDelete" class="!bg-rose-600 hover:!bg-rose-700">Delete User</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember, UserRole } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'User Management | TaskFlow',
  description: 'Manage users and their roles'
})

const { user } = useAuth()
const { members, isLoading, createMember, updateMember, deleteMember, loadMembers } = useTeam()

onMounted(async () => {
  if (members.value.length === 0) await loadMembers()
})

function getInitials(name: string): string {
  if (!name?.trim()) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

const roleOptions = [
  {
    value: 'admin' as UserRole,
    label: 'Admin',
    icon: '🛡️',
    description: 'Manage users & settings',
    activeClass: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
  },
  {
    value: 'super_admin' as UserRole,
    label: 'Super Admin',
    icon: '👑',
    description: 'Full system access',
    activeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
  },
]

// Create Modal
const showCreateModal = ref(false)
const showCreatePassword = ref(false)
const createForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'admin' as UserRole
})

function openCreateModal() {
  createForm.value = { name: '', email: '', password: '', role: 'admin' }
  showCreatePassword.value = false
  showCreateModal.value = true
}

async function handleCreate() {
  if (createForm.value.name && createForm.value.email && createForm.value.password) {
    await createMember(createForm.value)
    showCreateModal.value = false
  }
}

// Edit Modal
const showEditModal = ref(false)
const showEditPassword = ref(false)
const editingId = ref('')
const editForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'admin' as UserRole,
  isActive: true
})

function openEditModal(member: TeamMember) {
  editingId.value = member._id
  editForm.value = {
    name: member.name,
    email: member.email,
    password: '',
    role: member.role,
    isActive: member.isActive
  }
  showEditPassword.value = false
  showEditModal.value = true
}

async function handleUpdate() {
  if (editForm.value.name && editForm.value.email) {
    const data: Record<string, unknown> = {
      name: editForm.value.name,
      email: editForm.value.email,
      role: editForm.value.role,
      isActive: editForm.value.isActive
    }
    if (editForm.value.password) {
      data.password = editForm.value.password
    }
    await updateMember(editingId.value, data)
    showEditModal.value = false
  }
}

// Delete Modal
const showDeleteModal = ref(false)
const deletingMember = ref<TeamMember | null>(null)

function openDeleteConfirm(member: TeamMember) {
  deletingMember.value = member
  showDeleteModal.value = true
}

async function handleDelete() {
  if (deletingMember.value) {
    await deleteMember(deletingMember.value._id)
    showDeleteModal.value = false
    deletingMember.value = null
  }
}
</script>
