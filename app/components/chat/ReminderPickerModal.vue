<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[9995] flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5 z-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white">Remind Me</h3>
          </div>
          <button @click="$emit('update:modelValue', false)" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Message snippet -->
        <div class="mb-4 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl">
          <p class="text-xs text-gray-400 mb-0.5">Message</p>
          <p class="text-sm text-gray-200 line-clamp-2">{{ messageContent || '(attachment)' }}</p>
        </div>

        <!-- Quick picks -->
        <p class="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Remind me in</p>
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
        <div class="mb-3">
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

        <!-- Optional note -->
        <div class="mb-4">
          <label class="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Note (optional)</label>
          <input
            v-model="note"
            type="text"
            placeholder="e.g. Follow up on this"
            maxlength="100"
            class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="$emit('update:modelValue', false)"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            :disabled="!finalDate || loading"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <span v-if="loading">Setting…</span>
            <span v-else>Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  messageId: string
  messageContent?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  set: [data: { remindAt: string; note?: string }]
}>()

const loading = ref(false)
const selectedDate = ref<Date | null>(null)
const customDate = ref<string | null>(null)
const customTime = ref('')
const note = ref('')

const now = new Date()

const quickOptions = computed(() => {
  return [
    { label: 'In 20 minutes', date: new Date(now.getTime() + 20 * 60_000) },
    { label: 'In 1 hour',     date: new Date(now.getTime() + 60 * 60_000) },
    { label: 'In 3 hours',    date: new Date(now.getTime() + 3 * 3600_000) },
    { label: 'Tomorrow',      date: (() => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d })() },
  ]
})

const finalDate = computed<Date | null>(() => {
  if (customDate.value) {
    const time = customTime.value || '09:00'
    const d = new Date(`${customDate.value}T${time}`)
    if (!isNaN(d.getTime()) && d > now) return d
  }
  return selectedDate.value
})

function formatPick(date: Date) {
  return date.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function confirm() {
  if (!finalDate.value) return
  emit('set', { remindAt: finalDate.value.toISOString(), note: note.value || undefined })
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (v) => {
  if (v) {
    selectedDate.value = null
    customDate.value = null
    customTime.value = ''
    note.value = ''
  }
})
</script>
