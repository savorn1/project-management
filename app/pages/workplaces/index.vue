<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Workplaces</h1>
        <p class="text-gray-400 mt-1">Manage your workplaces and teams</p>
      </div>
      <BaseButton @click="openCreateModal">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        New Workplace
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading workplaces...</div>
    </div>

    <!-- Workplaces Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <BaseButton @click="openCreateModal">Create Workplace</BaseButton>
      </template>
    </EmptyState>

    <!-- Create Workplace Modal -->
    <BaseModal v-model="showCreateModal" title="New Workplace" size="md">
      <div class="space-y-5">
        <!-- Name -->
        <div>
          <input
            v-model="newWorkplace.name"
            type="text"
            autofocus
            placeholder="Workplace name..."
            class="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
            @input="autoGenerateSlug"
          />
        </div>

        <!-- Slug -->
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</p>
            <span v-if="!slugManuallyEdited" class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">auto</span>
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono select-none">taskflow.io/</span>
            <input
              v-model="newWorkplace.slug"
              @input="onSlugInput"
              type="text"
              placeholder="acme-corp"
              class="w-full pl-[5.5rem] pr-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm transition-colors"
            />
          </div>
          <p class="text-gray-600 text-xs mt-1">Lowercase letters, numbers, and hyphens only</p>
        </div>

        <!-- Plan -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="plan in planOptions"
              :key="plan.value"
              type="button"
              @click="newWorkplace.plan = plan.value"
              class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-center"
              :class="newWorkplace.plan === plan.value
                ? plan.activeClass
                : 'bg-slate-700/20 border-slate-600/30 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50'"
            >
              <span class="text-lg leading-none">{{ plan.icon }}</span>
              <span class="text-xs font-semibold">{{ plan.label }}</span>
              <span class="text-[10px] leading-tight opacity-70">{{ plan.description }}</span>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!newWorkplace.name.trim() || !newWorkplace.slug.trim()" @click="handleCreate">
            Create Workplace
          </BaseButton>
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

const planOptions = [
  {
    value: 'free' as WorkplacePlan,
    label: 'Free',
    icon: '🌱',
    description: 'Up to 3 projects',
    activeClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
  },
  {
    value: 'pro' as WorkplacePlan,
    label: 'Pro',
    icon: '⚡',
    description: 'Unlimited projects',
    activeClass: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
  },
  {
    value: 'enterprise' as WorkplacePlan,
    label: 'Enterprise',
    icon: '🏆',
    description: 'SSO & advanced',
    activeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
  },
]

function autoGenerateSlug() {
  if (!slugManuallyEdited.value) {
    newWorkplace.value.slug = newWorkplace.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

function onSlugInput(event: Event) {
  slugManuallyEdited.value = true
  const input = event.target as HTMLInputElement
  newWorkplace.value.slug = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

function openCreateModal() {
  newWorkplace.value = { name: '', slug: '', plan: 'free' }
  slugManuallyEdited.value = false
  showCreateModal.value = true
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
