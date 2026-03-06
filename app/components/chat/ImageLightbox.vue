<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', null)"
      >
        <!-- Close -->
        <button
          @click="$emit('update:modelValue', null)"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Prev -->
        <button
          v-if="images.length > 1"
          @click="prev"
          class="absolute left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Image -->
        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          mode="out-in"
        >
          <img
            :key="currentIndex"
            :src="currentImage.url"
            :alt="currentImage.originalName"
            class="max-w-[90vw] max-h-[88vh] object-contain rounded-lg shadow-2xl select-none"
            @click.stop
          />
        </Transition>

        <!-- Next -->
        <button
          v-if="images.length > 1"
          @click="next"
          class="absolute right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Caption + download -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
          <span class="text-xs text-gray-300 max-w-[240px] truncate">{{ currentImage.originalName }}</span>
          <span v-if="images.length > 1" class="text-[10px] text-gray-500">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <a
            :href="currentImage.url"
            download
            target="_blank"
            class="text-gray-400 hover:text-white transition-colors"
            title="Download"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MessageAttachment } from '~/types';

const props = defineProps<{
  modelValue: MessageAttachment | null
  images: MessageAttachment[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: MessageAttachment | null] }>()

const currentIndex = computed(() =>
  props.modelValue ? props.images.findIndex((i) => i.url === props.modelValue!.url) : 0,
)

const currentImage = computed(() => props.images[currentIndex.value] ?? props.images[0]!)

function prev() {
  const idx = (currentIndex.value - 1 + props.images.length) % props.images.length
  emit('update:modelValue', props.images[idx]!)
}
function next() {
  const idx = (currentIndex.value + 1) % props.images.length
  emit('update:modelValue', props.images[idx]!)
}

// Keyboard navigation
function onKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') emit('update:modelValue', null)
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
