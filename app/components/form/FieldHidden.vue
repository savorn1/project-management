<template>
  <input type="hidden" :name="name" :value="serialised" />
</template>

<script setup lang="ts">
interface Props {
  modelValue: unknown
  /** HTML name attribute for native form submission */
  name?: string
}

const props = defineProps<Props>()

/** Serialise non-string values so the hidden input always has a string value */
const serialised = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return ''
  if (typeof props.modelValue === 'object') return JSON.stringify(props.modelValue)
  return String(props.modelValue)
})
</script>
