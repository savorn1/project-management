<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9996] flex items-center justify-center p-4"
      @click.self="close"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5 z-10">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-white">Set Reminder</h3>
          <button @click="close" class="ml-auto w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Note -->
        <div class="mb-3">
          <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Remind me about</label>
          <input
            ref="noteRef"
            v-model="note"
            type="text"
            placeholder="e.g. Follow up on this, Review the PR…"
            maxlength="200"
            class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
          />
        </div>

        <!-- Quick picks -->
        <p class="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">When</p>
        <div class="grid grid-cols-2 gap-1.5 mb-3">
          <button
            v-for="opt in quickOptions"
            :key="opt.label"
            @click="selectedDate = opt.date; customDate = null; customTime = ''"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left',
              selectedDate === opt.date && !customDate
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            ]"
          >
            <span class="block font-semibold">{{ opt.label }}</span>
            <span class="block text-[10px] opacity-60">{{ formatPick(opt.date) }}</span>
          </button>
        </div>

        <!-- Custom date + time -->
        <div class="mb-4">
          <label class="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Custom time</label>
          <div class="flex gap-2">
            <div class="flex-1 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 hover:border-slate-600 transition-colors">
              <DatePicker
                :model-value="customDate"
                placeholder="Pick a date"
                :clearable="true"
                @update:model-value="customDate = $event; selectedDate = null"
              />
            </div>
            <input
              v-model="customTime"
              type="time"
              @input="selectedDate = null"
              class="w-28 bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button @click="close" class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="!finalDate || !note.trim() || saving"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {{ saving ? 'Setting…' : 'Set Reminder' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; initialNote?: string }>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  set: [data: { note: string; remindAt: string }]
}>()

const noteRef = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const note = ref('')
const selectedDate = ref<Date | null>(null)
const customDate = ref<string | null>(null)
const customTime = ref('')

const now = new Date()

const quickOptions = computed(() => [
  { label: 'In 20 min',  date: new Date(now.getTime() + 20 * 60_000) },
  { label: 'In 1 hour',  date: new Date(now.getTime() + 60 * 60_000) },
  { label: 'In 3 hours', date: new Date(now.getTime() + 3 * 3_600_000) },
  { label: 'Tomorrow',   date: (() => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d })() },
])

const finalDate = computed<Date | null>(() => {
  if (customDate.value) {
    const d = new Date(`${customDate.value}T${customTime.value || '09:00'}`)
    if (!isNaN(d.getTime()) && d > now) return d
  }
  return selectedDate.value
})

function formatPick(d: Date) {
  return d.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function close() { emit('update:modelValue', false) }

async function submit() {
  if (!finalDate.value || !note.value.trim() || saving.value) return
  saving.value = true
  try {
    emit('set', { note: note.value.trim(), remindAt: finalDate.value.toISOString() })
    close()
  } finally {
    saving.value = false
  }
}

watch(() => props.modelValue, (v) => {
  if (v) {
    note.value = props.initialNote ?? ''
    selectedDate.value = null
    customDate.value = null
    customTime.value = ''
    nextTick(() => noteRef.value?.focus())
  }
})
</script>
