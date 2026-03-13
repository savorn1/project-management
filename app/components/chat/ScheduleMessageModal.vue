<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[9995] flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-5 z-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white">Schedule Message</h3>
          </div>
          <button @click="$emit('update:modelValue', false)" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Message preview -->
        <div class="mb-4 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl">
          <p class="text-xs text-gray-400 mb-0.5">Message</p>
          <p class="text-sm text-gray-200 line-clamp-2">{{ content }}</p>
        </div>

        <!-- Quick picks -->
        <p class="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Send at</p>
        <div class="grid grid-cols-2 gap-1.5 mb-3">
          <button
            v-for="opt in quickOptions"
            :key="opt.label"
            @click="selectQuick(opt.date)"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left',
              selectedDate === opt.date
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            ]"
          >
            <span class="block font-semibold">{{ opt.label }}</span>
            <span class="block text-[10px] opacity-60">{{ formatPick(opt.date) }}</span>
          </button>
        </div>

        <!-- Custom date/time -->
        <div class="mb-4">
          <label class="block text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Custom date & time</label>
          <input
            v-model="customDatetime"
            type="datetime-local"
            :min="minDatetime"
            class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
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
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <span v-if="loading">Scheduling…</span>
            <span v-else>Schedule</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  content: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  schedule: [isoDate: string]
}>()

const loading = ref(false)
const selectedDate = ref<Date | null>(null)
const customDatetime = ref('')

const now = new Date()

const quickOptions = computed(() => {
  const opts = []
  // In 1 hour
  const in1h = new Date(now.getTime() + 60 * 60 * 1000)
  opts.push({ label: 'In 1 hour', date: in1h })
  // In 3 hours
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  opts.push({ label: 'In 3 hours', date: in3h })
  // Tomorrow 9am
  const tom = new Date(now)
  tom.setDate(tom.getDate() + 1)
  tom.setHours(9, 0, 0, 0)
  opts.push({ label: 'Tomorrow 9am', date: tom })
  // Monday 9am
  const mon = new Date(now)
  const daysUntilMon = (8 - mon.getDay()) % 7 || 7
  mon.setDate(mon.getDate() + daysUntilMon)
  mon.setHours(9, 0, 0, 0)
  opts.push({ label: 'Monday 9am', date: mon })
  return opts
})

const minDatetime = computed(() => {
  const d = new Date(now.getTime() + 60_000)
  return d.toISOString().slice(0, 16)
})

const finalDate = computed<Date | null>(() => {
  if (customDatetime.value) {
    const d = new Date(customDatetime.value)
    if (!isNaN(d.getTime()) && d > now) return d
  }
  return selectedDate.value
})

function selectQuick(date: Date) {
  selectedDate.value = date
  customDatetime.value = ''
}

function formatPick(date: Date) {
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function confirm() {
  if (!finalDate.value) return
  emit('schedule', finalDate.value.toISOString())
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (v) => {
  if (v) {
    selectedDate.value = null
    customDatetime.value = ''
  }
})
</script>
