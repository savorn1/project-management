<template>
  <a
    v-if="preview"
    :href="preview.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block mt-1.5 rounded-xl overflow-hidden border transition-colors max-w-[280px]"
    :class="mine
      ? 'border-indigo-500/20 bg-indigo-800/20 hover:bg-indigo-800/30'
      : 'border-slate-700/40 bg-slate-800/50 hover:bg-slate-800/70'"
  >
    <!-- OG image -->
    <img
      v-if="preview.image"
      :src="preview.image"
      :alt="preview.title ?? ''"
      class="w-full h-28 object-cover"
      @error="preview!.image = null"
    />
    <div class="px-3 py-2">
      <!-- Site name -->
      <p v-if="preview.siteName" class="text-[9px] font-semibold uppercase tracking-wider text-gray-600 mb-0.5">
        {{ preview.siteName }}
      </p>
      <!-- Title -->
      <p v-if="preview.title" class="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2">
        {{ preview.title }}
      </p>
      <!-- Description -->
      <p v-if="preview.description" class="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
        {{ preview.description }}
      </p>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { LinkPreview } from '~/types'

const props = defineProps<{
  url: string
  mine?: boolean
}>()

const { chatApi } = useApi()

const preview = ref<LinkPreview | null>(null)

onMounted(async () => {
  preview.value = await chatApi.getLinkPreview(props.url)
})
</script>
