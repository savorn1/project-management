<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

        <!-- Modal Content -->
        <div class="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-h-[90vh] overflow-hidden" :class="sizeClasses">
          <!-- Header -->
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            <button
              @click="close"
              class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }
  return sizes[props.size]
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
