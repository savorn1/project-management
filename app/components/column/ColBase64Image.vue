<template>
  <div v-if="src" class="inline-flex items-center">
    <div
      v-if="broken"
      class="inline-flex items-center justify-center bg-slate-700/50 border border-slate-600/50"
      :class="roundedClass"
      :style="{ height: height + 'px', width: height + 'px' }"
      title="Image failed to load"
    >
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <img
      v-else
      :src="src"
      :alt="alt"
      :style="imgStyle"
      class="bg-slate-700 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-105"
      :class="[roundedClass, ring ? 'ring-2 ring-slate-600 ring-offset-1 ring-offset-slate-900' : '']"
      @click="lightbox = true"
      @error="broken = true"
    />
    <Teleport to="body">
      <div
        v-if="lightbox"
        class="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
        style="z-index:99999;"
        @click="lightbox = false"
      >
        <div class="relative max-w-full max-h-full" @click.stop>
          <img :src="src" :alt="alt" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" />
          <button
            type="button"
            class="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            @click="lightbox = false"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
  <div
    v-else
    class="inline-flex items-center justify-center bg-slate-700/50"
    :class="roundedClass"
    :style="{ height: height + 'px', width: height + 'px' }"
  >
    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
type RoundedKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  /** Raw base64 string or full data URL */
  value: string | null | undefined
  /** MIME type used when value is a raw base64 string (no data: prefix) */
  mime?: string
  height?: number
  width?: number
  alt?: string
  rounded?: RoundedKey
  ring?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mime: 'image/jpeg',
  height: 40,
  alt: '',
  rounded: 'md',
  ring: false,
})

const lightbox = ref(false)
const broken   = ref(false)

const src = computed(() => {
  if (!props.value) return null
  if (props.value.startsWith('data:')) return props.value
  return `data:${props.mime};base64,${props.value}`
})

const ROUNDED: Record<RoundedKey, string> = {
  none: 'rounded-none', sm: 'rounded-sm', md: 'rounded',
  lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full',
}

const roundedClass = computed(() => ROUNDED[props.rounded])

const imgStyle = computed(() => ({
  height: props.height + 'px',
  width:  props.width ? props.width + 'px' : props.rounded === 'full' ? props.height + 'px' : 'auto',
  maxWidth: props.rounded === 'full' ? props.height + 'px' : '120px',
  objectFit: 'cover' as const,
}))
</script>
