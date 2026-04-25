<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <!-- Single mode -->
    <div v-if="!multiple" ref="containerRef" class="relative">
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
        <div v-if="singleValue" class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-xs font-medium text-indigo-300">
            {{ singleValue.label.charAt(0).toUpperCase() }}
          </div>
          <span class="text-white truncate">{{ singleValue.label }}</span>
          <span v-if="singleValue.description" class="text-gray-500 text-xs truncate">{{ singleValue.description }}</span>
        </div>
        <span v-else class="text-gray-400 flex-1">{{ placeholder }}</span>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button v-if="singleValue" type="button" class="p-0.5 text-gray-500 hover:text-gray-300 rounded" @click.stop="clearSingle">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div v-if="isOpen" v-bind="panelAttrs" @click.stop>
          <SearchPanel :loading="loading" :query="query" :results="results" :min-chars="minChars"
            :selected-ids="singleValue ? [singleValue.id] : []"
            @update:query="q => { query = q; onQueryChange() }"
            @select="selectSingle"
          />
        </div>
      </Teleport>
    </div>

    <!-- Multiple mode -->
    <div v-else ref="containerRef" class="relative">
      <div
        class="min-h-[38px] w-full flex flex-wrap items-center gap-1 px-2 py-1.5 bg-slate-700 border rounded-lg text-sm transition-colors cursor-pointer"
        :class="[
          error ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @click="!disabled && openPanel()"
      >
        <span
          v-for="item in multipleValues"
          :key="item.id"
          class="inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-md text-xs"
        >
          <span class="w-4 h-4 rounded-full bg-indigo-600/40 flex items-center justify-center text-[9px] font-medium">
            {{ item.label.charAt(0).toUpperCase() }}
          </span>
          {{ item.label }}
          <button type="button" class="hover:text-white" @click.stop="!disabled && removeMultiple(item.id)">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
        <span v-if="multipleValues.length === 0" class="text-gray-400 px-1">{{ placeholder }}</span>
        <span class="ml-auto">
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0" style="z-index:99998;" @click="isOpen = false" />
        <div v-if="isOpen" v-bind="panelAttrs" @click.stop>
          <SearchPanel :loading="loading" :query="query" :results="results" :min-chars="minChars"
            :selected-ids="multipleValues.map(v => v.id)"
            @update:query="q => { query = q; onQueryChange() }"
            @select="toggleMultiple"
          />
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface RelationshipItem {
  id: string | number
  label: string
  description?: string
  [key: string]: unknown
}

interface Props {
  modelValue: RelationshipItem | RelationshipItem[] | null
  fetchFn: (query: string) => Promise<RelationshipItem[]>
  multiple?: boolean
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minChars?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search and select...',
  multiple: false,
  minChars: 2,
})

const emit = defineEmits<{
  'update:modelValue': [value: RelationshipItem | RelationshipItem[] | null]
}>()

const _autoId = useId()
const uid = computed(() => props.id ?? _autoId)

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const results = ref<RelationshipItem[]>([])
const loading = ref(false)
const panelStyle = ref<Record<string, string>>({})
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const singleValue = computed(() =>
  !props.multiple && props.modelValue && !Array.isArray(props.modelValue) ? props.modelValue : null
)
const multipleValues = computed(() =>
  props.multiple && Array.isArray(props.modelValue) ? props.modelValue : []
)

const panelAttrs = computed(() => ({
  class: 'fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col',
  style: { ...panelStyle.value, zIndex: '99999' },
}))

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelW = rect.width
  const panelH = 300
  let top = rect.bottom + 4
  if (top + panelH > window.innerHeight - 8) top = rect.top - panelH - 4
  if (top < 8) top = 8
  let left = rect.left
  if (left + panelW > window.innerWidth - 16) left = window.innerWidth - panelW - 16
  if (left < 8) left = 8
  panelStyle.value = { top: `${top}px`, left: `${left}px`, width: `${panelW}px` }
}

function openPanel() {
  if (isOpen.value) { isOpen.value = false; return }
  computePosition()
  isOpen.value = true
  query.value = ''
  results.value = []
}

async function doFetch(q: string) {
  loading.value = true
  try { results.value = await props.fetchFn(q) }
  finally { loading.value = false }
}

function onQueryChange() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => doFetch(query.value), 300)
}

function selectSingle(item: RelationshipItem) {
  emit('update:modelValue', item)
  isOpen.value = false
}

function clearSingle() { emit('update:modelValue', null) }

function toggleMultiple(item: RelationshipItem) {
  const list = multipleValues.value
  const exists = list.some(v => v.id === item.id)
  emit('update:modelValue', exists ? list.filter(v => v.id !== item.id) : [...list, item])
}

function removeMultiple(id: string | number) {
  emit('update:modelValue', multipleValues.value.filter(v => v.id !== id))
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
