<template>
  <div class="flex h-full -m-6 overflow-hidden">
    <!-- ── Conversation sidebar ─────────────────────────────────────── -->
    <div class="w-72 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col h-full">
      <ConversationList
        :conversations="conversations as Conversation[]"
        :active-id="activeConversationId"
        @select="handleSelect"
        @new="showModal = true"
      />
    </div>

    <!-- ── Message area ────────────────────────────────────────────── -->
    <div class="flex-1 flex h-full overflow-hidden">

    <!-- Main chat column -->
    <div class="flex-1 flex flex-col h-full overflow-hidden min-w-0">

      <!-- Empty state -->
      <div v-if="!activeConversation" class="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div class="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-400">Select a conversation</p>
        <p class="text-xs text-gray-600 mt-1">or start a new one</p>
        <button
          @click="showModal = true"
          class="mt-4 px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-all"
        >
          New Conversation
        </button>
      </div>

      <!-- Active conversation -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800/60 flex-shrink-0">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            :class="activeConversation.type === 'group'
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
          >
            {{ conversationInitials(activeConversation) }}
          </div>
          <div>
            <p class="text-sm font-semibold text-white">{{ conversationName(activeConversation) }}</p>
            <p class="text-[11px] text-gray-500">
              {{ activeConversation.type === 'group'
                ? `${activeConversation.participants.length} members`
                : 'Private chat' }}
            </p>
          </div>

          <!-- Real-time connection status + members toggle -->
          <div class="ml-auto flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full"
              :class="isConnected ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60' : 'bg-gray-600'"
            />
            <span class="text-[10px] text-gray-600">{{ isConnected ? 'Live' : 'Offline' }}</span>

            <!-- Members panel toggle (group only) -->
            <button
              v-if="activeConversation.type === 'group'"
              @click="showMembers = !showMembers"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="showMembers ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              title="Toggle member list"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="scrollRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <!-- Loading skeleton -->
          <div v-if="loadingMessages" class="space-y-4">
            <div v-for="i in 6" :key="i" class="flex gap-2" :class="i % 3 === 0 ? 'flex-row-reverse' : ''">
              <div class="w-7 h-7 rounded-full bg-slate-800 animate-pulse flex-shrink-0 self-end" />
              <div
                class="h-9 rounded-2xl bg-slate-800 animate-pulse"
                :style="`width: ${50 + i * 20}px`"
              />
            </div>
          </div>

          <!-- Messages grouped by date -->
          <template v-else>
            <template v-for="(group, date) in groupedMessages" :key="date">
              <!-- Date separator -->
              <div class="flex items-center gap-3 py-1">
                <div class="flex-1 h-px bg-slate-800/60" />
                <span class="text-[10px] text-gray-600 px-2 py-0.5 bg-slate-900 rounded-full border border-slate-800/40">
                  {{ formatDate(date) }}
                </span>
                <div class="flex-1 h-px bg-slate-800/60" />
              </div>

              <MessageBubble
                v-for="msg in group"
                :key="msg._id"
                :message="msg"
                :mine="isMyMessage(msg)"
                :sender-name="senderName(msg.senderId)"
                @delete="deleteMessage"
              />
            </template>
          </template>

          <!-- Typing indicator -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div v-if="typingUsers.length > 0" class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                {{ typingUsers[0]!.charAt(0).toUpperCase() }}
              </div>
              <div class="flex items-center gap-1 px-3 py-2 bg-slate-800/80 rounded-2xl rounded-tl-sm border border-slate-700/40">
                <span class="text-[11px] text-gray-400 mr-1">{{ typingUsers[0] }} is typing</span>
                <span class="flex gap-0.5">
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 0ms" />
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 150ms" />
                  <span class="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style="animation-delay: 300ms" />
                </span>
              </div>
            </div>
          </Transition>

          <!-- Scroll anchor -->
          <div ref="bottomRef" />
        </div>

        <!-- Blocked notice or input -->
        <div
          v-if="isBlockedInConversation"
          class="flex items-center justify-center gap-2 px-5 py-4 border-t border-slate-800/60 bg-slate-900/40"
        >
          <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span class="text-sm text-red-400/80">You have been blocked by an admin and cannot send messages.</span>
        </div>
        <MessageInput
          v-else
          ref="inputRef"
          :members="conversationMembers"
          @send="onSend"
          @typing="onTyping"
        />
      </template>
    </div><!-- end main chat column -->

    <!-- ── Members panel (group only) ──────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-if="activeConversation && activeConversation.type === 'group' && showMembers"
        class="w-56 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40 overflow-y-auto"
      >
        <!-- Panel header -->
        <div class="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Members · {{ activeConversation.participants.length }}
          </span>
          <button
            @click="showAddMembers = !showAddMembers"
            class="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            :class="showAddMembers ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
            title="Add members"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Add members picker -->
        <div v-if="showAddMembers" class="border-b border-slate-800/60 px-3 py-3 space-y-2 flex-shrink-0">
          <input
            v-model="addMemberSearch"
            type="text"
            placeholder="Search members…"
            class="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
          <div class="max-h-36 overflow-y-auto space-y-0.5">
            <div
              v-for="[id, name] in addableMembersFiltered"
              :key="id"
              @click="toggleAddMember(id)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
              :class="selectedToAdd.has(id) ? 'bg-indigo-500/15 text-indigo-300' : 'hover:bg-slate-800/40 text-gray-400'"
            >
              <div class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {{ name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-xs truncate flex-1">{{ name }}</span>
              <svg v-if="selectedToAdd.has(id)" class="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p v-if="addableMembersFiltered.length === 0" class="text-[11px] text-gray-600 text-center py-2">
              No members to add
            </p>
          </div>
          <button
            v-if="selectedToAdd.size > 0"
            @click="confirmAddMembers"
            :disabled="addingMembers"
            class="w-full py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {{ addingMembers ? 'Adding…' : `Add ${selectedToAdd.size} member${selectedToAdd.size > 1 ? 's' : ''}` }}
          </button>
        </div>

        <!-- Member list -->
        <div class="flex-1 overflow-y-auto py-2">
          <div
            v-for="participantId in activeConversation.participants"
            :key="participantId"
            class="group/row flex items-center gap-2 px-3 py-2 rounded-lg mx-2 transition-colors"
            :class="[
              participantId === currentUserId ? 'bg-slate-800/40' : 'hover:bg-slate-800/20',
              activeConversation.blockedMembers?.includes(participantId) ? 'opacity-50' : '',
            ]"
          >
            <!-- Avatar -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              :class="activeConversation.admins?.includes(participantId)
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'"
            >
              {{ (memberMap.get(participantId) ?? '?').charAt(0).toUpperCase() }}
            </div>

            <!-- Name + badges -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-300 truncate">
                {{ memberMap.get(participantId) ?? participantId.slice(-4) }}
                <span v-if="participantId === currentUserId" class="text-[10px] text-gray-600 font-normal">(you)</span>
              </p>
              <div class="flex items-center gap-1 flex-wrap">
                <span
                  v-if="activeConversation.admins?.includes(participantId)"
                  class="text-[9px] font-semibold uppercase tracking-wide text-amber-400/80"
                >Admin</span>
                <span
                  v-if="activeConversation.blockedMembers?.includes(participantId)"
                  class="text-[9px] font-semibold uppercase tracking-wide text-red-400/70"
                >Blocked</span>
              </div>
            </div>

            <!-- Action buttons (visible on row hover) -->
            <div
              class="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0"
            >
              <!-- Loading spinner -->
              <div
                v-if="memberActionLoading === participantId"
                class="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin"
              />

              <template v-else>
                <!-- Self: Leave button -->
                <button
                  v-if="participantId === currentUserId"
                  @click="leaveGroup"
                  class="w-5 h-5 rounded flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Leave group"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>

                <!-- Admin actions on other members -->
                <template v-else-if="activeConversation.admins?.includes(currentUserId)">
                  <!-- Block / Unblock -->
                  <button
                    @click="toggleBlock(participantId)"
                    class="w-5 h-5 rounded flex items-center justify-center transition-colors"
                    :class="activeConversation.blockedMembers?.includes(participantId)
                      ? 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10'"
                    :title="activeConversation.blockedMembers?.includes(participantId) ? 'Unblock member' : 'Block member'"
                  >
                    <svg v-if="activeConversation.blockedMembers?.includes(participantId)" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
                    </svg>
                  </button>

                  <!-- Remove member -->
                  <button
                    @click="removeMember(participantId)"
                    class="w-5 h-5 rounded flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove from group"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                  </button>
                </template>
              </template>
            </div>
          </div>
        </div>

        <!-- Leave group footer (always visible for non-admins) -->
        <div
          v-if="!activeConversation.admins?.includes(currentUserId)"
          class="flex-shrink-0 px-3 py-3 border-t border-slate-800/60"
        >
          <button
            @click="leaveGroup"
            :disabled="memberActionLoading === currentUserId"
            class="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/20 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave group
          </button>
        </div>
      </div>
    </Transition>
    </div><!-- end message area flex wrapper -->

    <!-- ── New Conversation Modal ───────────────────────────────────── -->
    <NewConversationModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, Conversation, TeamMember } from '~/types'

definePageMeta({ layout: 'default' })

const {
  conversations,
  activeConversationId,
  activeConversation,
  messages,
  typingUsers,
  loadConversations,
  selectConversation,
  sendMessage: chatSend,
  sendTyping,
  deleteMessage: chatDelete,
  leaveGroup: chatLeave,
  removeMember: chatRemove,
  blockMember: chatBlock,
  unblockMember: chatUnblock,
  startListening,
  conversationName,
  conversationInitials,
  isMyMessage,
  formatDate,
} = useChat()

const { teamApi } = useApi()
const { isConnected } = useSocket()
const { user } = useAuth()

const showModal = ref(false)
const showMembers = ref(true)
const loadingMessages = ref(false)
const bottomRef = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)

const currentUserId = computed(() => user.value?.id ?? '')

const isBlockedInConversation = computed(() =>
  !!activeConversation.value?.blockedMembers?.includes(currentUserId.value),
)

// Team member data
const teamMembers = ref<TeamMember[]>([])
const memberMap = ref<Map<string, string>>(new Map())

/** Participants of the active conversation excluding self — used for @mention */
const conversationMembers = computed<TeamMember[]>(() => {
  if (!activeConversation.value) return []
  const participantIds = new Set(activeConversation.value.participants)
  return teamMembers.value.filter((m) => participantIds.has(m._id) && m._id !== currentUserId.value)
})

// Add-members state
const showAddMembers = ref(false)
const addMemberSearch = ref('')
const selectedToAdd = ref<Set<string>>(new Set())
const addingMembers = ref(false)

/** Team members not already in the active conversation */
const addableMembers = computed<[string, string][]>(() => {
  if (!activeConversation.value) return []
  const existing = new Set(activeConversation.value.participants)
  const result: [string, string][] = []
  memberMap.value.forEach((name, id) => {
    if (!existing.has(id)) result.push([id, name])
  })
  return result
})

const addableMembersFiltered = computed(() =>
  addableMembers.value.filter(([, name]) =>
    name.toLowerCase().includes(addMemberSearch.value.toLowerCase()),
  ),
)

function toggleAddMember(id: string) {
  const s = new Set(selectedToAdd.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedToAdd.value = s
}

async function confirmAddMembers() {
  if (!activeConversation.value || selectedToAdd.value.size === 0) return
  addingMembers.value = true
  const { chatApi } = useApi()
  const updated = await chatApi.addParticipants(
    activeConversation.value._id,
    Array.from(selectedToAdd.value),
  )
  addingMembers.value = false
  if (updated) {
    // Refresh conversation list to get updated participants
    const team = Array.from(memberMap.value.entries()).map(([_id, name]) => ({
      _id, name, email: '', role: 'admin' as const, isActive: true, isEmailVerified: true, createdAt: '',
    }))
    await loadConversations(team)
    selectedToAdd.value = new Set()
    addMemberSearch.value = ''
    showAddMembers.value = false
  }
}

// Group messages by calendar date
const groupedMessages = computed(() => {
  const groups: Record<string, ChatMessage[]> = {}
  for (const msg of messages.value) {
    const key = new Date(msg.createdAt).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key]!.push(msg as ChatMessage)
  }
  return groups
})

function senderName(senderId: string): string {
  return memberMap.value.get(senderId) ?? senderId.slice(-4)
}

async function handleSelect(id: string) {
  loadingMessages.value = true
  await selectConversation(id)
  loadingMessages.value = false
  scrollToBottom()
  nextTick(() => inputRef.value?.focus())
}

async function onSend(content: string) {
  await chatSend(content)
  scrollToBottom()
}

function onTyping(isTyping: boolean) {
  sendTyping(isTyping)
}

async function deleteMessage(id: string) {
  await chatDelete(id)
}

async function handleCreated(id: string) {
  showModal.value = false
  const team = Array.from(memberMap.value.entries()).map(([_id, name]) => ({
    _id, name, email: '', role: 'admin' as const, isActive: true, isEmailVerified: true, createdAt: '',
  }))
  await loadConversations(team)
  await handleSelect(id)
}

// ── Member actions ────────────────────────────────────────────────────────

const memberActionLoading = ref<string | null>(null) // tracks which userId is loading

async function leaveGroup() {
  if (!activeConversation.value) return
  memberActionLoading.value = currentUserId.value
  await chatLeave(activeConversation.value._id)
  memberActionLoading.value = null
}

async function removeMember(userId: string) {
  if (!activeConversation.value) return
  memberActionLoading.value = userId
  await chatRemove(activeConversation.value._id, userId)
  memberActionLoading.value = null
}

async function toggleBlock(userId: string) {
  if (!activeConversation.value) return
  memberActionLoading.value = userId
  const isBlocked = activeConversation.value.blockedMembers?.includes(userId)
  if (isBlocked) {
    await chatUnblock(activeConversation.value._id, userId)
  } else {
    await chatBlock(activeConversation.value._id, userId)
  }
  memberActionLoading.value = null
}

function scrollToBottom() {
  nextTick(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }))
}

// Auto-scroll on new messages or typing
watch(() => messages.value.length, scrollToBottom)
watch(typingUsers, (users) => { if (users.length > 0) scrollToBottom() })

onMounted(async () => {
  const team = await teamApi.getAll()
  teamMembers.value = team
  memberMap.value = new Map(team.map((m) => [m._id, m.name]))
  await loadConversations(team)
  startListening()
})
</script>
