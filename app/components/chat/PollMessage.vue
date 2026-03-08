<template>
  <div
    class="rounded-2xl overflow-hidden border"
    :class="mine
      ? 'bg-indigo-800/30 border-indigo-500/20'
      : 'bg-slate-800/80 border-slate-700/40'"
    style="min-width:200px;max-width:280px"
  >
    <!-- Header -->
    <div class="px-3 pt-2.5 pb-2 border-b" :class="mine ? 'border-indigo-500/20' : 'border-slate-700/40'">
      <div class="flex items-center gap-1.5 mb-1">
        <svg class="w-3 h-3 flex-shrink-0" :class="mine ? 'text-indigo-300' : 'text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[9px] font-semibold uppercase tracking-wider" :class="mine ? 'text-indigo-300/70' : 'text-indigo-400/70'">Poll</span>
      </div>
      <p class="text-xs font-semibold leading-snug" :class="mine ? 'text-white' : 'text-gray-200'">
        {{ poll.question }}
      </p>
    </div>

    <!-- Options -->
    <div class="px-3 py-2 flex flex-col gap-1.5">
      <button
        v-for="(option, i) in poll.options"
        :key="i"
        :disabled="isDeleted"
        @click="$emit('vote', i)"
        class="relative w-full text-left rounded-lg overflow-hidden transition-all"
        :class="[
          isDeleted ? 'cursor-default' : 'cursor-pointer',
          hasVoted(i)
            ? (mine ? 'ring-1 ring-indigo-400/60' : 'ring-1 ring-indigo-500/50')
            : 'hover:brightness-110',
        ]"
      >
        <!-- Progress bar background -->
        <div
          class="absolute inset-0 rounded-lg transition-all duration-500"
          :class="hasVoted(i)
            ? (mine ? 'bg-indigo-500/30' : 'bg-indigo-500/25')
            : (mine ? 'bg-indigo-900/30' : 'bg-slate-700/40')"
          :style="{ width: votePercent(i) + '%' }"
        />
        <!-- Label row -->
        <div class="relative flex items-center justify-between px-2.5 py-1.5 gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <div
              class="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
              :class="hasVoted(i)
                ? 'border-indigo-400 bg-indigo-400'
                : (mine ? 'border-indigo-400/40' : 'border-slate-500/60')"
            >
              <svg v-if="hasVoted(i)" class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10 3L5 8.5 2 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <span class="text-[11px] truncate" :class="mine ? 'text-indigo-100' : 'text-gray-300'">{{ option.text }}</span>
          </div>
          <span class="text-[10px] flex-shrink-0 font-medium" :class="mine ? 'text-indigo-300/70' : 'text-gray-500'">
            {{ option.votes.length }}
          </span>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="px-3 pb-2">
      <p class="text-[9px]" :class="mine ? 'text-indigo-300/50' : 'text-gray-600'">
        {{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }}
        <span v-if="myVoteIndex !== -1"> · You voted</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Poll } from '~/types'

const props = defineProps<{
  poll: Poll
  currentUserId?: string
  mine?: boolean
  isDeleted?: boolean
}>()

defineEmits<{ vote: [optionIndex: number] }>()

const totalVotes = computed(() =>
  props.poll.options.reduce((sum, o) => sum + o.votes.length, 0)
)

const myVoteIndex = computed(() =>
  props.currentUserId
    ? props.poll.options.findIndex((o) => o.votes.includes(props.currentUserId!))
    : -1
)

function hasVoted(index: number): boolean {
  return myVoteIndex.value === index
}

function votePercent(index: number): number {
  if (totalVotes.value === 0) return 0
  return Math.round((props.poll.options[index]!.votes.length / totalVotes.value) * 100)
}
</script>
