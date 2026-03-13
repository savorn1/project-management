<template>
  <div
    class="rounded-2xl overflow-hidden border"
    :class="mine
      ? 'bg-indigo-800/30 border-indigo-500/20'
      : 'bg-slate-800/80 border-slate-700/40'"
    style="min-width:200px;max-width:290px"
  >
    <!-- Header -->
    <div class="px-3 pt-2.5 pb-2 border-b" :class="mine ? 'border-indigo-500/20' : 'border-slate-700/40'">
      <div class="flex items-center gap-1.5 mb-1">
        <svg class="w-3 h-3 flex-shrink-0" :class="mine ? 'text-indigo-300' : 'text-indigo-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[9px] font-semibold uppercase tracking-wider" :class="mine ? 'text-indigo-300/70' : 'text-indigo-400/70'">
          Poll{{ poll.allowMultiple ? ' · Multiple choice' : '' }}
        </span>
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
        :disabled="isDeleted || userHasVoted"
        @click="$emit('vote', i)"
        class="relative w-full text-left rounded-lg overflow-hidden transition-all"
        :class="[
          isDeleted || userHasVoted ? 'cursor-default' : 'cursor-pointer hover:brightness-110',
          hasVoted(i)
            ? (mine ? 'ring-1 ring-indigo-400/60' : 'ring-1 ring-indigo-500/50')
            : '',
        ]"
      >
        <!-- Progress bar background — only shown after voting -->
        <div
          v-if="userHasVoted"
          class="absolute inset-0 rounded-lg transition-all duration-500"
          :class="hasVoted(i)
            ? (mine ? 'bg-indigo-500/30' : 'bg-indigo-500/25')
            : (mine ? 'bg-indigo-900/30' : 'bg-slate-700/40')"
          :style="{ width: votePercent(i) + '%' }"
        />
        <!-- Unvoted background -->
        <div
          v-else
          class="absolute inset-0 rounded-lg"
          :class="mine ? 'bg-indigo-900/30' : 'bg-slate-700/40'"
        />
        <!-- Label row -->
        <div class="relative flex items-center justify-between px-2.5 pt-1.5 gap-2" :class="userHasVoted && option.votes.length ? 'pb-1' : 'pb-1.5'">
          <div class="flex items-center gap-1.5 min-w-0">
            <!-- Radio (single) or Checkbox (multiple) indicator -->
            <div
              class="flex-shrink-0 border flex items-center justify-center"
              :class="[
                poll.allowMultiple ? 'w-3.5 h-3.5 rounded' : 'w-3.5 h-3.5 rounded-full',
                hasVoted(i)
                  ? 'border-indigo-400 bg-indigo-400'
                  : (mine ? 'border-indigo-400/40' : 'border-slate-500/60'),
              ]"
            >
              <svg v-if="hasVoted(i)" class="w-2 h-2 text-white" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5"/>
              </svg>
            </div>
            <span class="text-[11px] truncate" :class="mine ? 'text-indigo-100' : 'text-gray-300'">{{ option.text }}</span>
          </div>
          <!-- Vote count + percent — only shown after voting -->
          <span v-if="userHasVoted" class="text-[10px] flex-shrink-0 font-medium" :class="mine ? 'text-indigo-300/70' : 'text-gray-500'">
            {{ votePercent(i) }}%
          </span>
        </div>

        <!-- Voter avatars row — hover triggers popup via Teleport -->
        <div
          v-if="userHasVoted && option.votes.length"
          class="relative flex items-center gap-1.5 px-2.5 pb-1.5 group/voters cursor-default"
          @mouseenter.stop="(e) => showVoterPopup(e, i)"
          @mouseleave.stop="hideVoterPopup"
          @click.stop
        >
          <div class="flex -space-x-1.5">
            <div
              v-for="voterId in option.votes.slice(0, 5)"
              :key="voterId"
              class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-1 flex-shrink-0 transition-transform duration-150 group-hover/voters:scale-110"
              :class="voterId === currentUserId
                ? 'bg-indigo-500 ring-indigo-400/60'
                : 'bg-slate-600 ring-slate-500/40'"
            >
              {{ voterName(voterId).charAt(0).toUpperCase() }}
            </div>
          </div>
          <span
            class="text-[9px] transition-colors duration-150"
            :class="[
              option.votes.length > 5
                ? (mine ? 'text-indigo-300/50' : 'text-gray-600')
                : (mine ? 'text-indigo-300/40 group-hover/voters:text-indigo-300/70' : 'text-gray-600 group-hover/voters:text-gray-400'),
            ]"
          >
            <template v-if="option.votes.length > 5">+{{ option.votes.length - 5 }} more</template>
          </span>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="px-3 pb-2">
      <p class="text-[9px]" :class="mine ? 'text-indigo-300/50' : 'text-gray-600'">
        <template v-if="userHasVoted">{{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }} · You voted</template>
        <template v-else>{{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }} · Vote to see results</template>
      </p>
    </div>
  </div>

  <!-- Voter popup — teleported to body to escape overflow-hidden -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="hoveredOptionIdx !== null && poll.options[hoveredOptionIdx]"
        class="fixed z-[99999] pointer-events-none origin-bottom"
        :style="popupStyle"
      >
        <!-- Card -->
        <div class="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/60 overflow-hidden min-w-[150px] max-w-[220px]">
          <!-- Option label header -->
          <div class="px-3 pt-2 pb-1.5 border-b border-slate-700/40">
            <p class="text-[9px] font-semibold uppercase tracking-wider text-slate-500 leading-none mb-0.5">Voted for</p>
            <p class="text-[11px] font-medium text-gray-300 truncate">"{{ poll.options[hoveredOptionIdx]!.text }}"</p>
          </div>
          <!-- Voter list -->
          <div class="px-2 py-1.5 flex flex-col gap-0.5">
            <div
              v-for="voterId in poll.options[hoveredOptionIdx]!.votes"
              :key="voterId"
              class="flex items-center gap-2 px-1.5 py-1 rounded-lg"
              :class="voterId === currentUserId ? 'bg-indigo-500/10' : ''"
            >
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                :class="voterId === currentUserId ? 'bg-indigo-500' : 'bg-slate-600'"
              >
                {{ voterName(voterId).charAt(0).toUpperCase() }}
              </div>
              <span
                class="text-[11px] truncate flex-1"
                :class="voterId === currentUserId ? 'text-indigo-300 font-medium' : 'text-gray-300'"
              >{{ voterName(voterId) }}</span>
              <span v-if="voterId === currentUserId" class="text-[9px] text-indigo-400/50 flex-shrink-0">you</span>
            </div>
          </div>
        </div>
        <!-- Arrow pointing down toward the trigger -->
        <div class="absolute left-5 -bottom-[5px] w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700/60 rotate-45" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Poll } from '~/types'

const props = defineProps<{
  poll: Poll
  currentUserId?: string
  mine?: boolean
  isDeleted?: boolean
  memberMap?: Map<string, string>
}>()

defineEmits<{ vote: [optionIndex: number] }>()

const totalVotes = computed(() =>
  props.poll.options.reduce((sum, o) => sum + o.votes.length, 0)
)

// All option indexes the current user voted on (supports allowMultiple)
const myVoteIndexes = computed((): number[] => {
  if (!props.currentUserId) return []
  return props.poll.options
    .map((o, i) => (o.votes.includes(props.currentUserId!) ? i : -1))
    .filter((i) => i >= 0)
})

const userHasVoted = computed(() => myVoteIndexes.value.length > 0)

function hasVoted(index: number): boolean {
  return myVoteIndexes.value.includes(index)
}

function votePercent(index: number): number {
  if (totalVotes.value === 0) return 0
  return Math.round((props.poll.options[index]!.votes.length / totalVotes.value) * 100)
}

function voterName(userId: string): string {
  if (userId === props.currentUserId) return 'You'
  return props.memberMap?.get(userId) ?? userId.slice(-4)
}

// ── Voter popup ───────────────────────────────────────────────────────────────
const hoveredOptionIdx = ref<number | null>(null)
const popupStyle = ref<Record<string, string>>({})

function showVoterPopup(e: MouseEvent, idx: number) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const popupW = 220
  const left = Math.min(Math.max(rect.left, 8), window.innerWidth - popupW - 8)
  popupStyle.value = {
    left: `${left}px`,
    top: `${rect.top - 8}px`,
    transform: 'translateY(-100%)',
  }
  hoveredOptionIdx.value = idx
}

function hideVoterPopup() {
  hoveredOptionIdx.value = null
}
</script>
