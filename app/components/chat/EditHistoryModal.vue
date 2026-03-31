<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

      <div class="relative w-[480px] max-w-[92vw] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden max-h-[75vh]">
        <!-- Header -->
        <div class="px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p class="text-sm font-semibold text-white">Edit History</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Diff toggle -->
            <button
              @click="showDiff = !showDiff"
              class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors border"
              :class="showDiff
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-transparent border-slate-700/40 text-gray-500 hover:text-gray-300 hover:border-slate-600'"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Diff
            </button>
            <button
              @click="$emit('close')"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-800 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- History list -->
        <div class="overflow-y-auto flex-1">
          <!-- No history state -->
          <div v-if="!history.length" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            <svg class="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-xs text-gray-500">No edit history available</p>
          </div>

          <div v-else class="divide-y divide-slate-800/60">
            <!-- Current version (always first) -->
            <div class="px-4 py-3">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Current version</span>
                <span class="text-[10px] text-gray-600">{{ formatTime(props.message.editedAt!) }}</span>
              </div>
              <!-- If diff mode: show diff vs previous version -->
              <div
                v-if="showDiff && reversedHistory.length > 0"
                class="text-xs leading-relaxed whitespace-pre-wrap break-words"
                v-html="diffHtml(reversedHistory[0]!.content, props.message.content)"
              />
              <p v-else class="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                {{ props.message.content || '(empty)' }}
              </p>
            </div>

            <!-- Previous versions (newest-first) -->
            <div
              v-for="(entry, idx) in reversedHistory"
              :key="idx"
              class="px-4 py-3"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  {{ idx === reversedHistory.length - 1 ? 'Original' : `Version ${reversedHistory.length - idx}` }}
                </span>
                <span class="text-[10px] text-gray-600">{{ formatTime(entry.editedAt) }}</span>
              </div>
              <!-- Diff vs the next older version (or empty string for original) -->
              <div
                v-if="showDiff"
                class="text-xs leading-relaxed whitespace-pre-wrap break-words"
                v-html="diffHtml(
                  idx < reversedHistory.length - 1 ? reversedHistory[idx + 1]!.content : '',
                  entry.content
                )"
              />
              <p v-else class="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap break-words">
                {{ entry.content || '(empty)' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Legend (shown in diff mode) -->
        <div v-if="showDiff && history.length" class="px-4 py-2 border-t border-slate-800/60 flex items-center gap-4 flex-shrink-0">
          <span class="text-[10px] text-gray-600">Legend:</span>
          <span class="text-[10px]">
            <mark style="background:rgba(34,197,94,0.2);color:rgb(134,239,172);border-radius:2px;padding:0 2px;">+added</mark>
          </span>
          <span class="text-[10px]">
            <mark style="background:rgba(239,68,68,0.2);color:rgb(252,165,165);border-radius:2px;padding:0 2px;text-decoration:line-through;">-removed</mark>
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageEditHistoryEntry } from '~/types'

const props = defineProps<{
  message: ChatMessage
}>()

defineEmits<{ close: [] }>()

const { formatTime } = useChat()
const showDiff = ref(false)

const history = computed<MessageEditHistoryEntry[]>(() => props.message.editHistory ?? [])
const reversedHistory = computed(() => [...history.value].reverse())

// ── Word-level diff ──────────────────────────────────────────────────────────

function diffHtml(oldText: string, newText: string): string {
  const oldWords = tokenize(oldText)
  const newWords = tokenize(newText)
  const lcs = computeLCS(oldWords, newWords)

  const result: string[] = []
  let oi = 0
  let ni = 0

  for (const word of lcs) {
    // Removed words (in old but not yet matched)
    while (oi < oldWords.length && oldWords[oi] !== word) {
      result.push(`<mark style="background:rgba(239,68,68,0.2);color:rgb(252,165,165);border-radius:2px;padding:0 2px;text-decoration:line-through;">${escHtml(oldWords[oi]!)}</mark>`)
      oi++
    }
    // Added words (in new but not yet matched)
    while (ni < newWords.length && newWords[ni] !== word) {
      result.push(`<mark style="background:rgba(34,197,94,0.2);color:rgb(134,239,172);border-radius:2px;padding:0 2px;">${escHtml(newWords[ni]!)}</mark>`)
      ni++
    }
    // Matched word
    result.push(escHtml(word))
    oi++
    ni++
  }
  // Remaining removed
  while (oi < oldWords.length) {
    result.push(`<mark style="background:rgba(239,68,68,0.2);color:rgb(252,165,165);border-radius:2px;padding:0 2px;text-decoration:line-through;">${escHtml(oldWords[oi]!)}</mark>`)
    oi++
  }
  // Remaining added
  while (ni < newWords.length) {
    result.push(`<mark style="background:rgba(34,197,94,0.2);color:rgb(134,239,172);border-radius:2px;padding:0 2px;">${escHtml(newWords[ni]!)}</mark>`)
    ni++
  }

  return result.join('')
}

function tokenize(text: string): string[] {
  // Split on word boundaries, keeping whitespace as tokens
  return (text ?? '').split(/(\s+)/)
}

function computeLCS(a: string[], b: string[]): string[] {
  // Standard LCS (capped at 300 tokens each to avoid O(n²) blow-up)
  const A = a.slice(0, 300)
  const B = b.slice(0, 300)
  const m = A.length
  const n = B.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = A[i - 1] === B[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
    }
  }

  const lcs: string[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) { lcs.unshift(A[i - 1]!); i--; j-- }
    else if (dp[i - 1]![j]! > dp[i]![j - 1]!) i--
    else j--
  }
  return lcs
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
}
</script>
