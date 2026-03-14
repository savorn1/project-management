<template>
  <div
    class="flex items-center gap-2.5 px-3 py-2 rounded-xl border max-w-[280px]"
    :class="mine
      ? 'bg-indigo-700/50 border-indigo-500/30'
      : 'bg-slate-800/80 border-slate-700/40'"
  >
    <!-- Play / Pause -->
    <button
      @click="togglePlay"
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
      :class="mine
        ? 'bg-indigo-500/30 hover:bg-indigo-500/50 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-gray-200'"
    >
      <svg v-if="!playing" class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>

    <!-- Waveform bars + progress -->
    <div class="flex-1 flex flex-col gap-1 min-w-0 cursor-pointer" @click="seek">
      <div class="flex items-center gap-px h-7">
        <div
          v-for="(h, i) in waveformBars"
          :key="i"
          class="rounded-full flex-shrink-0 transition-none"
          style="width: 2px"
          :style="{ height: `${h}px` }"
          :class="i < playedBars
            ? (mine ? 'bg-indigo-300' : 'bg-indigo-400')
            : (mine ? 'bg-white/25' : 'bg-slate-500/50')"
        />
      </div>
      <div class="flex justify-between" :class="mine ? 'text-indigo-200/50' : 'text-gray-600'" style="font-size:9px">
        <span>{{ currentTimeStr }}</span>
        <span>{{ durationStr }}</span>
      </div>
    </div>

    <!-- Speed toggle -->
    <button
      @click="cycleSpeed"
      class="text-[10px] font-bold px-1 py-0.5 rounded transition-colors flex-shrink-0 tabular-nums"
      :class="mine ? 'text-indigo-200/70 hover:bg-indigo-500/20' : 'text-gray-500 hover:bg-slate-700'"
    >{{ speed }}×</button>

    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @ended="onEnded"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string; mine?: boolean }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const speed = ref<1 | 1.5 | 2>(1)

// Static pseudo-waveform — seeded from the URL so it's consistent per message
const BARS = 36
const waveformBars = (() => {
  let seed = props.src.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }
  return Array.from({ length: BARS }, () => 4 + Math.floor(rand() * 22))
})()

const playedBars = computed(() =>
  Math.floor((currentTime.value / (duration.value || 1)) * BARS)
)

const currentTimeStr = computed(() => fmtSecs(currentTime.value))
const durationStr = computed(() => fmtSecs(duration.value))

function fmtSecs(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

function togglePlay() {
  const a = audioRef.value
  if (!a) return
  if (playing.value) { a.pause(); playing.value = false }
  else { a.play(); playing.value = true }
}

function onTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

function onLoaded() {
  if (audioRef.value) duration.value = audioRef.value.duration || 0
}

function onEnded() {
  playing.value = false
  currentTime.value = 0
}

function cycleSpeed() {
  speed.value = speed.value === 1 ? 1.5 : speed.value === 1.5 ? 2 : 1
  if (audioRef.value) audioRef.value.playbackRate = speed.value
}

function seek(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const a = audioRef.value
  if (a && duration.value) {
    a.currentTime = ratio * duration.value
    currentTime.value = a.currentTime
  }
}
</script>
