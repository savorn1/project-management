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
    <BaseModal v-model="showCreateModal" title="Create User" size="md">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
          <input
            v-model="createForm.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
          <input
            v-model="createForm.email"
            type="email"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Password</label>
          <input
            v-model="createForm.password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Min. 6 characters"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Role</label>
          <select
            v-model="createForm.role"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreate">Create User</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit User Modal -->
    <BaseModal v-model="showEditModal" title="Edit User" size="md">
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
          <input
            v-model="editForm.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">
            New Password <span class="text-slate-500">(leave empty to keep current)</span>
          </label>
          <input
            v-model="editForm.password"
            type="password"
            minlength="6"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Role</label>
          <select
            v-model="editForm.role"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="editForm.isActive" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
          <span class="text-gray-300 text-sm">Active</span>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton @click="handleUpdate">Save Changes</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete User" size="sm">
      <p class="text-gray-300">
        Are you sure you want to delete <span class="text-white font-semibold">{{ deletingMember?.name }}</span>?
        This action cannot be undone.
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showDeleteModal = false">Cancel</BaseButton>
          <BaseButton @click="handleDelete" class="!bg-rose-600 hover:!bg-rose-700">Delete</BaseButton>
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

// Create Modal
const showCreateModal = ref(false)
const createForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'admin' as UserRole
})

function openCreateModal() {
  createForm.value = { name: '', email: '', password: '', role: 'admin' }
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
