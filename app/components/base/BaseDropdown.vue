<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger slot -->
    <slot name="trigger" :toggle="toggle" :is-open="isOpen" />

    <!-- Panel (teleported to escape overflow containers) -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0"
        style="z-index: 99998;"
        @click.stop="close"
      />
      <div
        v-if="isOpen"
        class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        style="z-index: 99999;"
        :style="panelStyle"
        @click.stop
      >
        <slot :close="close" :is-open="isOpen" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Fixed panel width in px. Defaults to matching the trigger width. */
  width?: number
  /** Estimated panel height used for flip-direction logic. */
  estimatedHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  estimatedHeight: 300,
})

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function computePosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const panelW = props.width ?? rect.width
  const panelH = props.estimatedHeight

  let top = rect.bottom + 4
  if (top + panelH > window.innerHeight - 8) {
    top = rect.top - panelH - 4
  }
  if (top < 8) top = 8

  let left = rect.left
  if (left + panelW > window.innerWidth - 16) {
    left = window.innerWidth - panelW - 16
  }
  if (left < 8) left = 8

  panelStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${panelW}px`,
  }
}

function open() {
  computePosition()
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

defineExpose({ open, close, toggle, isOpen })
</script>
