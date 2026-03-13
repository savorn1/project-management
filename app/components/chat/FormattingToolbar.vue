<template>
  <div class="flex items-center gap-0.5 px-1 py-1 border-b border-slate-700/40">
    <button
      v-for="btn in buttons"
      :key="btn.label"
      @mousedown.prevent="apply(btn.wrap)"
      class="w-7 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-slate-700/60 transition-colors flex-shrink-0"
      :title="btn.label"
    >
      <span class="text-[11px] font-bold select-none" v-html="btn.icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  textareaRef: HTMLTextAreaElement | null
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const buttons: { label: string; icon: string; wrap: [string, string] }[] = [
  { label: 'Bold',        icon: '<strong>B</strong>',  wrap: ['**', '**'] },
  { label: 'Italic',      icon: '<em>I</em>',          wrap: ['*', '*'] },
  { label: 'Strikethrough', icon: '<s>S</s>',          wrap: ['~~', '~~'] },
  { label: 'Inline code', icon: '<code style="font-size:10px">&#96;&#96;</code>', wrap: ['`', '`'] },
  { label: 'Code block',  icon: '<code style="font-size:9px">```</code>',         wrap: ['```\n', '\n```'] },
]

function apply([before, after]: [string, string]) {
  const el = props.textareaRef
  if (!el) return

  const start = el.selectionStart ?? 0
  const end   = el.selectionEnd   ?? 0
  const selected = props.modelValue.slice(start, end)
  const replacement = before + (selected || 'text') + after

  const next =
    props.modelValue.slice(0, start) +
    replacement +
    props.modelValue.slice(end)

  emit('update:modelValue', next)

  nextTick(() => {
    el.focus()
    const cursor = selected
      ? start + replacement.length   // select whole wrapped block
      : start + before.length        // place cursor inside markers
    el.setSelectionRange(
      selected ? start : cursor,
      selected ? start + replacement.length : cursor + (selected || 'text').length,
    )
  })
}
</script>
