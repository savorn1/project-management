<template>
  <BaseModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="milestone ? 'Edit Milestone' : 'New Milestone'" size="md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Name <span class="text-rose-400">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. MVP Launch"
          maxlength="200"
          required
          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Optional details..."
          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
        ></textarea>
      </div>

      <!-- Due Date + Status row -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Due Date <span class="text-rose-400">*</span></label>
          <DatePicker
            :model-value="form.dueDate || null"
            @update:model-value="form.dueDate = $event || ''"
            placeholder="Select due date"
            :clearable="false"
            trigger-class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:border-indigo-500/50 transition-colors text-sm"
          />
        </div>
        <div class="relative" ref="statusRef">
          <label class="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
          <button
            type="button"
            @click.stop="statusOpen = !statusOpen"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-left flex items-center justify-between gap-2 hover:border-indigo-500/50 transition-colors"
          >
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="STATUS_MAP[form.status]?.dot"></span>
              <span :class="STATUS_MAP[form.status]?.text">{{ STATUS_MAP[form.status]?.label }}</span>
            </span>
            <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0 transition-transform" :class="statusOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Teleport to="body">
            <div v-if="statusOpen" class="fixed inset-0 z-[9998]" @click.stop="statusOpen = false"></div>
            <div
              v-if="statusOpen"
              class="fixed z-[9999] mt-1 py-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 w-44 overflow-hidden"
              :style="statusDropdownStyle"
            >
              <button
                v-for="opt in STATUS_OPTIONS"
                :key="opt.value"
                type="button"
                @click.stop="form.status = opt.value; statusOpen = false"
                class="w-full px-3 py-2 flex items-center gap-2.5 text-sm transition-colors hover:bg-slate-700/50"
                :class="form.status === opt.value ? 'bg-slate-700/40' : ''"
              >
                <span class="w-2 h-2 rounded-full flex-shrink-0" :class="opt.dot"></span>
                <span :class="opt.text">{{ opt.label }}</span>
                <svg v-if="form.status === opt.value" class="w-3.5 h-3.5 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </Teleport>
        </div>
      </div>

      <!-- Progress (edit only) -->
      <div v-if="milestone">
        <label class="block text-xs font-medium text-slate-400 mb-1.5">Progress — {{ form.progress }}%</label>
        <input
          v-model.number="form.progress"
          type="range"
          min="0"
          max="100"
          step="5"
          class="w-full accent-indigo-500"
        />
        <div class="flex justify-between text-[10px] text-slate-600 mt-0.5">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          @click="emit('update:modelValue', false)"
          class="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!form.name.trim() || !form.dueDate || saving"
          class="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {{ saving ? 'Saving…' : milestone ? 'Update' : 'Create' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Milestone } from '~/types'

interface Props {
  modelValue: boolean
  projectId: string
  milestone?: Milestone | null
}

const props = withDefaults(defineProps<Props>(), { milestone: null })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', milestone: Milestone): void
}>()

const { milestonesApi } = useApi()
const saving = ref(false)

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending',     dot: 'bg-slate-400',   text: 'text-slate-300' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-blue-400',    text: 'text-blue-300'  },
  { value: 'completed',   label: 'Completed',   dot: 'bg-emerald-400', text: 'text-emerald-300' },
  { value: 'overdue',     label: 'Overdue',     dot: 'bg-rose-400',    text: 'text-rose-300'  },
]
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(o => [o.value, o]))

const statusOpen = ref(false)
const statusRef = ref<HTMLElement | null>(null)
const statusDropdownStyle = ref<Record<string, string>>({})

watch(statusOpen, (open) => {
  if (!open || !statusRef.value) return
  const rect = statusRef.value.getBoundingClientRect()
  const dropH = 180
  let top = rect.bottom + 4
  if (top + dropH > window.innerHeight) top = rect.top - dropH - 4
  statusDropdownStyle.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
})

const form = reactive({
  name: '',
  description: '',
  dueDate: '',
  status: 'pending' as string,
  progress: 0,
})

// Populate form when editing
watch(() => props.milestone, (m) => {
  if (m) {
    form.name = m.name
    form.description = m.description ?? ''
    form.dueDate = m.dueDate.slice(0, 10)
    form.status = m.status
    form.progress = m.progress
  } else {
    form.name = ''
    form.description = ''
    form.dueDate = ''
    form.status = 'pending'
    form.progress = 0
  }
}, { immediate: true })

async function handleSubmit() {
  if (!form.name.trim() || !form.dueDate) return
  saving.value = true
  try {
    let result: Milestone | null
    if (props.milestone) {
      result = await milestonesApi.update(props.milestone._id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        dueDate: form.dueDate,
        status: form.status,
        progress: form.progress,
      })
    } else {
      result = await milestonesApi.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        projectId: props.projectId,
        dueDate: form.dueDate,
        status: form.status,
      })
    }
    if (result) {
      emit('saved', result)
      emit('update:modelValue', false)
    }
  } finally {
    saving.value = false
  }
}
</script>
