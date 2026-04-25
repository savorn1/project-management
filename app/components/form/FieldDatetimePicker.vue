<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <div class="flex gap-2">
      <!-- Date part -->
      <div
        class="flex-1 flex items-center px-3 py-2 bg-slate-700 border rounded-lg transition-colors"
        :class="[
          error ? 'border-rose-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : '',
        ]"
      >
        <DatePicker
          :model-value="datePart"
          placeholder="Select date"
          :clearable="true"
          trigger-class="flex-1"
          @update:model-value="onDateChange"
        />
      </div>

      <!-- Time part -->
      <div class="relative flex-shrink-0 w-36">
        <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <input
          :id="uid"
          v-model="timePart"
          type="time"
          class="w-full pl-9 pr-3 py-2 bg-slate-700 border rounded-lg text-sm text-white focus:outline-none transition-colors appearance-none"
          :class="[
            error ? 'border-rose-500' : 'border-slate-600 focus:border-indigo-500',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :disabled="disabled"
          @change="onTimeChange"
        />
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** ISO datetime string (e.g. "2024-03-15T14:30") or null */
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

const props = defineProps<Props>()

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const datePart = computed(() => props.modelValue?.split('T')[0] ?? null)
const timePart = ref(props.modelValue?.split('T')[1]?.substring(0, 5) ?? '00:00')

watch(() => props.modelValue, (val) => {
  timePart.value = val?.split('T')[1]?.substring(0, 5) ?? '00:00'
})

function emit2(date: string | null, time: string) {
  if (!date) { emit('update:modelValue', null); return }
  emit('update:modelValue', `${date}T${time}`)
}

function onDateChange(date: string | null) {
  emit2(date, timePart.value)
}

function onTimeChange() {
  emit2(datePart.value, timePart.value)
}
</script>

<style scoped>
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
}
</style>
