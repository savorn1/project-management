<template>
  <div class="w-72 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40">

    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <span class="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Conversation Info
      </span>
      <button
        @click="$emit('close')"
        class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-slate-800/60 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto">

      <!-- Conversation identity -->
      <div class="flex flex-col items-center px-4 py-5 border-b border-slate-800/40">
        <!-- Avatar (clickable for group admins) -->
        <div class="relative mb-2.5 group/avatar">
          <img
            v-if="conversation.avatar"
            :src="conversation.avatar"
            class="w-14 h-14 rounded-full object-cover shadow-lg"
          />
          <div
            v-else
            class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg"
            :class="conversation.type === 'group'
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
          >{{ initials }}</div>

          <!-- Upload overlay (group admins only) -->
          <button
            v-if="conversation.type === 'group' && isAdmin"
            @click="avatarInputRef?.click()"
            :disabled="avatarLoading"
            class="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
            title="Change group avatar"
          >
            <div v-if="avatarLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onAvatarSelected"
          />
        </div>

        <p class="text-sm font-semibold text-white text-center">{{ name }}</p>
        <span
          class="mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          :class="conversation.type === 'group'
            ? 'bg-violet-500/15 text-violet-400'
            : 'bg-emerald-500/15 text-emerald-400'"
        >{{ conversation.type === 'group' ? 'Group' : 'Direct Message' }}</span>
      </div>

      <!-- Members preview -->
      <div class="px-4 py-3 border-b border-slate-800/40">
        <div class="flex items-center justify-between mb-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
            {{ conversation.type === 'group' ? `Members · ${conversation.participants.length}` : 'Member' }}
          </p>
          <button
            v-if="conversation.type === 'group'"
            @click="$emit('open-members')"
            class="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >View all</button>
        </div>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="id in previewMembers"
            :key="id"
            class="flex items-center gap-2.5"
          >
            <div class="relative flex-shrink-0">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                :class="conversation.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
              >{{ memberInitial(id) }}</div>
              <span
                v-if="isOnline(id)"
                class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-900"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-300 truncate">
                {{ memberName(id) }}
                <span v-if="id === currentUserId" class="text-gray-600"> (you)</span>
              </p>
              <p class="text-[10px]" :class="isOnline(id) ? 'text-emerald-400' : 'text-gray-600'">
                {{ isOnline(id) ? 'Online' : getLastSeen(id) }}
              </p>
            </div>
            <span
              v-if="conversation.admins.includes(id)"
              class="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[9px] font-semibold uppercase"
            >Admin</span>
          </div>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="px-4 py-3 border-b border-slate-800/40 flex flex-col gap-1.5">
        <!-- Pinned messages -->
        <button
          v-if="pinnedCount > 0"
          @click="$emit('open-pinned')"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l4 4-8 8-4-4 8-8z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14l-4 4" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-300">Pinned Messages</p>
            <p class="text-[10px] text-gray-600">{{ pinnedCount }} pinned</p>
          </div>
          <svg class="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Media & files -->
        <button
          @click="$emit('open-media')"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-300">Media & Files</p>
            <p class="text-[10px] text-gray-600">Shared photos and documents</p>
          </div>
          <svg class="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Invite Link (group admins only) -->
      <div v-if="conversation.type === 'group' && isAdmin" class="px-4 py-3 border-b border-slate-800/40">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Invite Link</p>
        <div v-if="inviteLink" class="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 mb-1.5">
          <span class="flex-1 text-[11px] text-gray-400 truncate select-all">{{ inviteLink }}</span>
          <button
            @click="copyInviteLink"
            class="flex-shrink-0 text-[10px] font-semibold transition-colors px-1.5 py-0.5 rounded-md"
            :class="inviteCopied ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'"
          >{{ inviteCopied ? 'Copied!' : 'Copy' }}</button>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="!inviteLink"
            @click="loadInviteLink"
            :disabled="inviteLinkLoading"
            class="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20"
          >
            <div v-if="inviteLinkLoading" class="w-3 h-3 border border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Generate invite link
          </button>
          <button
            v-if="inviteLink"
            @click="resetInviteLink"
            :disabled="inviteLinkLoading"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-slate-700/40"
            title="Reset invite link (old link will stop working)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="px-4 py-3 border-b border-slate-800/40">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Actions</p>
        <div class="flex flex-col gap-1">

          <!-- Mute toggle -->
          <button
            @click="$emit('toggle-mute')"
            class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
          >
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              :class="muted ? 'bg-amber-500/10' : 'bg-slate-700/50'"
            >
              <svg class="w-3.5 h-3.5" :class="muted ? 'text-amber-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!muted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12L7 9H4v6h3l5 3V6z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">{{ muted ? 'Unmute notifications' : 'Mute notifications' }}</span>
          </button>

          <!-- Slow Mode (group admins only) -->
          <div v-if="conversation.type === 'group' && isAdmin">
            <button
              @click="toggleSlowMode"
              class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                :class="slowModeEnabled ? 'bg-violet-500/10' : 'bg-slate-700/50'"
              >
                <svg class="w-3.5 h-3.5" :class="slowModeEnabled ? 'text-violet-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs text-gray-300">Slow mode</span>
                <span v-if="slowModeEnabled" class="ml-1.5 text-[10px] font-semibold text-violet-400">{{ slowModeLabel }}</span>
              </div>
              <!-- Toggle pill -->
              <div
                class="w-8 h-4 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5"
                :class="slowModeEnabled ? 'bg-violet-500' : 'bg-slate-700'"
              >
                <div
                  class="w-3 h-3 rounded-full bg-white shadow transition-transform"
                  :class="slowModeEnabled ? 'translate-x-4' : 'translate-x-0'"
                />
              </div>
            </button>

            <!-- Delay picker (shown when enabled) -->
            <div v-if="slowModeEnabled" class="ml-10 mb-1 flex gap-1 flex-wrap">
              <button
                v-for="d in slowModeOptions"
                :key="d.value"
                @click="changeSlowModeDelay(d.value)"
                class="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors border"
                :class="slowModeDelay === d.value
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-transparent border-slate-700/40 text-gray-600 hover:text-gray-300 hover:border-slate-600'"
              >{{ d.label }}</button>
            </div>
          </div>

          <!-- Leave group (groups only) -->
          <button
            v-if="conversation.type === 'group'"
            @click="$emit('leave')"
            class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-rose-500/10 transition-colors text-left group"
          >
            <div class="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span class="text-xs text-rose-400 group-hover:text-rose-300 transition-colors">Leave group</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

interface Props {
  conversation: Conversation
  currentUserId: string
  memberMap: Map<string, string>
  muted: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  'open-members': []
  'open-media': []
  'open-pinned': []
  'toggle-mute': []
  leave: []
}>()

const { conversationName, conversationInitials, isOnline, getLastSeen, updateGroupAvatar, setSlowMode } = useChat()
const { chatApi } = useApi()
const toast = useToast()

const name = computed(() => conversationName(props.conversation))
const initials = computed(() => conversationInitials(props.conversation))

const pinnedCount = computed(() => props.conversation.pinnedMessages?.length ?? 0)

const isAdmin = computed(
  () => props.conversation.admins?.includes(props.currentUserId) || props.conversation.createdBy === props.currentUserId,
)

// Show up to 5 members, current user last
const previewMembers = computed(() => {
  const ids = [...props.conversation.participants]
  const selfIdx = ids.indexOf(props.currentUserId)
  if (selfIdx !== -1) {
    ids.splice(selfIdx, 1)
    ids.push(props.currentUserId)
  }
  return ids.slice(0, 5)
})

function memberName(id: string): string {
  return props.memberMap.get(id) ?? id.slice(-6)
}

function memberInitial(id: string): string {
  const n = memberName(id)
  const parts = n.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return n.charAt(0).toUpperCase()
}

// ── Feature 12: Custom Group Avatar ──────────────────────────────────────────

const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarLoading = ref(false)

async function onAvatarSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Avatar image must be under 5 MB')
    return
  }
  avatarLoading.value = true
  const reader = new FileReader()
  reader.onload = async () => {
    const dataUrl = reader.result as string
    await updateGroupAvatar(props.conversation._id, dataUrl)
    avatarLoading.value = false
    // Reset input so the same file can be re-selected
    if (avatarInputRef.value) avatarInputRef.value.value = ''
  }
  reader.onerror = () => {
    toast.error('Failed to read image file')
    avatarLoading.value = false
  }
  reader.readAsDataURL(file)
}

// ── Feature 13: Invite Link ───────────────────────────────────────────────────

const inviteLink = ref('')
const inviteCopied = ref(false)
const inviteLinkLoading = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

function buildInviteUrl(token: string): string {
  return `${window.location.origin}/chat/join/${token}`
}

async function loadInviteLink() {
  inviteLinkLoading.value = true
  const result = await chatApi.getInviteLink(props.conversation._id)
  inviteLinkLoading.value = false
  if (result) inviteLink.value = buildInviteUrl(result.token)
}

async function resetInviteLink() {
  inviteLinkLoading.value = true
  const result = await chatApi.resetInviteLink(props.conversation._id)
  inviteLinkLoading.value = false
  if (result) {
    inviteLink.value = buildInviteUrl(result.token)
    toast.success('Invite link reset — the old link is now invalid')
  }
}

function copyInviteLink() {
  if (!inviteLink.value) return
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    inviteCopied.value = true
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { inviteCopied.value = false }, 2000)
  })
}

onUnmounted(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})

// ── Feature 14: Slow Mode ────────────────────────────────────────────────────

const slowModeOptions = [
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
]

const slowModeEnabled = computed(() => props.conversation.slowMode?.enabled ?? false)
const slowModeDelay = computed(() => props.conversation.slowMode?.delay ?? 30)
const slowModeLabel = computed(() => {
  const d = slowModeDelay.value
  if (d < 60) return `${d}s`
  return `${Math.round(d / 60)}m`
})

async function toggleSlowMode() {
  await setSlowMode(props.conversation._id, !slowModeEnabled.value, slowModeDelay.value)
}

async function changeSlowModeDelay(delay: number) {
  await setSlowMode(props.conversation._id, true, delay)
}
</script>
