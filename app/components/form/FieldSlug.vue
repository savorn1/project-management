<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <div class="relative">
      <!-- Lock / unlock toggle -->
      <div class="absolute inset-y-0 left-0 flex items-center pl-3">
        <button
          type="button"
          :title="locked ? 'Click to edit manually' : 'Click to lock'"
          class="text-gray-500 hover:text-gray-300 transition-colors"
          @click="locked = !locked"
        >
          <svg v-if="locked" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <input
        :id="uid"
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="locked"
        class="w-full pl-9 pr-20 py-2 bg-slate-700 border rounded-lg text-sm font-mono transition-colors focus:outline-none"
        :class="[
          error    ? 'border-rose-500 focus:border-rose-500'       : 'border-slate-600 focus:border-indigo-500',
          locked   ? 'text-gray-400 cursor-default select-all'     : 'text-indigo-300 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed'               : '',
        ]"
        @input="onManualInput(($event.target as HTMLInputElement).value)"
      />

      <!-- Regenerate button -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        <button
          v-if="sourceValue"
          type="button"
          title="Re-generate from source"
          class="px-2 py-1 text-xs text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
          @click="regenerate"
        >
          ↺ sync
        </button>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="modelValue && baseUrl" class="mt-1.5 flex items-center gap-1 text-xs text-gray-500 truncate">
      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.657-5.656l-1.1 1.1" />
      </svg>
      <span class="truncate">{{ baseUrl }}<span class="text-indigo-400">{{ modelValue }}</span></span>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  /** The source string to auto-generate the slug from (e.g. a title field) */
  sourceValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** URL prefix shown in the preview bar */
  baseUrl?: string
  /** Custom slug transformer; defaults to lowercase-hyphen */
  transform?: (raw: string) => string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'url-slug',
})

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const locked = ref(true)

function slugify(str: string): string {
  if (props.transform) return props.transform(str)
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

// Auto-sync when sourceValue changes and not manually unlocked
watch(() => props.sourceValue, (val) => {
  if (locked.value && val !== undefined) {
    emit('update:modelValue', slugify(val))
  }
})

// If modelValue starts empty and source is provided — initialise
onMounted(() => {
  if (!props.modelValue && props.sourceValue) {
    emit('update:modelValue', slugify(props.sourceValue))
  }
})

function onManualInput(val: string) {
  emit('update:modelValue', slugify(val))
}

function regenerate() {
  if (props.sourceValue !== undefined) {
    emit('update:modelValue', slugify(props.sourceValue))
  }
}
</script>
