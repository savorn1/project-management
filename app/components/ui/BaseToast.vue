<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-0 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm"
          :class="toastClasses[toast.type]"
        >
          <span class="text-lg flex-shrink-0 mt-0.5">{{ toastIcons[toast.type] }}</span>
          <p class="text-sm flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast()

const toastClasses: Record<string, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
}

const toastIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
</script>
