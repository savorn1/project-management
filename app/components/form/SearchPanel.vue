<template>
  <div>
    <div class="p-2 border-b border-slate-700/60 relative">
      <input
        ref="inputRef"
        :value="query"
        type="text"
        class="w-full px-3 py-1.5 pr-8 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        :placeholder="`Type ${minChars}+ chars to search...`"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
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
        v-for="item in results"
        :key="item.id"
        class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
        :class="isSelected(item.id) ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-200 hover:bg-slate-700'"
        @click="emit('select', item)"
      >
        <div class="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-gray-300 flex-shrink-0">
          {{ item.label.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">{{ item.label }}</p>
          <p v-if="item.description" class="text-xs text-gray-500 truncate">{{ item.description }}</p>
        </div>
        <svg v-if="isSelected(item.id)" class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { RelationshipItem } from './FieldRelationship.vue'

const props = defineProps<{
  query: string
  results: RelationshipItem[]
  loading: boolean
  minChars: number
  selectedIds: (string | number)[]
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'select': [item: RelationshipItem]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function isSelected(id: string | number) {
  return props.selectedIds.includes(id)
}

onMounted(() => nextTick(() => inputRef.value?.focus()))
</script>
