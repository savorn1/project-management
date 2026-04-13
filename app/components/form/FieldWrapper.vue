<template>
  <div class="field-wrapper">
    <!-- Label row -->
    <div v-if="label || $slots.label" class="flex items-center gap-1.5 mb-1.5">
      <label
        :for="inputId"
        class="block text-sm font-medium text-gray-300 leading-none"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-rose-400 ml-0.5">*</span>
      </label>

      <!-- Tooltip trigger -->
      <div v-if="tooltip" class="relative flex items-center" @mouseenter="showTip = true" @mouseleave="showTip = false">
        <svg class="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <Transition name="tip">
          <div
            v-if="showTip"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-[220px] px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-xs text-gray-200 shadow-xl leading-relaxed pointer-events-none"
          >
            {{ tooltip }}
            <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
          </div>
        </Transition>
      </div>
    </div>

    <slot />

    <!-- Hint / error -->
    <Transition name="fade-down">
      <p v-if="error" key="error" class="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
        <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </p>
      <p v-else-if="hint" key="hint" class="mt-1.5 text-xs text-gray-500">{{ hint }}</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  /** Links the label to the input via for/id */
  inputId?: string
  /** Info tooltip shown next to the label on hover */
  tooltip?: string
}

defineProps<Props>()

const showTip = ref(false)
</script>

<style scoped>
/* Error / hint entrance */
.fade-down-enter-active { transition: all .2s ease; }
.fade-down-leave-active { transition: all .15s ease; }
.fade-down-enter-from   { opacity: 0; transform: translateY(-4px); }
.fade-down-leave-to     { opacity: 0; }

/* Tooltip entrance */
.tip-enter-active { transition: all .15s ease; }
.tip-leave-active { transition: all .1s ease; }
.tip-enter-from   { opacity: 0; transform: translateX(-50%) translateY(4px); }
.tip-leave-to     { opacity: 0; }
</style>
