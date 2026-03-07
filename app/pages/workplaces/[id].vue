<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-400">Loading workplace...</div>
    </div>

    <template v-else-if="currentWorkplace">
      <!-- Back link -->
      <NuxtLink
        to="/workplaces"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <span class="text-base leading-none">←</span>
        Back to workplaces
      </NuxtLink>

      <!-- Workplace Hero (matches ProjectCard style) -->
      <BaseCard noPadding class="overflow-hidden">
        <!-- Cover area -->
        <div class="relative h-44 overflow-hidden group">
          <div
            v-if="currentWorkplace.coverImage"
            class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            :style="{ backgroundImage: `url(${currentWorkplace.coverImage})` }"
          />
          <div
            v-else
            :class="`absolute inset-0 bg-gradient-to-br ${getCoverGradient(currentWorkplace.slug)} transition-transform duration-500 group-hover:scale-105`"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <!-- Cover actions (top-right) -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              @click.prevent.stop="copyLink"
              class="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              title="Copy link"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              @click.prevent.stop="showEditModal = true"
              class="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              title="Edit workplace"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click.prevent.stop="showCoverModal = true"
              class="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              title="Edit cover"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            <button
              @click.prevent.stop="showAddMemberModal = true"
              class="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
              title="Add member"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          </div>

          <!-- Avatar (bottom-left) -->
          <div
            :class="`absolute bottom-3 left-3 w-11 h-11 rounded-2xl bg-gradient-to-br ${getWorkplaceGradient(currentWorkplace.name)} flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-black/20`"
          >
            {{ getWorkplaceInitials(currentWorkplace.name) }}
          </div>

          <!-- Badges (bottom-right) -->
          <div class="absolute bottom-3 right-3 flex items-center gap-1.5">
            <BaseBadge size="xs" variant="soft" :color="planBadgeColor">{{ formatPlan(currentWorkplace.plan) }}</BaseBadge>
            <BaseBadge
              size="xs"
              variant="soft"
              :color="currentWorkplace.status === 'active' ? 'emerald' : 'slate'"
            >
              {{ formatStatus(currentWorkplace.status) }}
            </BaseBadge>
          </div>
        </div>

        <!-- Info area -->
        <div class="px-5 pt-4 pb-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h1 class="text-2xl font-bold text-white truncate">{{ currentWorkplace.name }}</h1>
              <p class="text-[11px] font-mono text-gray-500 mt-1 truncate">taskflow.io/{{ currentWorkplace.slug }}</p>
            </div>
            <div class="hidden md:flex items-center gap-2.5">
              <div class="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p class="text-[10px] text-gray-500 uppercase tracking-wide">Projects</p>
                <p class="text-sm font-semibold text-gray-200 leading-tight">{{ workplaceProjects.length }}</p>
              </div>
              <div class="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p class="text-[10px] text-gray-500 uppercase tracking-wide">Members</p>
                <p class="text-sm font-semibold text-gray-200 leading-tight">{{ workplaceMembers.length }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/30">
            <span class="text-[11px] text-gray-600">Created on {{ formatDate(currentWorkplace.createdAt) }}</span>
            <span class="text-[11px] text-gray-600 font-mono">{{ currentWorkplace.slug }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- Tabs -->
      <div class="border-b border-slate-700/30">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium transition-all border-b-2 -mb-px"
            :class="activeTab === tab.id
              ? 'text-white border-indigo-500'
              : 'text-gray-400 hover:text-white border-transparent'"
          >
            <!-- folder icon -->
            <svg v-if="tab.id === 'projects'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <!-- users icon -->
            <svg v-else-if="tab.id === 'members'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <!-- gear icon -->
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ workplaceProjects.length }} project{{ workplaceProjects.length !== 1 ? 's' : '' }}</p>
          <BaseButton @click="showCreateProjectModal = true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </BaseButton>
        </div>

        <div class="flex gap-5 items-start">
          <!-- Project cards grid -->
          <div class="flex-1 min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProjectCard
                v-for="project in workplaceProjects"
                :key="project._id"
                :project="project"
                :member-status="memberStatusMap[project._id]"
                @request-join="handleJoinProject"
              />
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

          <!-- Recent Activity sidebar -->
          <div v-if="recentProjects.length > 0" class="w-56 flex-shrink-0 bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 sticky top-4">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Activity</h3>
            </div>
            <div class="space-y-0.5">
              <NuxtLink
                v-for="project in recentProjects"
                :key="project._id"
                :to="`/projects/${project._id}`"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-700/40 transition-colors group"
              >
                <div :class="`w-7 h-7 rounded-lg bg-gradient-to-br ${getProjectGradient(project.key)} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`">
                  {{ project.key.slice(0, 2) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-white font-medium truncate group-hover:text-indigo-300 transition-colors">{{ project.name }}</p>
                  <p class="text-[10px] text-gray-500 mt-0.5">{{ formatRelativeTime(project.updatedAt) }}</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'">
        <div v-if="workplaceMembers.length > 0" class="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Members ({{ workplaceMembers.length }})</h3>
          <div class="flex flex-wrap gap-2.5">
            <div
              v-for="member in workplaceMembers"
              :key="member.userId"
              class="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/50 rounded-lg px-3 py-2 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 shadow-sm">
                {{ getMemberInitials(member.user?.name) }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm text-white font-medium truncate leading-snug">{{ member.user?.name || 'Unknown' }}</p>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize flex-shrink-0" :class="getRoleBadgeClass(member.role)">
                    {{ member.role }}
                  </span>
                </div>
                <p v-if="member.user?.email" class="text-[10px] text-gray-500 truncate mt-0.5">{{ member.user.email }}</p>
              </div>
              <button
                v-if="member.role !== 'owner'"
                @click="handleRemoveMember(member.userId)"
                class="ml-1 w-5 h-5 flex items-center justify-center rounded-md text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
                title="Remove member"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
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
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-base">⚙️</div>
            <h3 class="text-white font-semibold">General Settings</h3>
          </div>
          <div class="space-y-5">
            <!-- Name -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Workplace Name</p>
              <input
                v-model="editForm.name"
                type="text"
                placeholder="Workplace name..."
                class="w-full bg-transparent text-lg font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
              />
            </div>

            <!-- Plan -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="plan in planOptions"
                  :key="plan.value"
                  type="button"
                  @click="editForm.plan = plan.value"
                  class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-center"
                  :class="editForm.plan === plan.value
                    ? plan.activeClass
                    : 'bg-slate-700/20 border-slate-600/30 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50'"
                >
                  <span class="text-lg leading-none">{{ plan.icon }}</span>
                  <span class="text-xs font-semibold">{{ plan.label }}</span>
                  <span class="text-[10px] leading-tight opacity-70">{{ plan.description }}</span>
                </button>
              </div>
            </div>

            <div class="pt-2">
              <BaseButton :disabled="!editForm.name.trim()" @click="handleUpdate">Save Changes</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-rose-400 font-semibold">Danger Zone</h3>
          </div>
          <div class="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-white">Archive this workplace</p>
                <p class="text-xs text-gray-500 mt-1">All projects and data will be inaccessible to all members.</p>
              </div>
              <button
                @click="handleDelete"
                class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-all whitespace-nowrap"
              >
                Archive Workplace
              </button>
            </div>
          </div>
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
      <div class="space-y-5">
        <!-- Name -->
        <div>
          <input
            v-model="editForm.name"
            type="text"
            autofocus
            placeholder="Workplace name..."
            class="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
          />
        </div>

        <!-- Plan -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="plan in planOptions"
              :key="plan.value"
              type="button"
              @click="editForm.plan = plan.value"
              class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-center"
              :class="editForm.plan === plan.value
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
          <BaseButton variant="ghost" @click="showEditModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!editForm.name.trim()" @click="handleUpdate">Save Changes</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Create Project Modal -->
    <BaseModal v-model="showCreateProjectModal" title="New Project" size="md">
      <div class="space-y-5">
        <!-- Name -->
        <div>
          <input
            v-model="newProjectForm.name"
            type="text"
            autofocus
            placeholder="Project name..."
            class="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
            @input="autoGenerateKey"
          />
        </div>

        <!-- Key -->
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Key</p>
            <span v-if="!keyManuallyEdited" class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">auto</span>
          </div>
          <input
            v-model="newProjectForm.key"
            type="text"
            placeholder="WEB"
            maxlength="10"
            class="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm uppercase tracking-widest transition-colors"
            @input="onKeyInput"
          />
          <p class="text-gray-600 text-xs mt-1">Uppercase letters and numbers only (max 10 chars)</p>
        </div>

        <!-- Description -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
          <textarea
            v-model="newProjectForm.description"
            rows="3"
            placeholder="Describe the project..."
            class="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 text-sm resize-none transition-colors"
          ></textarea>
        </div>

        <!-- Priority -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="p in priorityOptions"
              :key="p.value"
              type="button"
              @click="newProjectForm.priority = p.value"
              class="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all text-center"
              :class="newProjectForm.priority === p.value ? p.activeClass : 'bg-slate-700/20 border-slate-600/30 text-gray-500 hover:text-gray-300 hover:bg-slate-700/40 hover:border-slate-500/50'"
            >
              <span class="text-base leading-none">{{ p.icon }}</span>
              <span class="text-xs font-semibold">{{ p.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateProjectModal = false; newProjectForm = { name: '', key: '', description: '', priority: 'medium' }; keyManuallyEdited = false">Cancel</BaseButton>
          <BaseButton :disabled="!newProjectForm.name.trim() || !newProjectForm.key.trim()" @click="handleCreateProject">Create Project</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Cover Image Modal -->
    <BaseModal v-model="showCoverModal" title="Workplace Cover" size="md">
      <div class="space-y-5">
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Cover image</p>
            <button
              v-if="coverPreview"
              type="button"
              class="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              @click="removeCover"
            >
              Remove
            </button>
          </div>

          <div
            class="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors"
            :class="coverPreview ? 'border-transparent' : 'border-slate-700 hover:border-slate-500'"
            @click="coverInput?.click()"
          >
            <img v-if="coverPreview" :src="coverPreview" alt="Cover" class="w-full h-full object-cover" />
            <div v-else class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-slate-800/10 flex flex-col items-center justify-center gap-2 text-slate-500">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm">Click to upload a cover photo</span>
              <span class="text-xs">Recommended: 1200 × 300 px</span>
            </div>
            <div v-if="uploadingCover" class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          </div>

          <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCoverModal = false">Close</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Add Member Modal -->
    <BaseModal v-model="showAddMemberModal" title="Add Member" size="md">
      <div class="space-y-5">

        <!-- Member search dropdown -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Member</p>
          <div class="relative">
            <!-- Trigger -->
            <button
              ref="addMemberTriggerRef"
              type="button"
              @click="openAddMemberDropdown"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm border transition-all"
              :class="selectedMemberForAdd
                ? 'bg-slate-700/40 border-slate-600/40 text-white'
                : 'bg-slate-700/20 border-slate-600/30 text-gray-400 hover:border-slate-500/50'"
            >
              <div v-if="selectedMemberForAdd" class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {{ getMemberInitials(selectedMemberForAdd.name) }}
              </div>
              <div v-else class="w-7 h-7 rounded-full bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p v-if="selectedMemberForAdd" class="font-medium truncate">{{ selectedMemberForAdd.name }}</p>
                <p v-else class="text-gray-500">Select a member...</p>
                <p v-if="selectedMemberForAdd" class="text-xs text-gray-500 truncate">{{ selectedMemberForAdd.email }}</p>
              </div>
              <svg class="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200" :class="showAddMemberDropdown ? 'rotate-180' : ''" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Teleported dropdown (escapes modal overflow-y-auto) -->
            <Teleport to="body">
              <template v-if="showAddMemberDropdown">
                <!-- Backdrop -->
                <div class="fixed inset-0" style="z-index: 99998;" @click="showAddMemberDropdown = false"></div>
                <!-- Panel -->
                <div
                  class="fixed bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                  style="z-index: 99999;"
                  :style="addMemberDropdownStyle"
                >
                  <!-- Search -->
                  <div class="p-2 border-b border-slate-700/30">
                    <input
                      v-model="memberSearchQuery"
                      type="text"
                      placeholder="Search by name or email..."
                      class="w-full bg-slate-700/50 border border-slate-600/30 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                      @click.stop
                      autofocus
                    />
                  </div>
                  <!-- List -->
                  <div class="max-h-72 overflow-y-auto py-1">
                    <div v-if="availableUsers.length === 0" class="flex flex-col items-center py-6 gap-1.5 text-center">
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p class="text-sm text-gray-500">All users are already members</p>
                    </div>
                    <div v-else-if="filteredAvailableUsers.length === 0" class="px-3 py-4 text-sm text-gray-500 text-center">
                      No results for "{{ memberSearchQuery }}"
                    </div>
                    <button
                      v-for="user in filteredAvailableUsers"
                      :key="user._id"
                      type="button"
                      @click="newMemberForm.userId = user._id; showAddMemberDropdown = false; memberSearchQuery = ''"
                      class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all"
                      :class="newMemberForm.userId === user._id ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                    >
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {{ getMemberInitials(user.name) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">{{ user.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                      </div>
                      <svg v-if="newMemberForm.userId === user._id" class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </template>
            </Teleport>
          </div>
        </div>

        <!-- Role -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Role</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="newMemberForm.role = 'member'"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
              :class="newMemberForm.role === 'member'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                : 'bg-slate-700/20 border-slate-600/30 text-gray-400 hover:border-slate-500/50 hover:text-gray-300'"
            >
              <span class="text-xl leading-none flex-shrink-0">👤</span>
              <div>
                <p class="text-sm font-semibold">Member</p>
                <p class="text-xs text-gray-500 mt-0.5">View & contribute</p>
              </div>
              <div class="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" :class="newMemberForm.role === 'member' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'">
                <svg v-if="newMemberForm.role === 'member'" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            </button>
            <button
              type="button"
              @click="newMemberForm.role = 'admin'"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
              :class="newMemberForm.role === 'admin'
                ? 'bg-amber-500/10 border-amber-500/40 text-white'
                : 'bg-slate-700/20 border-slate-600/30 text-gray-400 hover:border-slate-500/50 hover:text-gray-300'"
            >
              <span class="text-xl leading-none flex-shrink-0">🛡️</span>
              <div>
                <p class="text-sm font-semibold">Admin</p>
                <p class="text-xs text-gray-500 mt-0.5">Full management</p>
              </div>
              <div class="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all" :class="newMemberForm.role === 'admin' ? 'bg-amber-500 border-amber-500' : 'border-slate-600'">
                <svg v-if="newMemberForm.role === 'admin'" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            </button>
          </div>
        </div>

      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showAddMemberModal = false; newMemberForm.userId = ''; newMemberForm.role = 'member'; memberSearchQuery = ''">Cancel</BaseButton>
          <BaseButton :disabled="!newMemberForm.userId" @click="handleAddMember">Add Member</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectPriority, WorkplacePlan } from '~/types'
import { formatRelativeTime } from '~/utils/formatters'

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
const socket = useSocket()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { getAuthHeader, user } = useAuth()

const workplaceProjects = ref<Project[]>([])
const memberStatusMap = ref<Record<string, { isMember: boolean; role: string | null }>>({})
const joiningProjectId = ref<string | null>(null)
const activeTab = ref('projects')
const showEditModal = ref(false)
const showAddMemberModal = ref(false)
const showCreateProjectModal = ref(false)
const showCoverModal = ref(false)

const tabs = [
  { id: 'projects', label: 'Projects' },
  { id: 'members', label: 'Members' },
  { id: 'settings', label: 'Settings' },
]

const editForm = ref({
  name: '',
  plan: 'free' as WorkplacePlan
})

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

const newMemberForm = ref({
  userId: '',
  role: 'member'
})

const memberSearchQuery = ref('')
const showAddMemberDropdown = ref(false)
const addMemberTriggerRef = ref<HTMLElement | null>(null)
const addMemberDropdownStyle = ref<Record<string, string>>({})

const newProjectForm = ref({
  name: '',
  key: '',
  description: '',
  priority: 'medium' as ProjectPriority
})

const keyManuallyEdited = ref(false)

// Cover image state
const coverPreview = ref<string | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const uploadingCover = ref(false)

const priorityOptions: { value: ProjectPriority, label: string, icon: string, activeClass: string }[] = [
  { value: 'low', label: 'Low', icon: '🟢', activeClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' },
  { value: 'medium', label: 'Medium', icon: '🔵', activeClass: 'bg-blue-500/10 border-blue-500/40 text-blue-300' },
  { value: 'high', label: 'High', icon: '🟠', activeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-300' },
  { value: 'critical', label: 'Critical', icon: '🔴', activeClass: 'bg-rose-500/10 border-rose-500/40 text-rose-300' },
]

function autoGenerateKey() {
  if (!keyManuallyEdited.value) {
    const words = newProjectForm.value.name.trim().split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
      newProjectForm.value.key = words.map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    } else if (words.length === 1) {
      newProjectForm.value.key = words[0]!.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    } else {
      newProjectForm.value.key = ''
    }
  }
}

function onKeyInput(event: Event) {
  keyManuallyEdited.value = true
  const input = event.target as HTMLInputElement
  newProjectForm.value.key = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const planBadgeColor = computed(() => {
  const map: Record<string, 'emerald' | 'indigo' | 'amber' | 'slate'> = {
    free: 'emerald',
    pro: 'indigo',
    enterprise: 'amber',
  }
  return map[currentWorkplace.value?.plan || 'free'] || 'slate'
})

const recentProjects = computed(() =>
  [...workplaceProjects.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
)

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

const selectedMemberForAdd = computed(() => {
  if (!newMemberForm.value.userId) return null
  return allUsers.value.find(u => u._id === newMemberForm.value.userId) ?? null
})

function openAddMemberDropdown() {
  showAddMemberDropdown.value = !showAddMemberDropdown.value
  memberSearchQuery.value = ''
  if (showAddMemberDropdown.value && addMemberTriggerRef.value) {
    const rect = addMemberTriggerRef.value.getBoundingClientRect()
    addMemberDropdownStyle.value = {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
}

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
    coverPreview.value = currentWorkplace.value.coverImage ?? null
  }

  // Setup real-time project updates for this workplace
  socket.connect()
  socket.joinRoom(`workplace:${workplaceId}`)
  socket.on('project:created', onProjectCreated)
  socket.on('project:updated', onProjectUpdated)
  socket.on('project:deleted', onProjectDeleted)
})

watch(currentWorkplace, (w) => {
  if (w) {
    if (w.coverImage !== undefined) {
      coverPreview.value = w.coverImage || null
    }
  }
})

onUnmounted(() => {
  showAddMemberDropdown.value = false
  socket.leaveRoom(`workplace:${workplaceId}`)
  socket.off('project:created', onProjectCreated)
  socket.off('project:updated', onProjectUpdated)
  socket.off('project:deleted', onProjectDeleted)
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

function onProjectCreated(data: { project: Project }) {
  const exists = workplaceProjects.value.find(p => p._id === data.project._id)
  if (!exists) {
    workplaceProjects.value.push(data.project)
    membershipApi.getMyMembership(data.project._id).then(s => {
      memberStatusMap.value = { ...memberStatusMap.value, [data.project._id]: s }
    })
  }
}

function onProjectUpdated(data: { project: Project }) {
  const index = workplaceProjects.value.findIndex(p => p._id === data.project._id)
  if (index !== -1) {
    workplaceProjects.value[index] = { ...workplaceProjects.value[index], ...data.project }
  }
}

function onProjectDeleted(data: { project: { _id: string } }) {
  const index = workplaceProjects.value.findIndex(p => p._id === data.project._id)
  if (index !== -1) workplaceProjects.value.splice(index, 1)
}

async function handleJoinProject(projectId: string) {
  joiningProjectId.value = projectId
  await membershipApi.join(projectId)
  const updated = await membershipApi.getMyMembership(projectId)
  memberStatusMap.value = { ...memberStatusMap.value, [projectId]: updated }
  joiningProjectId.value = null
}

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/workplaces/${workplaceId}`)
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    archived: 'Archived',
  }
  return map[status] || status
}

function formatPlan(plan: string): string {
  const map: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return map[plan] || plan
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getCoverGradient(seedStr: string): string {
  const gradients = [
    'from-blue-950 via-blue-900 to-sky-800',
    'from-violet-950 via-purple-900 to-indigo-800',
    'from-slate-900 via-slate-800 to-slate-700',
    'from-emerald-950 via-teal-900 to-cyan-800',
    'from-rose-950 via-rose-900 to-pink-800',
    'from-amber-950 via-orange-900 to-amber-800',
  ]
  return gradients[(seedStr.charCodeAt(0) || 0) % gradients.length]!
}

async function handleUpdate() {
  if (editForm.value.name) {
    await updateWorkplace(workplaceId, editForm.value)
    showEditModal.value = false
  }
}

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  const params = new URLSearchParams({ uploaderId: user.value?.id ?? 'user' })
  const res = await fetch(`${apiBase}/uploads/single?${params}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: fd,
  })
  if (!res.ok) return null
  const json = await res.json().catch(() => null)
  return json?.data?.url ?? null
}

async function onCoverSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverPreview.value = URL.createObjectURL(file)
  uploadingCover.value = true
  try {
    const url = await uploadImage(file)
    if (url) {
      await updateWorkplace(workplaceId, { coverImage: url })
      coverPreview.value = url
    }
  } finally {
    uploadingCover.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function removeCover() {
  coverPreview.value = null
  await updateWorkplace(workplaceId, { coverImage: '' })
}

async function handleDelete() {
  await deleteWorkplace(workplaceId)
  navigateTo('/workplaces')
}

async function handleCreateProject() {
  if (newProjectForm.value.name && newProjectForm.value.key) {
    const created = await createProject(newProjectForm.value, workplaceId)
    if (created) {
      // Guard: socket event may have already added it
      const exists = workplaceProjects.value.find(p => p._id === created._id)
      if (!exists) workplaceProjects.value.push(created)
      const status = await membershipApi.getMyMembership(created._id)
      memberStatusMap.value = { ...memberStatusMap.value, [created._id]: status }
    }
    showCreateProjectModal.value = false
    newProjectForm.value = { name: '', key: '', description: '', priority: 'medium' }
    keyManuallyEdited.value = false
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

function getWorkplaceGradient(name: string): string {
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ]
  const seed = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)
  return gradients[seed % gradients.length]!
}

function getWorkplaceInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getRoleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    owner: 'bg-violet-500/20 text-violet-400',
    admin: 'bg-purple-500/20 text-purple-400',
    manager: 'bg-indigo-500/20 text-indigo-400',
    developer: 'bg-blue-500/20 text-blue-400',
    viewer: 'bg-slate-600/40 text-gray-400',
    member: 'bg-slate-600/40 text-gray-400',
  }
  return map[role] || 'bg-slate-600/40 text-gray-400'
}

function getProjectGradient(key: string): string {
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ]
  return gradients[(key.charCodeAt(0) || 0) % gradients.length]!
}

function getMemberInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  }
  return parts[0]!.charAt(0).toUpperCase()
}

</script>
