<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div>
      <!-- Drop zone -->
      <div
        class="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-slate-700 border-2 border-dashed rounded-lg transition-colors cursor-pointer"
        :class="[
          isDragging && dragCount > 0 ? 'border-indigo-500 bg-indigo-500/10' : error ? 'border-rose-500/60' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : '',
        ]"
        @click="inputRef?.click()"
        @dragenter.prevent="dragCount++"
        @dragover.prevent
        @dragleave.prevent="if (--dragCount <= 0) { dragCount = 0; isDragging = false }"
        @drop.prevent="onDrop"
      >
        <input
          ref="inputRef"
          type="file"
          multiple
          class="sr-only"
          :accept="accept"
          :disabled="disabled"
          @change="onFilesChange"
        />
        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-300">
            <span class="text-indigo-400">Choose files</span> or drag & drop
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            <span v-if="accept">{{ accept }} · </span>
            <span v-if="maxFiles">Up to {{ maxFiles }} files</span>
            <span v-if="maxSize"> · Max {{ formatBytes(maxSize) }} each</span>
          </p>
        </div>
      </div>

      <!-- File list -->
      <ul v-if="modelValue.length > 0" class="mt-2 space-y-1.5">
        <li
          v-for="(file, idx) in modelValue"
          :key="idx"
          class="flex items-center gap-3 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg"
        >
          <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-400">{{ formatBytes(file.size) }}</p>
          </div>
          <button
            type="button"
            class="flex-shrink-0 p-1 text-gray-500 hover:text-rose-400 transition-colors rounded"
            @click="removeFile(idx)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>

      <p v-if="sizeErrors.length > 0" class="mt-1.5 text-xs text-rose-400">{{ sizeErrors.join(' · ') }}</p>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: File[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: File[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const dragCount = ref(0)
const sizeErrors = ref<string[]>([])

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function addFiles(files: File[]) {
  sizeErrors.value = []
  const valid: File[] = []
  for (const file of files) {
    if (props.maxSize && file.size > props.maxSize) {
      sizeErrors.value.push(`${file.name} exceeds ${formatBytes(props.maxSize)}`)
      continue
    }
    valid.push(file)
  }
  const next = [...props.modelValue, ...valid]
  if (props.maxFiles && next.length > props.maxFiles) {
    emit('update:modelValue', next.slice(0, props.maxFiles))
  } else {
    emit('update:modelValue', next)
  }
}

function onFilesChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  addFiles(files)
  if (inputRef.value) inputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  dragCount.value = 0
  addFiles(Array.from(e.dataTransfer?.files ?? []))
}

function removeFile(idx: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}
</script>
