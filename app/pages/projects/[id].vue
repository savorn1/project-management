<template>
  <div v-if="isPageLoading" class="flex items-center justify-center py-16">
    <div class="text-gray-400">Loading project...</div>
  </div>
  <div class="space-y-6" v-else-if="project">
    <!-- Project Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/projects" class="text-gray-400 hover:text-white transition-colors">
          ← Back
        </NuxtLink>
        <div :class="`w-14 h-14 rounded-xl bg-gradient-to-br ${getProjectGradient(project.key)} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg`">
          {{ project.key.slice(0, 3) }}
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold text-white">{{ project.name }}</h1>
            <span class="text-[11px] font-mono text-gray-500 bg-slate-700/60 px-2 py-0.5 rounded tracking-widest">{{ project.key }}</span>
          </div>
          <p class="text-gray-400 text-sm mt-1">{{ project.description }}</p>
        </div>
      </div>

      <BaseButton v-if="memberStatus.isMember" variant="secondary" @click="showSettings = !showSettings">
        ⚙️ Settings
      </BaseButton>
    </div>

    <!-- Project Settings Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="memberStatus.isMember && showSettings" class="bg-slate-800/50 border border-slate-700/30 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-700/30 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Project Settings</h3>
          <button @click="showSettings = false" class="p-1.5 text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Labels</h4>
          <LabelManager :project-id="projectId" />

          <div class="mt-8 pt-6 border-t border-slate-700/30">
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Sprints</h4>
            <SprintManager :project-id="projectId" />
          </div>

        </div>
      </div>
    </Transition>

    <!-- Non-member Join Request Banner -->
    <div v-if="memberStatus && !memberStatus.isMember" class="rounded-xl border bg-indigo-500/10 border-indigo-500/30 p-4 flex items-center gap-4">
      <div class="text-2xl">🔒</div>
      <div class="flex-1">
        <p class="font-medium text-white text-sm">You are not a member of this project</p>
        <p class="text-xs mt-0.5 text-indigo-400">Join to contribute to tasks and discussions.</p>
      </div>
      <button
        @click="joinProject"
        :disabled="joinLoading"
        class="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex-shrink-0"
      >
        {{ joinLoading ? 'Joining...' : 'Join Project' }}
      </button>
    </div>

    <!-- Project Stats (members only) -->
    <div v-if="memberStatus.isMember" class="grid grid-cols-4 gap-4">
      <StatCard label="Total Tasks" :value="projectTasks.length" icon="📋" color="blue" />
      <StatCard label="Completed" :value="completedTasks" icon="✅" color="emerald" />
      <StatCard label="In Progress" :value="inProgressTasks" icon="⚡" color="amber" />
      <StatCard label="Progress" :value="`${progress}%`" icon="📊" color="indigo" />
    </div>

    <!-- Project Members (members only) -->
    <div v-if="memberStatus.isMember && projectMembers.length > 0" class="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Members ({{ projectMembers.length }})</h3>
        <span v-if="memberTotalPages > 1" class="text-xs text-gray-500">Page {{ memberPage }} of {{ memberTotalPages }}</span>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <div
          v-for="member in pagedMembers"
          :key="member._id"
          class="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/50 rounded-lg px-3 py-2 transition-colors"
        >
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 shadow-sm">
            {{ getMemberInitials(member.user?.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm text-white font-medium truncate leading-snug">{{ member.user?.name || 'Unknown' }}</p>
            <p class="text-[10px] text-gray-500 capitalize">({{ member.user?.email || member.role }})</p>
          </div>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="memberTotalPages > 1" class="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
        <button
          @click="memberPage--"
          :disabled="memberPage === 1"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <button
          v-for="p in memberTotalPages"
          :key="p"
          @click="memberPage = p"
          class="w-7 h-7 text-xs font-medium rounded-lg transition-colors"
          :class="p === memberPage ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'"
        >
          {{ p }}
        </button>
        <button
          @click="memberPage++"
          :disabled="memberPage === memberTotalPages"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Kanban Board (members only) -->
    <KanbanBoard v-if="memberStatus.isMember" :project-id="projectId" @add-task="handleAddTask" @select-task="openPreview" />

    <!-- Task Preview Slide-over -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="selectedTask" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedTask = null"></div>

          <Transition
            enter-active-class="transition ease-out duration-300 transform"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition ease-in duration-200 transform"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >
            <div class="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-700/30 shadow-2xl overflow-y-auto">
              <!-- Header -->
              <div class="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="flex-shrink-0 px-2 py-0.5 bg-indigo-500/15 text-indigo-400 text-xs font-mono font-medium rounded ring-1 ring-indigo-500/25">
                      {{ selectedTask.key || 'TASK' }}
                    </span>
                    <span class="text-sm text-gray-500 truncate">{{ project?.name }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      @click="handleDeleteFromPreview"
                      class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete task"
                    >
                      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      @click="selectedTask = null"
                      class="p-2 text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                    >
                      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 space-y-6">
                <!-- Title (editable) -->
                <div>
                  <input
                    :value="selectedTask.title"
                    @blur="handleFieldUpdate('title', ($event.target as HTMLInputElement).value)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
                    class="w-full text-xl font-semibold text-white bg-transparent border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-1 transition-all duration-200 placeholder-gray-600"
                    placeholder="Task title..."
                  />
                </div>

                <!-- Status & Priority Pills -->
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Status Dropdown -->
                  <div class="relative" ref="statusDropdownRef">
                    <button
                      @click="showStatusDropdown = !showStatusDropdown"
                      class="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 transition-all duration-200"
                      :class="statusPillClass(selectedTask.status)"
                    >
                      <span class="w-2 h-2 rounded-full" :class="statusDotClass(selectedTask.status)"></span>
                      {{ statusLabel(selectedTask.status) }}
                      <svg class="w-3 h-3 opacity-60 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <Transition
                      enter-active-class="transition ease-out duration-150"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-100"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div v-if="showStatusDropdown" class="absolute top-full left-0 mt-1.5 w-44 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 z-50 py-1 overflow-hidden">
                        <button
                          v-for="opt in statusOptions"
                          :key="opt.value"
                          @click="handleStatusChange(opt.value); showStatusDropdown = false"
                          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all duration-150"
                          :class="selectedTask.status === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                        >
                          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="opt.dot"></span>
                          {{ opt.label }}
                          <svg v-if="selectedTask.status === opt.value" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <!-- Priority Dropdown -->
                  <div class="relative" ref="priorityDropdownRef">
                    <button
                      @click="showPriorityDropdown = !showPriorityDropdown"
                      class="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 transition-all duration-200"
                      :class="priorityPillClass(selectedTask.priority)"
                    >
                      <span class="w-2 h-2 rounded-full" :class="priorityDotClass(selectedTask.priority)"></span>
                      {{ priorityLabel(selectedTask.priority) }}
                      <svg class="w-3 h-3 opacity-60 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <Transition
                      enter-active-class="transition ease-out duration-150"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-100"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div v-if="showPriorityDropdown" class="absolute top-full left-0 mt-1.5 w-44 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/30 z-50 py-1 overflow-hidden">
                        <button
                          v-for="opt in priorityOptions"
                          :key="opt.value"
                          @click="handlePriorityChange(opt.value); showPriorityDropdown = false"
                          class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all duration-150"
                          :class="selectedTask.priority === opt.value ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                        >
                          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="opt.dot"></span>
                          {{ opt.label }}
                          <svg v-if="selectedTask.priority === opt.value" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- Details Section -->
                <div class="bg-slate-800/40 rounded-xl border border-slate-700/30 divide-y divide-slate-700/30">
                  <!-- Assignee -->
                  <div class="flex items-center gap-3 px-4 py-3 relative" ref="assigneeDropdownRef">
                    <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-xs text-gray-500 w-20 flex-shrink-0">Assignee</span>
                    <div
                      class="flex-1 flex items-center gap-2 cursor-pointer group"
                      @click="showAssigneeDropdown = !showAssigneeDropdown"
                    >
                      <div
                        v-if="selectedTask.assigneeId && getAssigneeName(selectedTask.assigneeId)"
                        class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-medium flex-shrink-0 ring-2 ring-indigo-500/20"
                      >
                        {{ getInitials(getAssigneeName(selectedTask.assigneeId)) }}
                      </div>
                      <div v-else class="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-slate-600/30">
                        <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span class="text-sm transition-colors" :class="selectedTask.assigneeId ? 'text-gray-300 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-300'">
                        {{ getAssigneeName(selectedTask.assigneeId) || 'Unassigned' }}
                      </span>
                      <svg class="w-3 h-3 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>

                    <!-- Assignee Dropdown -->
                    <Transition
                      enter-active-class="transition ease-out duration-150"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-100"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div v-if="showAssigneeDropdown" class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 z-50 py-1 overflow-hidden max-h-60 overflow-y-auto">
                        <!-- Unassigned option -->
                        <button
                          @click="handleAssigneeChange(null); showAssigneeDropdown = false"
                          class="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150"
                          :class="!selectedTask.assigneeId ? 'bg-slate-700/60 text-white' : 'text-gray-400 hover:bg-slate-700/40 hover:text-gray-200'"
                        >
                          <div class="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span>Unassigned</span>
                          <svg v-if="!selectedTask.assigneeId" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>

                        <!-- Divider -->
                        <div class="border-t border-slate-700/40 my-1"></div>

                        <!-- Members -->
                        <button
                          v-for="member in members"
                          :key="member._id"
                          @click="handleAssigneeChange(member._id); showAssigneeDropdown = false"
                          class="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150"
                          :class="selectedTask.assigneeId === member._id ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                        >
                          <div class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-semibold flex-shrink-0 ring-2 ring-indigo-500/20">
                            {{ getInitials(member.name) }}
                          </div>
                          <div class="flex flex-col min-w-0">
                            <span class="truncate">{{ member.name }}</span>
                            <span v-if="member.email" class="text-[10px] text-gray-500 truncate">{{ member.email }}</span>
                          </div>
                          <svg v-if="selectedTask.assigneeId === member._id" class="w-3.5 h-3.5 ml-auto flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <!-- Due Date -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <span class="text-xs text-gray-500 w-20 flex-shrink-0">Due Date</span>
                    <DatePicker
                      class="flex-1"
                      :model-value="selectedTask.dueDate?.split('T')[0] ?? null"
                      @update:model-value="handleFieldUpdate('dueDate', $event)"
                      placeholder="Set due date"
                      trigger-class="cursor-pointer hover:text-white"
                    />
                  </div>

                  <!-- Sprint -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span class="text-xs text-gray-500 w-20 flex-shrink-0">Sprint</span>
                    <SprintPicker
                      class="flex-1"
                      :project-id="selectedTask.projectId"
                      :model-value="selectedTask.sprintId || null"
                      @update:model-value="handleSprintChange($event)"
                    />
                  </div>

                  <!-- Parent Task -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="text-xs text-gray-500 w-20 flex-shrink-0">Parent</span>
                    <ParentTaskPicker
                      class="flex-1"
                      :project-id="selectedTask.projectId"
                      :model-value="selectedTask.parentId || null"
                      :exclude-task-id="selectedTask._id"
                      @update:model-value="handleParentChange($event)"
                    />
                  </div>

                  <!-- Created -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs text-gray-500 w-20 flex-shrink-0">Created</span>
                    <span class="text-sm text-gray-400">{{ formatDate(selectedTask.createdAt) }}</span>
                  </div>
                </div>

                <!-- Description (editable) -->
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Description</span>
                  </div>
                  <textarea
                    :value="selectedTask.description || ''"
                    @input="handleDescriptionUpdate(($event.target as HTMLTextAreaElement).value)"
                    placeholder="Add a description..."
                    rows="4"
                    class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-y transition-colors"
                  ></textarea>
                </div>

                <!-- Labels -->
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Labels</span>
                  </div>
                  <LabelPicker
                    :project-id="selectedTask.projectId"
                    :model-value="selectedTask.labelIds || []"
                    @update:model-value="handleLabelsChange($event)"
                  />
                </div>

                <!-- Sub-tasks -->
                <div>
                  <SubtaskList
                    :task-id="selectedTask._id"
                    :tasks="projectTasks"
                    @select="openPreview"
                    @add="openCreateSubtask(selectedTask)"
                  />
                </div>

                <!-- Comments / Activity Tabs -->
                <div class="border-t border-slate-700/30 pt-5">
                  <div class="flex gap-1 mb-5 bg-slate-800/50 rounded-lg p-1">
                    <button
                      @click="previewTab = 'comments'"
                      class="flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all duration-200"
                      :class="previewTab === 'comments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'"
                    >
                      Comments
                    </button>
                    <button
                      @click="previewTab = 'activity'"
                      class="flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all duration-200"
                      :class="previewTab === 'activity' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'"
                    >
                      Activity
                    </button>
                  </div>

                  <TaskCommentSection v-if="previewTab === 'comments'" :task-id="selectedTask._id" />
                  <TaskActivitySection v-else :task-id="selectedTask._id" />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Task Modal -->
    <BaseModal v-model="showAddTaskModal" title="New Task" size="2xl">
      <div class="flex gap-6">
        <!-- Left: Content -->
        <div class="flex-1 min-w-0 space-y-4">
          <!-- Status chip -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Adding to</span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="{
                'bg-slate-500/20 text-slate-300': newTaskStatus === 'todo',
                'bg-blue-500/20 text-blue-300': newTaskStatus === 'in_progress',
                'bg-amber-500/20 text-amber-300': newTaskStatus === 'in_review',
                'bg-emerald-500/20 text-emerald-300': newTaskStatus === 'done',
              }"
            >
              <span class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-slate-400': newTaskStatus === 'todo',
                  'bg-blue-400': newTaskStatus === 'in_progress',
                  'bg-amber-400': newTaskStatus === 'in_review',
                  'bg-emerald-400': newTaskStatus === 'done',
                }"
              ></span>
              {{ { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }[newTaskStatus] }}
            </span>
          </div>

          <!-- Title -->
          <input
            v-model="newTask.title"
            type="text"
            autofocus
            placeholder="Task title..."
            class="w-full bg-transparent text-xl font-semibold text-white placeholder-gray-600 border-b-2 border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-2 transition-all"
          />

          <!-- Description -->
          <textarea
            v-model="newTask.description"
            placeholder="Add a description..."
            rows="6"
            class="w-full bg-slate-700/30 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/50 resize-none transition-colors"
          ></textarea>
        </div>

        <!-- Right: Attributes -->
        <div class="w-52 flex-shrink-0 space-y-5">
          <!-- Priority -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</p>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="p in priorityOptions"
                :key="p.value"
                type="button"
                @click="newTask.priority = p.value"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                :class="newTask.priority === p.value
                  ? p.activeClass
                  : 'bg-slate-700/30 border-slate-600/30 text-gray-400 hover:text-gray-300 hover:border-slate-500/50'"
              >
                <span class="w-2 h-2 rounded-full flex-shrink-0" :class="p.dot"></span>
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Due Date</p>
            <DatePicker
              :model-value="newTask.dueDate || null"
              @update:model-value="newTask.dueDate = $event || ''"
              placeholder="No due date"
              trigger-class="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-colors text-sm"
            />
          </div>

          <!-- Assignee -->
          <div class="relative" ref="projectTaskAssigneeRef">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Assignee</p>
            <!-- Trigger -->
            <button
              type="button"
              @click="showProjectTaskAssigneeDropdown = !showProjectTaskAssigneeDropdown; projectTaskAssigneeSearch = ''"
              class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50 transition-colors"
            >
              <div v-if="newTaskAssigneeMember" class="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0">
                {{ getMemberInitials(newTaskAssigneeMember.user?.name) }}
              </div>
              <div v-else class="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="flex-1 text-left truncate" :class="newTask.assigneeId ? 'text-gray-300' : 'text-gray-500'">
                {{ newTaskAssigneeMember?.user?.name || 'Unassigned' }}
              </span>
              <svg class="w-3 h-3 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <!-- Dropdown -->
            <div v-if="showProjectTaskAssigneeDropdown" class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
              <div class="p-2 border-b border-slate-700/30">
                <input
                  v-model="projectTaskAssigneeSearch"
                  type="text"
                  placeholder="Search members..."
                  class="w-full bg-slate-700/50 border border-slate-600/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                  @click.stop
                  autofocus
                />
              </div>
              <div class="max-h-44 overflow-y-auto py-1">
                <button
                  type="button"
                  @click="newTask.assigneeId = null; showProjectTaskAssigneeDropdown = false; projectTaskAssigneeSearch = ''"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all"
                  :class="newTask.assigneeId === null ? 'bg-slate-700/60 text-white' : 'text-gray-400 hover:bg-slate-700/40 hover:text-gray-200'"
                >
                  <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span>Unassigned</span>
                  <svg v-if="newTask.assigneeId === null" class="w-3 h-3 ml-auto text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  v-for="member in filteredProjectAssignees"
                  :key="member._id"
                  type="button"
                  @click="newTask.assigneeId = typeof member.userId === 'string' ? member.userId : member.userId._id; showProjectTaskAssigneeDropdown = false; projectTaskAssigneeSearch = ''"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all"
                  :class="newTask.assigneeId === (typeof member.userId === 'string' ? member.userId : member.userId._id) ? 'bg-slate-700/60 text-white' : 'text-gray-300 hover:bg-slate-700/40 hover:text-white'"
                >
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
                    {{ getMemberInitials(member.user?.name) }}
                  </div>
                  <span class="truncate">{{ member.user?.name || 'Unknown' }}</span>
                  <svg v-if="newTask.assigneeId === (typeof member.userId === 'string' ? member.userId : member.userId._id)" class="w-3 h-3 ml-auto text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div v-if="filteredProjectAssignees.length === 0 && projectTaskAssigneeSearch" class="px-3 py-2 text-xs text-gray-500 text-center">No members found</div>
              </div>
            </div>
          </div>

          <!-- Labels -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</p>
            <LabelPicker :project-id="projectId" v-model="newTask.labelIds" />
          </div>

          <!-- Sprint -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sprint</p>
            <SprintPicker :project-id="projectId" v-model="newTask.sprintId" />
          </div>

          <!-- Parent Task -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Parent Task</p>
            <ParentTaskPicker :project-id="projectId" v-model="newTask.parentId" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showAddTaskModal = false">Cancel</BaseButton>
          <BaseButton :disabled="!newTask.title.trim()" @click="handleCreateTask">Create Task</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>

  <!-- Not Found -->
  <div v-else class="flex flex-col items-center justify-center py-20">
    <EmptyState
      icon="🔍"
      title="Project not found"
      description="The project you're looking for doesn't exist"
    >
      <template #action>
        <NuxtLink to="/projects">
          <BaseButton>Back to Projects</BaseButton>
        </NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus, TaskPriority, ProjectMember } from '~/types'
import { formatDate } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const projectId = route.params.id as string

const { createTask, updateTask, deleteTask, getTasksByProject, loadTasksByProject } = useTasks()
const { getProjectById, loadProjects, projects } = useProjects()
const { members, loadMembers, getMemberById } = useTeam()
const { subscribe, unsubscribe, isConnected } = useTaskRealtime(projectId)
const { membershipApi, projectsApi, projectMembersApi } = useApi()

onMounted(async () => {
  if (projects.value.length === 0) await loadProjects()
  // Fallback: fetch directly if project isn't in the store (e.g., navigated from workplace page)
  if (!getProjectById(projectId)) {
    const fetched = await projectsApi.getById(projectId)
    if (fetched) projects.value = [...projects.value, fetched]
  }
  // Check membership before rendering to avoid content flash for non-members
  await loadMemberStatus()
  isPageLoading.value = false
  if (memberStatus.value.isMember) {
    if (members.value.length === 0) await loadMembers()
    await Promise.all([loadTasksByProject(projectId), loadProjectMembers()])
    subscribe()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  unsubscribe()
  document.removeEventListener('click', handleClickOutside)
})

const project = computed(() => getProjectById(projectId))
const projectTasks = computed(() => getTasksByProject(projectId))
const progress = computed(() => {
  if (projectTasks.value.length === 0) return 0
  const completed = projectTasks.value.filter(t => t.status === 'done').length
  return Math.round((completed / projectTasks.value.length) * 100)
})

const completedTasks = computed(() => projectTasks.value.filter(t => t.status === 'done').length)
const inProgressTasks = computed(() => projectTasks.value.filter(t => t.status === 'in_progress').length)

const isPageLoading = ref(true)
const showSettings = ref(false)

// Project members
const projectMembers = ref<ProjectMember[]>([])
const memberPage = ref(1)
const MEMBERS_PER_PAGE = 10

const memberTotalPages = computed(() => Math.ceil(projectMembers.value.length / MEMBERS_PER_PAGE))
const pagedMembers = computed(() => {
  const start = (memberPage.value - 1) * MEMBERS_PER_PAGE
  return projectMembers.value.slice(start, start + MEMBERS_PER_PAGE)
})

async function loadProjectMembers() {
  projectMembers.value = await projectMembersApi.getWithDetails(projectId)
  memberPage.value = 1
}

function getMemberInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
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

// Join state
const memberStatus = ref<{ isMember: boolean; role: string | null }>({ isMember: false, role: null })
const joinLoading = ref(false)

async function loadMemberStatus() {
  memberStatus.value = await membershipApi.getMyMembership(projectId)
}

async function joinProject() {
  joinLoading.value = true
  await membershipApi.join(projectId)
  joinLoading.value = false
  await loadMemberStatus()
}

useSeoMeta({
  title: () => project.value ? `${project.value.name} | TaskFlow` : 'Project | TaskFlow',
  description: () => project.value?.description || 'Project details'
})

// Task preview
const selectedTask = ref<Task | null>(null)
const previewTab = ref<'comments' | 'activity'>('comments')
const showStatusDropdown = ref(false)
const showPriorityDropdown = ref(false)
const showAssigneeDropdown = ref(false)
const statusDropdownRef = ref<HTMLElement | null>(null)
const priorityDropdownRef = ref<HTMLElement | null>(null)
const assigneeDropdownRef = ref<HTMLElement | null>(null)

const statusOptions = [
  { value: 'todo' as TaskStatus, label: 'To Do', dot: 'bg-slate-400' },
  { value: 'in_progress' as TaskStatus, label: 'In Progress', dot: 'bg-blue-400' },
  { value: 'in_review' as TaskStatus, label: 'In Review', dot: 'bg-amber-400' },
  { value: 'done' as TaskStatus, label: 'Done', dot: 'bg-emerald-400' },
]

const priorityOptions = [
  { value: 'low' as TaskPriority, label: 'Low', dot: 'bg-slate-400', activeClass: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  { value: 'medium' as TaskPriority, label: 'Medium', dot: 'bg-blue-400', activeClass: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { value: 'high' as TaskPriority, label: 'High', dot: 'bg-amber-400', activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { value: 'urgent' as TaskPriority, label: 'Urgent', dot: 'bg-rose-400', activeClass: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
]

function statusLabel(status: TaskStatus): string {
  return statusOptions.find(o => o.value === status)?.label || status
}

function priorityLabel(priority: TaskPriority): string {
  return priorityOptions.find(o => o.value === priority)?.label || priority
}

function statusDotClass(status: TaskStatus): string {
  return statusOptions.find(o => o.value === status)?.dot || 'bg-slate-400'
}

function priorityDotClass(priority: TaskPriority): string {
  return priorityOptions.find(o => o.value === priority)?.dot || 'bg-slate-400'
}

// Close dropdowns on outside click
function handleClickOutside(event: MouseEvent) {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(event.target as Node)) {
    showStatusDropdown.value = false
  }
  if (priorityDropdownRef.value && !priorityDropdownRef.value.contains(event.target as Node)) {
    showPriorityDropdown.value = false
  }
  if (assigneeDropdownRef.value && !assigneeDropdownRef.value.contains(event.target as Node)) {
    showAssigneeDropdown.value = false
  }
  if (projectTaskAssigneeRef.value && !projectTaskAssigneeRef.value.contains(event.target as Node)) {
    showProjectTaskAssigneeDropdown.value = false
  }
}

function openPreview(task: Task) {
  selectedTask.value = task
}

function getAssigneeName(assigneeId: string | null): string | undefined {
  if (!assigneeId) return undefined
  return getMemberById(assigneeId)?.name
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
  return parts[0]!.charAt(0).toUpperCase()
}

function statusPillClass(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30 focus:ring-slate-400',
    in_progress: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30 focus:ring-blue-400',
    in_review: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 focus:ring-amber-400',
    done: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 focus:ring-emerald-400',
  }
  return map[status]
}

function priorityPillClass(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30 focus:ring-slate-400',
    medium: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30 focus:ring-blue-400',
    high: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30 focus:ring-amber-400',
    urgent: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30 focus:ring-rose-400',
  }
  return map[priority]
}

async function handleStatusChange(status: TaskStatus) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { status })
  selectedTask.value = { ...selectedTask.value, status }
}

async function handlePriorityChange(priority: TaskPriority) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { priority })
  selectedTask.value = { ...selectedTask.value, priority }
}

async function handleAssigneeChange(assigneeId: string | null) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { assigneeId })
  selectedTask.value = { ...selectedTask.value, assigneeId }
}

async function handleLabelsChange(labelIds: string[]) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { labelIds } as any)
  selectedTask.value = { ...selectedTask.value, labelIds }
}

async function handleSprintChange(sprintId: string | null) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { sprintId } as any)
  selectedTask.value = { ...selectedTask.value, sprintId: sprintId || undefined }
}

async function handleParentChange(parentId: string | null) {
  if (!selectedTask.value) return
  await updateTask(selectedTask.value._id, { parentId } as any)
  selectedTask.value = { ...selectedTask.value, parentId: parentId || undefined }
}

function openCreateSubtask(parentTask: Task) {
  newTask.value.parentId = parentTask._id
  showAddTaskModal.value = true
}

async function handleFieldUpdate(field: string, value: string | null) {
  if (!selectedTask.value) return
  if (field === 'title' && value === selectedTask.value.title) return
  if (field === 'title' && !value?.trim()) return
  await updateTask(selectedTask.value._id, { [field]: value })
  selectedTask.value = { ...selectedTask.value, [field]: value }
}

let descriptionTimer: ReturnType<typeof setTimeout> | null = null
function handleDescriptionUpdate(value: string) {
  if (!selectedTask.value) return
  selectedTask.value = { ...selectedTask.value, description: value }
  if (descriptionTimer) clearTimeout(descriptionTimer)
  descriptionTimer = setTimeout(() => {
    if (selectedTask.value) {
      updateTask(selectedTask.value._id, { description: value })
    }
  }, 800)
}

async function handleDeleteFromPreview() {
  if (!selectedTask.value) return
  await deleteTask(selectedTask.value._id)
  selectedTask.value = null
}

// Add task modal
const showAddTaskModal = ref(false)
const newTaskStatus = ref<TaskStatus>('todo')

// Assignee search dropdown
const showProjectTaskAssigneeDropdown = ref(false)
const projectTaskAssigneeSearch = ref('')
const projectTaskAssigneeRef = ref<HTMLElement | null>(null)

const newTaskAssigneeMember = computed(() => {
  if (!newTask.value.assigneeId) return null
  return projectMembers.value.find(m => {
    const uid = typeof m.userId === 'string' ? m.userId : m.userId._id
    return uid === newTask.value.assigneeId
  }) || null
})

const filteredProjectAssignees = computed(() => {
  const q = projectTaskAssigneeSearch.value.toLowerCase().trim()
  if (!q) return projectMembers.value
  return projectMembers.value.filter(m => (m.user?.name || '').toLowerCase().includes(q))
})

const newTask = ref({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeId: null as string | null,
  labelIds: [] as string[],
  sprintId: null as string | null,
  parentId: null as string | null,
})

function handleAddTask(status: TaskStatus) {
  newTaskStatus.value = status
  showAddTaskModal.value = true
}

function handleCreateTask() {
  if (newTask.value.title) {
    createTask({
      ...newTask.value,
      projectId,
      status: newTaskStatus.value,
      dueDate: newTask.value.dueDate || null,
      sprintId: newTask.value.sprintId || undefined,
      parentId: newTask.value.parentId || undefined,
    })
    showAddTaskModal.value = false
    newTask.value = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: null,
      labelIds: [],
      sprintId: null,
      parentId: null,
    }
  }
}
</script>
