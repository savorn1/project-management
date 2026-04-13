<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div>
      <!-- Drop zone / selected file display -->
      <div
        class="relative flex items-center justify-between gap-3 px-4 py-3 bg-slate-700 border-2 border-dashed rounded-lg transition-colors"
        :class="[
          isDragging && dragCount > 0 ? 'border-indigo-500 bg-indigo-500/10' : error ? 'border-rose-500/60' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
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
          class="sr-only"
          :accept="accept"
          :disabled="disabled"
          @change="onFileChange"
        />

        <div v-if="!modelValue" class="flex items-center gap-3 text-gray-400">
          <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <p class="text-sm font-medium text-gray-300">
              <span class="text-indigo-400">Choose a file</span> or drag & drop
            </p>
            <p v-if="accept" class="text-xs text-gray-500 mt-0.5">{{ accept }}</p>
            <p v-if="maxSize" class="text-xs text-gray-500">Max {{ formatBytes(maxSize) }}</p>
          </div>
        </div>

        <!-- Selected file info -->
        <div v-else class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 flex items-center justify-center bg-slate-600 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ modelValue.name }}</p>
            <p class="text-xs text-gray-400">{{ formatBytes(modelValue.size) }}</p>
          </div>
        </div>

        <button
          v-if="modelValue"
          type="button"
          class="flex-shrink-0 p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
          @click.stop="emit('update:modelValue', null)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Size error -->
      <p v-if="sizeError" class="mt-1.5 text-xs text-rose-400">{{ sizeError }}</p>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: File | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  accept?: string
  /** Max file size in bytes */
  maxSize?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const dragCount = ref(0)
const sizeError = ref('')

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleFile(file: File) {
  sizeError.value = ''
  if (props.maxSize && file.size > props.maxSize) {
    sizeError.value = `File exceeds maximum size of ${formatBytes(props.maxSize)}`
    return
  }
  emit('update:modelValue', file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  dragCount.value = 0
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}
</script>
