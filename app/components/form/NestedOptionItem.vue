<template>
  <li>
    <!-- Item row -->
    <div
      class="flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer transition-colors"
      :style="{ paddingLeft: `${12 + depth * 16}px` }"
      :class="selectedValue === option.value ? 'bg-indigo-600 text-white' : 'text-gray-200 hover:bg-slate-700'"
      @click="!hasChildren && emit('select', option.value)"
    >
      <!-- Expand / collapse toggle if has children -->
      <button
        v-if="hasChildren"
        type="button"
        class="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-transform"
        :class="{ 'rotate-90': expanded }"
        @click.stop="expanded = !expanded"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else class="w-4 flex-shrink-0" />

      <svg v-if="selectedValue === option.value" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span v-else-if="!hasChildren" class="w-4 flex-shrink-0" />

      <span @click="hasChildren ? (expanded = !expanded) : undefined">{{ option.label }}</span>
    </div>
    <!-- Recursive children -->
    <ul v-if="hasChildren && expanded">
      <NestedOptionItem
        v-for="child in option.children"
        :key="child.value"
        :option="child"
        :selected-value="selectedValue"
        :depth="depth + 1"
        @select="emit('select', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { NestedOption } from './FieldSelect2Nested.vue'

const props = defineProps<{
  option: NestedOption
  selectedValue: string | number | null
  depth: number
}>()

const emit = defineEmits<{
  select: [value: string | number]
}>()

const expanded = ref(false)
const hasChildren = computed(() => (props.option.children?.length ?? 0) > 0)
</script>
