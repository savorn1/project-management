<template>
  <div v-if="addr" class="text-sm leading-snug">
    <div v-if="addr.street" class="text-gray-200">{{ addr.street }}</div>
    <div v-if="cityLine" class="text-gray-400 text-xs mt-0.5">{{ cityLine }}</div>
    <div v-if="addr.country" class="text-gray-500 text-xs">{{ addr.country }}</div>
    <a
      v-if="mapsUrl"
      :href="mapsUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-0.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors mt-1"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      View on map
    </a>
  </div>
  <span v-else class="text-gray-600 text-sm">—</span>
</template>

<script setup lang="ts">
interface AddressData {
  street?:  string
  city?:    string
  state?:   string
  zip?:     string
  country?: string
  lat?:     number | string
  lng?:     number | string
}

interface Props {
  /** JSON string or object with address fields */
  value: string | AddressData | null | undefined
}

const props = defineProps<Props>()

const addr = computed<AddressData | null>(() => {
  if (!props.value) return null
  if (typeof props.value === 'object') return props.value
  try { return JSON.parse(String(props.value)) } catch { return null }
})

const cityLine = computed(() => {
  if (!addr.value) return null
  return [addr.value.city, addr.value.state, addr.value.zip].filter(Boolean).join(', ') || null
})

const mapsUrl = computed(() => {
  if (!addr.value) return null
  const { lat, lng, street, city, country } = addr.value
  if (lat && lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }
  const query = [street, city, country].filter(Boolean).join(', ')
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null
})
</script>
