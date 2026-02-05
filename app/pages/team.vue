<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Team Members</h1>
        <p class="text-gray-400 mt-1">Manage your team and their roles</p>
      </div>
      <BaseButton @click="showAddModal = true">
        <span>➕</span>
        Add Member
      </BaseButton>
    </div>

    <!-- Team Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TeamMemberCard
        v-for="member in membersWithStats"
        :key="member.id"
        :member="member"
      />
    </div>

    <EmptyState
      v-if="membersWithStats.length === 0"
      icon="👥"
      title="No team members"
      description="Add your first team member to get started"
    >
      <template #action>
        <BaseButton @click="showAddModal = true">Add Member</BaseButton>
      </template>
    </EmptyState>

    <!-- Add Member Modal -->
    <BaseModal v-model="showAddModal" title="Add Team Member" size="md">
      <form @submit.prevent="handleAddMember" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
          <input
            v-model="newMember.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
          <input
            v-model="newMember.email"
            type="email"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Role</label>
          <select
            v-model="newMember.role"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Avatar</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="emoji in avatarOptions"
              :key="emoji"
              type="button"
              @click="newMember.avatar = emoji"
              class="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors"
              :class="newMember.avatar === emoji ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showAddModal = false">Cancel</BaseButton>
          <BaseButton @click="handleAddMember">Add Member</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Team | TaskFlow',
  description: 'Manage your team members'
})

const { membersWithStats, createMember, loadMembers, members } = useTeam()

onMounted(async () => {
  if (members.value.length === 0) await loadMembers()
})

const showAddModal = ref(false)
const avatarOptions = ['👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '🧑‍🚀', '👤']

const newMember = ref({
  name: '',
  email: '',
  role: 'developer' as const,
  avatar: '👤'
})

function handleAddMember() {
  if (newMember.value.name && newMember.value.email) {
    createMember(newMember.value)
    showAddModal.value = false
    newMember.value = { name: '', email: '', role: 'developer', avatar: '👤' }
  }
}
</script>
