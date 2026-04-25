<template>
  <div class="space-y-5">

    <!-- ─── Page header ───────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Tasks CRUD Demo</h1>
        <p class="text-gray-400 text-sm mt-0.5">
          Full CRUD using <span class="text-violet-400">Field*</span> form components and
          <span class="text-sky-400">Col*</span> column components with the real API.
        </p>
      </div>
      <button type="button" @click="openCreate"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>

    <!-- ─── Filters ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-12 gap-3">
      <!-- Search -->
      <div class="col-span-4 relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="filters.search" type="text" placeholder="Search title or tags…"
          class="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
      </div>
      <!-- Project filter -->
      <div class="col-span-3">
        <FieldSelect2FromAjax
          v-model="filters.project"
          :fetch-fn="fetchProjects"
          placeholder="All projects"
          :min-chars="0"
        />
      </div>
      <!-- Status -->
      <div class="col-span-2">
        <FieldEnum v-model="filters.status" :options="statusOptions" placeholder="Status" />
      </div>
      <!-- Priority -->
      <div class="col-span-2">
        <FieldEnum v-model="filters.priority" :options="priorityOptions" placeholder="Priority" />
      </div>
      <!-- Clear -->
      <div class="col-span-1 flex items-center">
        <button v-if="hasFilters" type="button" @click="clearFilters"
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap">
          Clear
        </button>
      </div>
    </div>

    <!-- ─── Stats strip ───────────────────────────────────────────── -->
    <div class="flex items-center gap-4 text-xs text-gray-500">
      <span>{{ filteredTasks.length }} tasks</span>
      <span v-if="loading" class="flex items-center gap-1.5 text-indigo-400">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading…
      </span>
      <button type="button" @click="reload" class="hover:text-gray-300 transition-colors ml-auto">↻ Refresh</button>
    </div>

    <!-- ─── Table ─────────────────────────────────────────────────── -->
    <div class="bg-slate-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
      <!-- Empty state -->
      <div v-if="!loading && filteredTasks.length === 0" class="py-16 flex flex-col items-center gap-3 text-gray-500">
        <svg class="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-sm">No tasks found</p>
        <button type="button" @click="openCreate" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Create one</button>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-800/60 bg-slate-800/40">
            <th class="w-10 px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Title</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Priority</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Due Date</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Points</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tags</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Created</th>
            <th class="w-20 px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr v-for="(task, idx) in pagedTasks" :key="task._id"
            class="hover:bg-slate-800/30 transition-colors group">
            <!-- # ColRowNumber -->
            <td class="px-4 py-3"><ColRowNumber :value="(page - 1) * pageSize + idx + 1" /></td>

            <!-- Title ColText (bold) + key badge -->
            <td class="px-4 py-3 max-w-xs">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-600 font-mono flex-shrink-0">{{ task.key }}</span>
                <ColText :value="task.title" :bold="true" :limit="50" />
              </div>
            </td>

            <!-- Status ColBadge -->
            <td class="px-4 py-3">
              <ColBadge :value="statusLabels[task.status]" :color="statusColors[task.status]" :dot="true" />
            </td>

            <!-- Priority ColBadge -->
            <td class="px-4 py-3">
              <ColBadge :value="priorityLabels[task.priority]" :color="priorityColors[task.priority]" />
            </td>

            <!-- Due date ColDate -->
            <td class="px-4 py-3"><ColDate :value="task.dueDate" /></td>

            <!-- Story points ColNumber -->
            <td class="px-4 py-3">
              <ColNumber :value="(task as any).storyPoints ?? null" suffix=" pts" />
            </td>

            <!-- Tags ColArray (badges) -->
            <td class="px-4 py-3">
              <ColArray :value="task.tags" :as-badges="true" :limit="3" />
            </td>

            <!-- Created ColDatetime (relative) -->
            <td class="px-4 py-3"><ColDatetime :value="task.createdAt" :relative="true" /></td>

            <!-- Actions -->
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" @click="openEdit(task)"
                  class="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button type="button" @click="confirmDelete(task)"
                  class="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
        <span class="text-xs text-gray-500">Page {{ page }} of {{ totalPages }}</span>
        <div class="flex items-center gap-1">
          <button v-for="p in totalPages" :key="p" type="button"
            class="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
            :class="p === page ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white hover:bg-slate-800'"
            @click="page = p">{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- ─── Create / Edit Modal ───────────────────────────────────── -->
    <BaseModal v-model="showModal" :title="editingTask ? 'Edit Task' : 'New Task'" size="2xl">
      <form class="space-y-4" @submit.prevent="submitForm">

        <!-- Project (required for create) -->
        <FieldSelect2FromAjax
          v-model="form.project"
          :fetch-fn="fetchProjects"
          label="Project"
          placeholder="Select a project…"
          :min-chars="0"
          :required="true"
          :error="formErrors.projectId"
        />

        <!-- Title -->
        <FieldText
          v-model="form.title"
          label="Title"
          placeholder="Enter task title…"
          :required="true"
          :maxlength="500"
          :show-counter="true"
          :error="formErrors.title"
          :validate-on='"input"'
          :rules="[
            v => !!v || 'Title is required',
            v => v.length >= 3 || 'Minimum 3 characters',
            v => /^[a-z0-9_]+$/.test(v) || 'Lowercase letters, numbers and _ only',
        ]"
        />

        <!-- Description -->
        <FieldTextarea
          v-model="form.description"
          label="Description"
          placeholder="Describe the task…"
          :rows="4"
          :show-counter="true"
          :auto-resize="true"
          :maxlength="10000"
        />

        <!-- Status + Priority (2 col) -->
        <div class="grid grid-cols-2 gap-4">
          <FieldEnum
            v-model="form.status"
            :options="statusOptions"
            label="Status"
          />
          <FieldEnum
            v-model="form.priority"
            :options="priorityOptions"
            label="Priority"
          />
        </div>

        <!-- Due date + Story points (2 col) -->
        <div class="grid grid-cols-2 gap-4">
          <FieldDatePicker
            v-model="form.dueDate"
            label="Due Date"
            hint="Leave empty for no deadline"
          />

          <FieldDatePicker
            v-model="form.dueDate1"
            label="Due Date"
            hint="Leave empty for no deadline"
          />

          <FieldNumber
            v-model="form.storyPoints"
            label="Story Points"
            :min="0"
            :max="100"
            :step="1"
            hint="Estimate in story points"
          />
        </div>

        <!-- Tags -->
        <FieldTagInput
          v-model="form.tags"
          label="Tags"
          placeholder="Add a tag…"
          :suggestions="tagSuggestions"
          hint="Press Enter or comma to add a tag"
        />

        <!-- Assignee -->
        <FieldRelationship
          v-model="form.assignee"
          :fetch-fn="fetchMembers"
          label="Assignee"
          placeholder="Search team members…"
          :min-chars="1"
          hint="Type to search"
        />

        <!-- Form footer -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/50">
          <button type="button" @click="showModal = false"
            class="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="submitting"
            class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
            <span v-if="submitting" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
            <span v-else>{{ editingTask ? 'Save changes' : 'Create task' }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ─── Delete confirm ────────────────────────────────────────── -->
    <BaseModal v-model="showDeleteModal" title="Delete Task" size="sm">
      <p class="text-gray-300 text-sm leading-relaxed mb-1">
        Are you sure you want to delete
        <strong class="text-white">"{{ deletingTask?.title }}"</strong>?
      </p>
      <p class="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
      <div class="flex items-center gap-3">
        <button type="button" @click="showDeleteModal = false"
          class="flex-1 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white bg-slate-700/40 hover:bg-slate-700/80 transition-colors">
          Cancel
        </button>
        <button type="button" @click="deleteTask" :disabled="submitting"
          class="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          Delete
        </button>
      </div>
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import type { Task, Project } from '~/types'
import type { AjaxOption } from '~/components/form/FieldSelect2FromAjax.vue'
import type { RelationshipItem } from '~/components/form/FieldRelationship.vue'
import { v } from 'vue-router/dist/router-CWoNjPRp.mjs'

// ─── API ─────────────────────────────────────────────────────────────────────

const { tasksApi, projectsApi, teamApi, loading } = useApi()

// ─── Lookup maps ─────────────────────────────────────────────────────────────

type ColColor = 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'orange'

const statusLabels: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
}
const statusColors: Record<string, ColColor> = {
  todo: 'slate', in_progress: 'sky', in_review: 'amber', done: 'emerald',
}
const priorityLabels: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
}
const priorityColors: Record<string, ColColor> = {
  low: 'slate', medium: 'indigo', high: 'amber', urgent: 'rose',
}

const statusOptions: Record<string, string> = { ...statusLabels }
const priorityOptions: Record<string, string> = { ...priorityLabels }

const tagSuggestions = [
  'bug', 'feature', 'enhancement', 'docs', 'refactor', 'test',
  'design', 'backend', 'frontend', 'api', 'ui', 'performance',
]

// ─── Data ─────────────────────────────────────────────────────────────────────

const tasks = ref<Task[]>([])
const projects = ref<Project[]>([])

async function reload() {
  const [myTasks, allProjects] = await Promise.all([
    tasksApi.getMyTasks(),
    projectsApi.getAll(),
  ])
  tasks.value = myTasks
  projects.value = allProjects
}

onMounted(reload)

// ─── Filters ─────────────────────────────────────────────────────────────────

const filters = reactive({
  search:  '',
  project: null as AjaxOption | null,
  status:  null as string | null,
  priority: null as string | null,
})

const hasFilters = computed(() =>
  !!(filters.search || filters.project || filters.status || filters.priority)
)

function clearFilters() {
  filters.search = ''
  filters.project = null
  filters.status = null
  filters.priority = null
}

const filteredTasks = computed(() => {
  let list = tasks.value
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }
  if (filters.project) list = list.filter(t => t.projectId === String(filters.project!.value))
  if (filters.status)    list = list.filter(t => t.status === filters.status)
  if (filters.priority)  list = list.filter(t => t.priority === filters.priority)
  return list
})

// ─── Pagination ───────────────────────────────────────────────────────────────

const page     = ref(1)
const pageSize = 15

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTasks.value.length / pageSize)))
const pagedTasks = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredTasks.value.slice(start, start + pageSize)
})

watch(filteredTasks, () => { page.value = 1 })

// ─── Async fetch helpers (for FieldSelect2FromAjax / FieldRelationship) ──────

async function fetchProjects(query: string): Promise<AjaxOption[]> {
  const list = projects.value.length
    ? projects.value
    : await projectsApi.getAll()
  const q = query.toLowerCase()
  return list
    .filter(p => !q || p.name.toLowerCase().includes(q))
    .slice(0, 20)
    .map(p => ({ value: p._id, label: p.name }))
}

async function fetchMembers(query: string): Promise<RelationshipItem[]> {
  const { data } = await teamApi.getAll({ name: query, pageSize: 20 })
  return data.map(m => ({
    id: m._id,
    label: m.name,
    description: m.email,
  }))
}

// ─── Create / Edit ────────────────────────────────────────────────────────────

const showModal   = ref(false)
const editingTask = ref<Task | null>(null)
const submitting  = ref(false)

const formErrors = reactive({ title: '', projectId: '' })

const form = reactive({
  project:     null as AjaxOption | null,
  title:       '',
  description: '',
  status:      'todo' as string,
  priority:    'medium' as string,
  dueDate:     null as string | null,
  dueDate1:     null as string | null,
  storyPoints: null as number | null,
  tags:        [] as string[],
  assignee:    null as RelationshipItem | null,
})

function resetForm() {
  form.project     = filters.project ?? null
  form.title       = ''
  form.description = ''
  form.status      = 'todo'
  form.priority    = 'medium'
  form.dueDate     = null
  form.storyPoints = null
  form.tags        = []
  form.assignee    = null
  formErrors.title = ''
  formErrors.projectId = ''
}

function openCreate() {
  editingTask.value = null
  resetForm()
  showModal.value = true
}

function openEdit(task: Task) {
  editingTask.value = task
  const proj = projects.value.find(p => p._id === task.projectId)
  form.project     = proj ? { value: proj._id, label: proj.name } : null
  form.title       = task.title
  form.description = task.description ?? ''
  form.status      = task.status
  form.priority    = task.priority
  form.dueDate     = task.dueDate
  form.storyPoints = (task as any).storyPoints ?? null
  form.tags        = [...task.tags]
  form.assignee    = task.assigneeId ? { id: task.assigneeId, label: task.assigneeId } : null
  formErrors.title = ''
  formErrors.projectId = ''
  showModal.value  = true
}

function validateForm(): boolean {
  formErrors.title = form.title.trim() ? '' : 'Title is required'
  formErrors.projectId = (editingTask.value || form.project) ? '' : 'Select a project'
  return !formErrors.title && !formErrors.projectId
}

async function submitForm() {
  if (!validateForm()) return
  submitting.value = true
  try {
    const payload: Partial<Task> & { storyPoints?: number } = {
      title:       form.title.trim(),
      description: form.description || undefined,
      status:      form.status as any,
      priority:    form.priority as any,
      dueDate:     form.dueDate || null,
      storyPoints: form.storyPoints ?? undefined,
      tags:        form.tags,
      assigneeId:  form.assignee?.id as string | undefined ?? null,
    }

    if (editingTask.value) {
      const updated = await tasksApi.update(editingTask.value._id, payload)
      if (updated) {
        const idx = tasks.value.findIndex(t => t._id === updated._id)
        if (idx !== -1) tasks.value[idx] = updated
        showModal.value = false
      }
    } else {
      const created = await tasksApi.create(payload, String(form.project!.value))
      if (created) {
        tasks.value.unshift(created)
        showModal.value = false
      }
    }
  } finally {
    submitting.value = false
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

const showDeleteModal = ref(false)
const deletingTask    = ref<Task | null>(null)

function confirmDelete(task: Task) {
  deletingTask.value = task
  showDeleteModal.value = true
}

async function deleteTask() {
  if (!deletingTask.value) return
  submitting.value = true
  try {
    const ok = await tasksApi.delete(deletingTask.value._id)
    if (ok) {
      tasks.value = tasks.value.filter(t => t._id !== deletingTask.value!._id)
      showDeleteModal.value = false
    }
  } finally {
    submitting.value = false
  }
}
</script>
