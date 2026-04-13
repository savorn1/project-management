<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div>
      <!-- Preview / upload zone -->
      <div
        class="relative overflow-hidden rounded-lg border-2 border-dashed bg-slate-800 transition-colors"
        :class="[
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : error ? 'border-rose-500/60' : previewSrc ? 'border-slate-700' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : '',
        ]"
        :style="{ minHeight: '180px' }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="inputRef"
          type="file"
          class="sr-only"
          accept="video/*"
          :disabled="disabled"
          @change="onFileChange"
        />

        <!-- Video player -->
        <video
          v-if="previewSrc"
          :src="previewSrc"
          controls
          class="w-full rounded-lg"
          :style="{ maxHeight: '320px' }"
        />

        <!-- Upload placeholder -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
          @click="inputRef?.click()"
        >
          <div class="w-16 h-16 flex items-center justify-center bg-slate-700 rounded-full">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-gray-300">
              <span class="text-indigo-400">Upload video</span> or drag & drop
            </p>
            <p class="text-xs text-gray-500 mt-1">MP4, MOV, AVI, WEBM</p>
            <p v-if="maxSize" class="text-xs text-gray-600">Max {{ formatBytes(maxSize) }}</p>
          </div>
        </div>
      </div>

      <!-- File info + actions -->
      <div v-if="previewSrc" class="mt-2 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-gray-300">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="truncate max-w-[200px]">
            {{ fileInfo?.name ?? 'Video file' }}
          </span>
          <span v-if="fileInfo" class="text-xs text-gray-500">
            {{ formatBytes(fileInfo.size) }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            @click="inputRef?.click()"
          >Change</button>
          <button
            type="button"
            class="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            @click="clear"
          >Remove</button>
        </div>
      </div>

      <p v-if="sizeError" class="mt-1.5 text-xs text-rose-400">{{ sizeError }}</p>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  modelValue: File | string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  maxSize?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: File | string | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const sizeError = ref('')
const objectUrl = ref<string | null>(null)

const fileInfo = computed(() => props.modelValue instanceof File ? props.modelValue : null)

const previewSrc = computed(() => {
  if (!props.modelValue) return null
  if (typeof props.modelValue === 'string') return props.modelValue
  return objectUrl.value
})

watch(() => props.modelValue, (val) => {
  if (objectUrl.value) { URL.revokeObjectURL(objectUrl.value); objectUrl.value = null }
  if (val instanceof File) objectUrl.value = URL.createObjectURL(val)
}, { immediate: true })

onUnmounted(() => { if (objectUrl.value) URL.revokeObjectURL(objectUrl.value) })

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleFile(file: File) {
  sizeError.value = ''
  if (props.maxSize && file.size > props.maxSize) {
    sizeError.value = `Video exceeds max size of ${formatBytes(props.maxSize)}`
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
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('video/')) handleFile(file)
}

function clear() {
  emit('update:modelValue', null)
  if (inputRef.value) inputRef.value.value = ''
}
</script>
