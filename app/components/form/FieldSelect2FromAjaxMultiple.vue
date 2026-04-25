<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :input-id="uid">
    <div ref="containerRef" class="relative">
      <!-- Trigger -->
      <div
        :id="uid"
        class="min-h-[38px] w-full flex flex-wrap items-center gap-1 px-2 py-1.5 bg-slate-700 border rounded-lg text-sm transition-colors cursor-pointer"
        :class="[
          error ? 'border-rose-500' : isOpen ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @click="!disabled && openPanel()"
      >
        <span
          v-for="item in modelValue"
          :key="item.value"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-md text-xs"
        >
          {{ item.label }}
          <button type="button" class="hover:text-white transition-colors" @click.stop="!disabled && remove(item.value)">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
        <span v-if="modelValue.length === 0" class="text-gray-400 px-1">{{ placeholder }}</span>
        <span class="ml-auto flex-shrink-0">
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

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
              :placeholder="`Type at least ${minChars} chars to search...`"
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
            <li v-if="query.length < minChars" class="px-3 py-3 text-sm text-gray-500 text-center">Type to search...</li>
            <li v-else-if="loading" class="px-3 py-3 text-sm text-gray-500 text-center">Searching...</li>
            <li v-else-if="results.length === 0" class="px-3 py-3 text-sm text-gray-500 text-center">No results found</li>
            <li
              v-for="opt in results"
              :key="opt.value"
              class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors"
              :class="isSelected(opt.value) ? 'text-indigo-300 bg-indigo-600/20' : 'text-gray-200 hover:bg-slate-700'"
              @click="toggle2(opt)"
            >
              <div class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                :class="isSelected(opt.value) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'">
                <svg v-if="isSelected(opt.value)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {{ opt.label }}
            </li>
          </ul>
          <div v-if="modelValue.length > 0" class="px-3 py-2 border-t border-slate-700/60 flex justify-between text-xs">
            <span class="text-gray-400">{{ modelValue.length }} selected</span>
            <button type="button" class="text-indigo-400 hover:text-indigo-300" @click="emit('update:modelValue', [])">Clear all</button>
          </div>
        </div>
      </Teleport>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
import type { AjaxOption } from './FieldSelect2FromAjax.vue'

interface Props {
  modelValue: AjaxOption[]
  fetchFn: (query: string) => Promise<AjaxOption[]>
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minChars?: number
  debounce?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Search and select...',
  minChars: 2,
  debounce: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: AjaxOption[]]
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

function isSelected(val: string | number) {
  return props.modelValue.some(o => o.value === val)
}

async function doFetch(q: string) {
  if (q.length < props.minChars) { results.value = []; return }
  loading.value = true
  try { results.value = await props.fetchFn(q) }
  finally { loading.value = false }
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => doFetch(query.value), props.debounce)
}

function toggle2(opt: AjaxOption) {
  const next = isSelected(opt.value)
    ? props.modelValue.filter(o => o.value !== opt.value)
    : [...props.modelValue, opt]
  emit('update:modelValue', next)
}

function remove(val: string | number) {
  emit('update:modelValue', props.modelValue.filter(o => o.value !== val))
}

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelW = rect.width
  const panelH = 320
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
  nextTick(() => searchRef.value?.focus())
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
