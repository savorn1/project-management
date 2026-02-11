<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">All Tasks</h1>
        <p class="text-gray-400 mt-1">View and manage tasks across all projects</p>
      </div>
      <BaseButton @click="showCreateModal = true">
        <span>➕</span>
        New Task
      </BaseButton>
    </div>

    <!-- Filters -->
    <BaseCard>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search tasks..."
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          v-model="filters.status"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>

        <select
          v-model="filters.priority"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          v-model="filters.projectId"
          class="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option :value="null">All Projects</option>
          <option v-for="project in projects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>

        <BaseButton variant="ghost" @click="clearFilters" size="sm">
          Clear
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Task List -->
    <TaskList :tasks="filteredTasks" @toggle="toggleTaskComplete" @select="openPreview" />

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
                    <span class="text-sm text-gray-500 truncate">{{ getProjectName(selectedTask.projectId) }}</span>
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
                    <BaseDatePicker
                      class="flex-1"
                      :model-value="selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : null"
                      @update:model-value="handleFieldUpdate('dueDate', $event)"
                      placeholder="Set due date"
                      trigger-class="cursor-pointer hover:text-white"
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
                  <ClientOnly>
                    <WysiwygEditor
                      :model-value="selectedTask.description || ''"
                      @update:model-value="handleDescriptionUpdate"
                      placeholder="Add a description..."
                    />
                    <template #fallback>
                      <div class="w-full min-h-[100px] px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-xl text-gray-500 animate-pulse">
                        Loading editor...
                      </div>
                    </template>
                  </ClientOnly>
                </div>

                <!-- Tags -->
                <div v-if="selectedTask.tags && selectedTask.tags.length > 0">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tags</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in selectedTask.tags"
                      :key="tag"
                      class="px-2.5 py-1 bg-slate-700/50 text-gray-300 text-xs rounded-full ring-1 ring-slate-600/30"
                    >
                      {{ tag }}
                    </span>
                  </div>
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

    <!-- Create Task Modal -->
    <BaseModal v-model="showCreateModal" title="Create New Task" size="2xl">
      <form @submit.prevent="handleCreateTask" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Title</label>
          <input
            v-model="newTask.title"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Task title"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Description</label>
          <ClientOnly>
            <WysiwygEditor
              v-model="newTask.description"
              placeholder="Task description..."
            />
            <template #fallback>
              <div class="w-full min-h-[120px] px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 animate-pulse">
                Loading editor...
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Project</label>
            <select
              v-model="newTask.projectId"
              required
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Select project</option>
              <option v-for="project in projects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Priority</label>
            <select
              v-model="newTask.priority"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Due Date</label>
            <input
              v-model="newTask.dueDate"
              type="date"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Assignee</label>
            <select
              v-model="newTask.assigneeId"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option :value="null">Unassigned</option>
              <option v-for="member in members" :key="member._id" :value="member._id">
               {{ member.name }}
              </option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="ghost" @click="showCreateModal = false">Cancel</BaseButton>
          <BaseButton @click="handleCreateTask">Create Task</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskPriority, TaskStatus } from '~/types'
import { formatDate } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Tasks | TaskFlow',
  description: 'Manage all your tasks'
})

const { filteredTasks, filters, toggleTaskComplete, createTask, updateTask, deleteTask, clearFilters, loadTasks, tasks } = useTasks()
const { projects, loadProjects, getProjectById } = useProjects()
const { members, loadMembers, getMemberById } = useTeam()

onMounted(async () => {
  if (tasks.value.length === 0) await loadTasks()
  if (projects.value.length === 0) await loadProjects()
  if (members.value.length === 0) await loadMembers()
})

const showCreateModal = ref(false)
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
  { value: 'low' as TaskPriority, label: 'Low', dot: 'bg-slate-400' },
  { value: 'medium' as TaskPriority, label: 'Medium', dot: 'bg-blue-400' },
  { value: 'high' as TaskPriority, label: 'High', dot: 'bg-amber-400' },
  { value: 'urgent' as TaskPriority, label: 'Urgent', dot: 'bg-rose-400' },
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
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const newTask = ref({
  title: '',
  description: '',
  projectId: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
  assigneeId: null as string | null
})

function openPreview(task: Task) {
  selectedTask.value = task
}

function getProjectName(projectId: string): string {
  return getProjectById(projectId)?.name || 'Unknown Project'
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

function handleCreateTask() {
  if (newTask.value.title && newTask.value.projectId) {
    createTask({
      ...newTask.value,
      dueDate: newTask.value.dueDate || null
    })
    showCreateModal.value = false
    newTask.value = {
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: null
    }
  }
}
</script>
