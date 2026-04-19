<template>
  <div v-if="value" class="inline-flex items-center">
    <!-- Broken fallback -->
    <div
      v-if="broken"
      class="inline-flex items-center justify-center bg-slate-700/50 border border-slate-600/50"
      :class="roundedClass"
      :style="containerStyle"
      title="Image failed to load"
    >
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <img
      v-else
      :src="value"
      :alt="alt"
      :style="imgStyle"
      class="bg-slate-700 cursor-pointer transition-all duration-200"
      :class="[roundedClass, fitClass, ringClass, 'hover:opacity-90 hover:scale-105']"
      @click="lightbox = true"
      @error="broken = true"
    />
    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightbox"
        class="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
        style="z-index:99999;"
        @click="lightbox = false"
      >
        <div class="relative max-w-full max-h-full" @click.stop>
          <img :src="value" :alt="alt" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" />
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

  <!-- Null placeholder -->
  <div
    v-else
    class="inline-flex items-center justify-center bg-slate-700/50"
    :class="roundedClass"
    :style="containerStyle"
  >
    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
type FitMode    = 'cover' | 'contain' | 'fill' | 'scale-down'
type RoundedKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  value: string | null | undefined
  height?: number
  width?: number
  maxWidth?: number
  alt?: string
  /** object-fit mode */
  fit?: FitMode
  /** border-radius variant — "full" renders a circle */
  rounded?: RoundedKey
  /** subtle ring border */
  ring?: boolean
  /** CSS aspect-ratio e.g. "16/9", "4/3", "1/1" — overrides height-based sizing */
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 40,
  maxWidth: 120,
  alt: '',
  fit: 'cover',
  rounded: 'md',
  ring: false,
})

const lightbox = ref(false)
const broken   = ref(false)

const FIT_CLASS: Record<FitMode, string> = {
  cover:        'object-cover',
  contain:      'object-contain',
  fill:         'object-fill',
  'scale-down': 'object-scale-down',
}

const ROUNDED_CLASS: Record<RoundedKey, string> = {
  none: 'rounded-none',
  sm:   'rounded-sm',
  md:   'rounded',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  full: 'rounded-full',
}

const fitClass     = computed(() => FIT_CLASS[props.fit])
const roundedClass = computed(() => ROUNDED_CLASS[props.rounded])
const ringClass    = computed(() => props.ring ? 'ring-2 ring-slate-600 ring-offset-1 ring-offset-slate-900' : '')

const imgStyle = computed(() => {
  if (props.aspectRatio) {
    return {
      aspectRatio: props.aspectRatio,
      width: props.width ? props.width + 'px' : '100%',
      maxWidth: props.maxWidth + 'px',
    }
  }
  return {
    height:   props.height + 'px',
    width:    props.width ? props.width + 'px' : props.rounded === 'full' ? props.height + 'px' : 'auto',
    maxWidth: props.rounded === 'full' ? props.height + 'px' : props.maxWidth + 'px',
  }
})

const containerStyle = computed(() => {
  if (props.aspectRatio) {
    return { aspectRatio: props.aspectRatio, width: (props.width ?? props.height) + 'px' }
  }
  return { height: props.height + 'px', width: props.height + 'px' }
})
</script>
