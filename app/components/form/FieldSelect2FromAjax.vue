<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <div ref="containerRef" class="relative">
      <button
        :id="uid"
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-700 border rounded-lg text-sm transition-colors focus:outline-none"
        :class="[
          error ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        :disabled="disabled"
        @click="openPanel"
      >
        <span :class="modelValue ? 'text-white' : 'text-gray-400'">
          {{ modelValue?.label || placeholder }}
        </span>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button v-if="clearable && modelValue" type="button" class="p-0.5 text-gray-500 hover:text-gray-300 rounded" @click.stop="emit('update:modelValue', null)">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div
          v-if="isOpen"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
          style="z-index:99999;"
          :style="panelStyle"
          @click.stop
        >
          <div class="p-2 border-b border-slate-700/60 relative">
            <input
              ref="searchRef"
              v-model="query"
              type="text"
              class="w-full px-3 py-1.5 pr-8 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              :placeholder="`Type at least ${minChars} character${minChars > 1 ? 's' : ''} to search...`"
              @input="onInput"
            />
            <div v-if="loading" class="absolute right-4 top-1/2 -translate-y-1/2">
              <svg class="w-4 h-4 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          </div>
          <ul class="overflow-y-auto max-h-52 py-1">
            <li v-if="query.length < minChars" class="px-3 py-3 text-sm text-gray-500 text-center">
              Type to search...
            </li>
            <li v-else-if="loading" class="px-3 py-3 text-sm text-gray-500 text-center">Searching...</li>
            <li v-else-if="results.length === 0" class="px-3 py-3 text-sm text-gray-500 text-center">No results found</li>
            <li
              v-for="opt in results"
              :key="opt.value"
              class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors"
              :class="modelValue?.value === opt.value ? 'bg-indigo-600 text-white' : 'text-gray-200 hover:bg-slate-700'"
              @click="select(opt)"
            >
              <svg v-if="modelValue?.value === opt.value" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="w-4 flex-shrink-0" />
              {{ opt.label }}
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface AjaxOption {
  value: string | number
  label: string
  [key: string]: unknown
}

interface Props {
  modelValue: AjaxOption | null
  /** Async function that receives a query string and returns matching options */
  fetchFn: (query: string) => Promise<AjaxOption[]>
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  /** Minimum characters before triggering a search */
  minChars?: number
  /** Debounce delay in ms */
  debounce?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  clearable: true,
  minChars: 2,
  debounce: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: AjaxOption | null]
}>()

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const containerRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const results = ref<AjaxOption[]>([])
const loading = ref(false)
const panelStyle = ref<Record<string, string>>({})
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function doFetch(q: string) {
  if (q.length < props.minChars) { results.value = []; return }
  loading.value = true
  try {
    results.value = await props.fetchFn(q)
  } finally {
    loading.value = false
  }
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => doFetch(query.value), props.debounce)
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelW = rect.width
  const panelH = 280
  let top = rect.bottom + 4
  if (top + panelH > window.innerHeight - 8) top = rect.top - panelH - 4
  if (top < 8) top = 8
  let left = rect.left
  if (left + panelW > window.innerWidth - 16) left = window.innerWidth - panelW - 16
  if (left < 8) left = 8
  panelStyle.value = { top: `${top}px`, left: `${left}px`, width: `${panelW}px` }
}

function openPanel() {
  if (props.disabled) return
  if (isOpen.value) { isOpen.value = false; return }
  computePosition()
  isOpen.value = true
  query.value = ''
  results.value = []
  nextTick(() => searchRef.value?.focus())
}

function select(opt: AjaxOption) {
  emit('update:modelValue', opt)
  isOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) isOpen.value = false
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
