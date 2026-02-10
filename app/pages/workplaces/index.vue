<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Workplaces</h1>
        <p class="text-gray-400 mt-1">Manage your workplaces and teams</p>
      </div>
      <BaseButton @click="showCreateModal = true">
        <span>➕</span>
        New Workplace
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading workplaces...</div>
    </div>

    <!-- Workplaces Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WorkplaceCard
        v-for="workplace in workplaces"
        :key="workplace._id"
        :workplace="workplace"
        :project-count="workplaceStats[workplace._id]?.projectCount ?? 0"
        :member-count="workplaceStats[workplace._id]?.memberCount ?? 0"
      />
    </div>

    <EmptyState
      v-if="!isLoading && workplaces.length === 0"
      icon="🏢"
      title="No workplaces yet"
      description="Create your first workplace to start organizing your projects and teams"
    >
      <template #action>
        <BaseButton @click="showCreateModal = true">Create Workplace</BaseButton>
      </template>
    </EmptyState>

    <!-- Create Workplace Modal -->
    <BaseModal v-model="showCreateModal" title="Create New Workplace" size="md">
      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Workplace Name</label>
          <input
            v-model="newWorkplace.name"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Acme Corp"
            @input="autoGenerateSlug"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Slug</label>
          <input
            v-model="newWorkplace.slug"
            type="text"
            required
            pattern="^[a-z0-9-]+$"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="acme-corp"
          />
          <p class="text-gray-500 text-xs mt-1">Lowercase letters, numbers, and hyphens only</p>
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Plan</label>
          <select
            v-model="newWorkplace.plan"
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
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreate">Create Workplace</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { WorkplacePlan } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Workplaces | TaskFlow',
  description: 'Manage your workplaces'
})

const { workplaces, workplaceStats, isLoading, loadWorkplaces, createWorkplace } = useWorkplaces()

onMounted(async () => {
  if (workplaces.value.length === 0) await loadWorkplaces()
})

const showCreateModal = ref(false)

const newWorkplace = ref({
  name: '',
  slug: '',
  plan: 'free' as WorkplacePlan
})

const slugManuallyEdited = ref(false)

function autoGenerateSlug() {
  if (!slugManuallyEdited.value) {
    newWorkplace.value.slug = newWorkplace.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

async function handleCreate() {
  if (newWorkplace.value.name && newWorkplace.value.slug) {
    await createWorkplace(newWorkplace.value)
    showCreateModal.value = false
    newWorkplace.value = { name: '', slug: '', plan: 'free' }
    slugManuallyEdited.value = false
  }
}
</script>
