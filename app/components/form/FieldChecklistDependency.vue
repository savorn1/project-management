<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required" :tooltip="tooltip">
    <div
      class="bg-slate-700 border rounded-lg overflow-hidden transition-colors divide-y divide-slate-600/40"
      :class="error ? 'border-rose-500' : 'border-slate-600'"
    >
      <div v-for="parent in options" :key="parent.value">
        <!-- Parent row -->
        <div
          class="flex items-center gap-3 px-3 py-2.5 transition-colors"
          :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-600/40'"
          @click="!disabled && toggleParent(parent.value)"
        >
          <div
            class="w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors"
            :class="isChecked(parent.value) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'"
          >
            <svg v-if="isChecked(parent.value)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="flex-1 text-sm font-medium text-gray-200">{{ parent.label }}</span>
          <div v-if="parent.children?.length" class="flex items-center gap-2">
            <span class="text-xs text-gray-500 tabular-nums">
              {{ checkedChildCount(parent) }}/{{ parent.children.length }}
            </span>
            <button
              v-if="isChecked(parent.value)"
              type="button"
              class="p-0.5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              @click.stop="toggleExpand(parent.value)"
            >
              <svg
                class="w-3.5 h-3.5 transition-transform"
                :class="expanded.has(parent.value) ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Children (shown only when parent is checked + expanded) -->
        <Transition name="expand">
          <div
            v-if="parent.children?.length && isChecked(parent.value) && expanded.has(parent.value)"
            class="bg-slate-800/30 border-t border-slate-600/40"
          >
            <div
              v-for="child in parent.children"
              :key="child.value"
              class="flex items-center gap-3 pl-9 pr-3 py-2 transition-colors border-b border-slate-600/20 last:border-0"
              :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700/40'"
              @click="!disabled && toggleChild(child.value)"
            >
              <div
                class="w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors"
                :class="isChecked(child.value) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'"
              >
                <svg v-if="isChecked(child.value)" class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm text-gray-300">{{ child.label }}</span>
              <span v-if="child.description" class="ml-auto text-xs text-gray-500">{{ child.description }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
export interface DependencyItem {
  value: string | number
  label: string
  description?: string
  children?: DependencyItem[]
}

interface Props {
  modelValue: (string | number)[]
  options: DependencyItem[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const expanded = ref(new Set<string | number>())

function isChecked(v: string | number) {
  return props.modelValue.includes(v)
}

function checkedChildCount(parent: DependencyItem) {
  return parent.children?.filter(c => isChecked(c.value)).length ?? 0
}

function toggleParent(v: string | number) {
  const parent = props.options.find(p => p.value === v)!
  let next = [...props.modelValue]
  if (isChecked(v)) {
    // Uncheck parent and all its children
    const toRemove = new Set<string | number>([v, ...(parent.children?.map(c => c.value) ?? [])])
    next = next.filter(x => !toRemove.has(x))
    expanded.value.delete(v)
  } else {
    next.push(v)
    if (parent.children?.length) expanded.value.add(v)
  }
  emit('update:modelValue', next)
}

function toggleChild(v: string | number) {
  const next = isChecked(v)
    ? props.modelValue.filter(x => x !== v)
    : [...props.modelValue, v]
  emit('update:modelValue', next)
}

function toggleExpand(v: string | number) {
  if (expanded.value.has(v)) expanded.value.delete(v)
  else expanded.value.add(v)
}
</script>

<style scoped>
.expand-enter-active, .expand-leave-active { transition: all .2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 500px; }
</style>
