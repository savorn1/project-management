<template>
  <FieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div>
      <div
        class="relative overflow-hidden rounded-lg border-2 border-dashed transition-colors"
        :class="[
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : error ? 'border-rose-500/60' : modelValue ? 'border-slate-600' : 'border-slate-600 hover:border-slate-500',
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
        ]"
        :style="{ height: `${height}px` }"
        @click="!modelValue && inputRef?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
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

        <img v-if="modelValue" :src="modelValue" class="w-full h-full object-cover" alt="Preview" />

        <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium">
            <span class="text-indigo-400">Upload image</span> or drag & drop
          </p>
          <p class="text-xs text-gray-600">Returns base64 encoded string</p>
        </div>

        <div v-if="modelValue" class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button type="button" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-lg transition-colors" @click.stop="inputRef?.click()">
            Change
          </button>
          <button type="button" class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-sm rounded-lg transition-colors" @click.stop="emit('update:modelValue', null)">
            Remove
          </button>
        </div>
      </div>

      <!-- Info strip when image is set -->
      <div v-if="modelValue" class="mt-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>base64 · {{ Math.round((modelValue.length * 3) / 4 / 1024) }} KB approx</span>
        <button type="button" class="text-indigo-400 hover:text-indigo-300" @click="copyBase64">
          {{ copied ? 'Copied!' : 'Copy base64' }}
        </button>
      </div>

      <p v-if="sizeError" class="mt-1.5 text-xs text-rose-400">{{ sizeError }}</p>
    </div>
  </FieldWrapper>
</template>

<script setup lang="ts">
interface Props {
  /** Base64 data URL string (e.g. "data:image/png;base64,...") */
  modelValue: string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  accept?: string
  height?: number
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  height: 200,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const sizeError = ref('')
const copied = ref(false)

function handleFile(file: File) {
  sizeError.value = ''
  if (props.maxSize && file.size > props.maxSize) {
    sizeError.value = `File too large (max ${Math.round(props.maxSize / 1024)} KB)`
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => emit('update:modelValue', e.target?.result as string)
  reader.readAsDataURL(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

async function copyBase64() {
  if (!props.modelValue || !import.meta.client) return
  await navigator.clipboard.writeText(props.modelValue)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
