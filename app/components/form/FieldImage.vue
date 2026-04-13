<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div>
      <!-- Preview or upload zone -->
      <div
        class="relative overflow-hidden rounded-lg border-2 border-dashed transition-colors"
        :class="[
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : error ? 'border-rose-500/60' : previewSrc ? 'border-slate-600' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
        ]"
        :style="{ height: `${height}px` }"
        @click="!previewSrc && inputRef?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="inputRef"
          type="file"
          class="sr-only"
          accept="image/*"
          :disabled="disabled"
          @change="onFileChange"
        />

        <!-- Image preview -->
        <img
          v-if="previewSrc"
          :src="previewSrc"
          class="w-full h-full object-cover"
          alt="Preview"
        />

        <!-- Upload placeholder -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium">
            <span class="text-indigo-400">Upload image</span> or drag & drop
          </p>
          <p class="text-xs text-gray-600">PNG, JPG, GIF, WEBP</p>
        </div>

        <!-- Overlay actions on hover when image is set -->
        <div
          v-if="previewSrc"
          class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
        >
          <button
            type="button"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-lg transition-colors"
            @click.stop="inputRef?.click()"
          >
            Change
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-sm rounded-lg transition-colors"
            @click.stop="clear"
          >
            Remove
          </button>
        </div>
      </div>

      <p v-if="sizeError" class="mt-1.5 text-xs text-rose-400">{{ sizeError }}</p>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** File object or a URL string (for existing images) */
  modelValue: File | string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  height?: number
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 200,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | string | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const sizeError = ref('')
const objectUrl = ref<string | null>(null)

const previewSrc = computed(() => {
  if (!props.modelValue) return null
  if (typeof props.modelValue === 'string') return props.modelValue
  return objectUrl.value
})

watch(() => props.modelValue, (val) => {
  if (objectUrl.value) { URL.revokeObjectURL(objectUrl.value); objectUrl.value = null }
  if (val instanceof File) objectUrl.value = URL.createObjectURL(val)
}, { immediate: true })

onUnmounted(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleFile(file: File) {
  sizeError.value = ''
  if (props.maxSize && file.size > props.maxSize) {
    sizeError.value = `Image exceeds maximum size of ${formatBytes(props.maxSize)}`
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
  if (file?.type.startsWith('image/')) handleFile(file)
}

function clear() {
  emit('update:modelValue', null)
  if (inputRef.value) inputRef.value.value = ''
}
</script>
