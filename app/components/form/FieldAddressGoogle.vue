<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div ref="containerRef" class="relative">
      <!-- Input -->
      <div class="relative">
        <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="w-full pl-10 pr-10 py-2 bg-slate-700 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none transition-colors"
          :class="[
            error ? 'border-rose-500' : isFocused ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-500',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :placeholder="placeholder"
          :disabled="disabled"
          autocomplete="off"
          @focus="isFocused = true; if (query.length >= minChars) openDropdown()"
          @blur="isFocused = false; scheduleClose()"
          @input="onInput"
          @keydown="onKeydown2"
        />
        <div v-if="loading" class="absolute inset-y-0 right-3 flex items-center">
          <svg class="w-4 h-4 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <button
          v-else-if="modelValue"
          type="button"
          class="absolute inset-y-0 right-2 flex items-center px-1 text-gray-500 hover:text-gray-300 transition-colors"
          @mousedown.prevent="clear"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Suggestions dropdown -->
      <Teleport to="body">
        <div
          v-if="isOpen && suggestions.length > 0"
          class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          style="z-index:99999;"
          :style="panelStyle"
          @mousedown.prevent
        >
          <ul>
            <li
              v-for="(s, idx) in suggestions"
              :key="s.placeId"
              class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="highlightIdx === idx ? 'bg-indigo-600' : 'hover:bg-slate-700'"
              @click="selectSuggestion(s)"
            >
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" :class="highlightIdx === idx ? 'text-white' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <p class="text-sm" :class="highlightIdx === idx ? 'text-white' : 'text-gray-200'">
                  {{ s.mainText }}
                </p>
                <p class="text-xs" :class="highlightIdx === idx ? 'text-indigo-200' : 'text-gray-500'">
                  {{ s.secondaryText }}
                </p>
              </div>
            </li>
          </ul>
          <!-- Powered by Google attribution -->
          <div class="px-4 py-1.5 border-t border-slate-700/60 flex justify-end">
            <span class="text-xs text-gray-600">Powered by Google</span>
          </div>
        </div>
      </Teleport>

      <!-- Selected address info -->
      <div v-if="modelValue" class="mt-1.5 flex flex-wrap gap-3">
        <div v-if="modelValue.lat" class="flex items-center gap-1 text-xs text-gray-500">
          <span class="text-gray-600">Lat:</span>
          <span class="text-gray-400">{{ modelValue.lat.toFixed(6) }}</span>
        </div>
        <div v-if="modelValue.lng" class="flex items-center gap-1 text-xs text-gray-500">
          <span class="text-gray-600">Lng:</span>
          <span class="text-gray-400">{{ modelValue.lng.toFixed(6) }}</span>
        </div>
        <div v-if="modelValue.placeId" class="flex items-center gap-1 text-xs text-gray-500">
          <span class="text-gray-600">Place ID:</span>
          <span class="text-gray-400 font-mono">{{ modelValue.placeId }}</span>
        </div>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface AddressValue {
  address: string
  lat?: number
  lng?: number
  placeId?: string
  components?: Record<string, string>
}

interface Suggestion {
  placeId: string
  mainText: string
  secondaryText: string
  description: string
}

interface Props {
  modelValue: AddressValue | null
  /** Google Maps JavaScript API key */
  apiKey?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Country restriction (e.g. 'us', 'kh') */
  country?: string
  minChars?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search address...',
  minChars: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: AddressValue | null]
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref(props.modelValue?.address ?? '')
const isFocused = ref(false)
const isOpen = ref(false)
const loading = ref(false)
const suggestions = ref<Suggestion[]>([])
const highlightIdx = ref(-1)
const panelStyle = ref<Record<string, string>>({})
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let autocompleteService: any = null
let placesService: any = null

watch(() => props.modelValue, (val) => {
  query.value = val?.address ?? ''
})

function scheduleClose() {
  setTimeout(() => { isOpen.value = false }, 200)
}

function openDropdown() {
  computePosition()
  isOpen.value = true
}

function computePosition() {
  if (!inputRef.value) return
  const rect = inputRef.value.getBoundingClientRect()
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

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchSuggestions, 300)
}

async function fetchSuggestions() {
  if (query.value.length < props.minChars) { suggestions.value = []; isOpen.value = false; return }

  // Use Google Places Autocomplete if available
  if (import.meta.client && (window as any).google?.maps?.places) {
    if (!autocompleteService) {
      autocompleteService = new (window as any).google.maps.places.AutocompleteService()
    }
    loading.value = true
    computePosition()
    try {
      autocompleteService.getPlacePredictions(
        { input: query.value, componentRestrictions: props.country ? { country: props.country } : undefined },
        (predictions: any[], status: string) => {
          loading.value = false
          if (status === 'OK' && predictions) {
            suggestions.value = predictions.map((p: any) => ({
              placeId: p.place_id,
              mainText: p.structured_formatting.main_text,
              secondaryText: p.structured_formatting.secondary_text,
              description: p.description,
            }))
            isOpen.value = true
          }
        }
      )
    } catch { loading.value = false }
    return
  }

  // Fallback: no API key / Google not loaded
  suggestions.value = []
  isOpen.value = false
}

function selectSuggestion(s: Suggestion) {
  query.value = s.description
  isOpen.value = false
  highlightIdx.value = -1

  // If Google Maps is available, get place details
  if (import.meta.client && (window as any).google?.maps?.places) {
    if (!placesService) {
      const div = document.createElement('div')
      placesService = new (window as any).google.maps.places.PlacesService(div)
    }
    placesService.getDetails(
      { placeId: s.placeId, fields: ['geometry', 'address_components', 'formatted_address'] },
      (place: any, status: string) => {
        if (status === 'OK') {
          const components: Record<string, string> = {}
          place.address_components?.forEach((c: any) => {
            c.types.forEach((t: string) => { components[t] = c.long_name })
          })
          emit('update:modelValue', {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: s.placeId,
            components,
          })
        }
      }
    )
    return
  }

  emit('update:modelValue', { address: s.description, placeId: s.placeId })
}

function clear() {
  query.value = ''
  suggestions.value = []
  isOpen.value = false
  emit('update:modelValue', null)
  inputRef.value?.focus()
}

function onKeydown2(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightIdx.value = Math.min(highlightIdx.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightIdx.value = Math.max(highlightIdx.value - 1, -1)
  } else if (e.key === 'Enter' && highlightIdx.value >= 0) {
    e.preventDefault()
    const s = suggestions.value[highlightIdx.value]
    if (s) selectSuggestion(s)
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  // Load Google Maps if apiKey is provided and not yet loaded
  if (props.apiKey && import.meta.client && !(window as any).google?.maps) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places`
    script.async = true
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
