<template>
  <BaseBadge :color="color">
    {{ config.label }}
  </BaseBadge>
</template>

<script setup lang="ts">
import type { TaskPriority } from '~/types'
import { PRIORITY_CONFIG } from '~/utils/constants'

interface Props {
  priority: TaskPriority
}

const props = defineProps<Props>()

const config = computed(() => PRIORITY_CONFIG[props.priority])

const color = computed((): 'slate' | 'blue' | 'amber' | 'rose' => {
  const colors: Record<TaskPriority, 'slate' | 'blue' | 'amber' | 'rose'> = {
    low: 'slate',
    medium: 'blue',
    high: 'amber',
    urgent: 'rose'
  }
  return colors[props.priority]
})
</script>
