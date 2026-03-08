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
    <div class="relative flex-1 flex flex-col h-full overflow-hidden min-w-0">

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

          <!-- Search + controls -->
          <div class="ml-auto flex items-center gap-2">
            <!-- Search bar -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search…"
                class="w-32 focus:w-44 transition-all duration-200 bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
              />
              <svg v-if="!searchQuery" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button v-else @click="searchQuery = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <span class="w-2 h-2 rounded-full flex-shrink-0"
              :class="isConnected ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60' : 'bg-gray-600'" />
            <span class="text-[10px] text-gray-600">{{ isConnected ? 'Live' : 'Offline' }}</span>

            <!-- Pinned messages toggle -->
            <button
              v-if="activeConversation.pinnedMessages?.length"
              @click="showPinned = !showPinned"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors relative"
              :class="showPinned ? 'bg-amber-500/20 text-amber-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              title="Pinned messages"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-[8px] font-bold text-white flex items-center justify-center">
                {{ activeConversation.pinnedMessages.length }}
              </span>
            </button>

            <!-- Starred messages toggle -->
            <button
              @click="showStarred = !showStarred"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="showStarred ? 'bg-amber-500/20 text-amber-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              title="Starred messages"
            >
              <svg class="w-4 h-4" :fill="showStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

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
        <div ref="scrollRef" class="relative flex-1 overflow-y-auto px-5 py-4 space-y-3">
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
            <!-- Load-more indicator (top of list) -->
            <div class="flex justify-center py-2">
              <Transition
                enter-active-class="transition ease-out duration-150"
                enter-from-class="opacity-0 scale-90"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-90"
              >
                <div v-if="messageLoadingMore" class="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-full text-xs text-gray-500">
                  <div class="w-3 h-3 border border-slate-600 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
                  Loading older messages…
                </div>
                <div v-else-if="!messageHasMore && messages.length > 0" class="text-[10px] text-gray-700 select-none px-3 py-1">
                  Beginning of conversation
                </div>
              </Transition>
            </div>

            <template v-for="(group, date) in groupedMessages" :key="date">
              <!-- Date separator -->
              <div class="flex items-center gap-3 py-1">
                <div class="flex-1 h-px bg-slate-800/60" />
                <span class="text-[10px] text-gray-600 px-2 py-0.5 bg-slate-900 rounded-full border border-slate-800/40">
                  {{ formatDate(date) }}
                </span>
                <div class="flex-1 h-px bg-slate-800/60" />
              </div>

              <template v-for="msg in group" :key="msg._id">
                <!-- Unread separator -->
                <div
                  v-if="unreadSeparatorId && msg._id === unreadSeparatorId"
                  class="flex items-center gap-3 py-1"
                >
                  <div class="flex-1 h-px bg-indigo-500/30" />
                  <span class="text-[10px] font-semibold text-indigo-400/70 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex-shrink-0">
                    New Messages
                  </span>
                  <div class="flex-1 h-px bg-indigo-500/30" />
                </div>

                <MessageBubble
                  :message="msg"
                  :mine="isMyMessage(msg)"
                  :sender-name="senderName(msg.senderId)"
                  :current-user-id="currentUserId"
                  :highlighted="msg._id === highlightedId"
                  :is-starred="starredIds.has(msg._id)"
                  :reply-to-message="msg.replyTo ? messageMap.get(msg.replyTo) && { _id: msg.replyTo, content: messageMap.get(msg.replyTo)!.content, senderName: senderName(messageMap.get(msg.replyTo)!.senderId) } : undefined"
                  @delete="deleteMessage"
                  @reply="startReply"
                  @edit="handleEdit"
                  @scroll-to="scrollToMessage"
                  @react="handleReact"
                  @pin="handlePin"
                  @forward="(m) => forwardMessage = m"
                  @thread="(m) => threadMessage = m"
                  @star="handleStar"
                  @open-image="(img) => openLightbox(img, (msg.attachments ?? []).filter(a => a.mimeType.startsWith('image/')))"
                />

                <!-- Link preview (first URL in the message, not shown for deleted messages) -->
                <div
                  v-if="!msg.isDeleted && extractUrl(msg.content)"
                  :class="isMyMessage(msg) ? 'flex justify-end' : 'flex justify-start pl-9'"
                >
                  <LinkPreview :url="extractUrl(msg.content)!" :mine="isMyMessage(msg)" />
                </div>
              </template>
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
                <span class="text-[11px] text-gray-400 mr-1">{{ typingLabel }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing</span>
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

        <!-- Scroll-to-bottom FAB -->
        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <button
            v-if="!isAtBottom"
            @click="scrollToBottom"
            class="absolute bottom-24 right-5 z-10 w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600/60 shadow-lg flex items-center justify-center text-gray-300 hover:text-white transition-all"
            title="Scroll to bottom"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </Transition>

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
          :replying-to="replyingTo ?? undefined"
          :initial-draft="draftToRestore"
          @send="onSend"
          @typing="onTyping"
          @cancel-reply="replyingTo = null"
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
          <div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Members · {{ activeConversation.participants.length }}
            </span>
            <span class="ml-2 text-[10px] text-emerald-400/80">
              {{ activeConversation.participants.filter(id => isOnline(id)).length }} online
            </span>
          </div>
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
            <!-- Avatar + online dot -->
            <div class="relative flex-shrink-0">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                :class="activeConversation.admins?.includes(participantId)
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'"
              >
                {{ (memberMap.get(participantId) ?? '?').charAt(0).toUpperCase() }}
              </div>
              <!-- Online indicator dot -->
              <span
                class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 flex-shrink-0"
                :class="isOnline(participantId) ? 'bg-emerald-400' : 'bg-slate-600'"
              />
            </div>

            <!-- Name + badges -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-300 truncate">
                {{ memberMap.get(participantId) ?? participantId.slice(-4) }}
                <span v-if="participantId === currentUserId" class="text-[10px] text-gray-600 font-normal">(you)</span>
              </p>
              <div class="flex items-center gap-1 flex-wrap">
                <!-- Online status -->
                <span
                  class="text-[9px] font-medium"
                  :class="isOnline(participantId) ? 'text-emerald-400' : 'text-gray-600'"
                >{{ getLastSeen(participantId) }}</span>

                <span v-if="activeConversation.admins?.includes(participantId)" class="text-[9px] text-gray-700">·</span>
                <span
                  v-if="activeConversation.admins?.includes(participantId)"
                  class="text-[9px] font-semibold uppercase tracking-wide text-amber-400/80"
                >Admin</span>
                <span v-if="activeConversation.blockedMembers?.includes(participantId)" class="text-[9px] text-gray-700">·</span>
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
                v-if="memberActionLoading.has(participantId)"
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
            :disabled="memberActionLoading.has(currentUserId)"
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
    <!-- ── Thread panel ────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <ThreadPanel
        v-if="activeConversation && threadMessage"
        :root-message-id="threadMessage._id"
        :conversation-id="activeConversation._id"
        :member-map="memberMap"
        @close="threadMessage = null"
      />
    </Transition>

    <!-- ── Starred panel ──────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <StarredPanel
        v-if="showStarred"
        :member-map="memberMap"
        :conversation-name-map="conversationNameMap"
        @close="showStarred = false"
        @navigate="handleStarNavigate"
      />
    </Transition>
    </div><!-- end message area flex wrapper -->

    <!-- ── Pinned messages dropdown ────────────────────────────────── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="showPinned && activeConversation?.pinnedMessages?.length"
          class="fixed top-16 right-4 z-[9990] w-72 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
            <span class="text-xs font-semibold text-amber-400">📌 Pinned Messages</span>
            <button @click="showPinned = false" class="text-gray-600 hover:text-gray-300 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
            <div
              v-for="pin in [...(activeConversation.pinnedMessages ?? [])].reverse()"
              :key="pin.messageId"
              class="flex items-start gap-2 px-4 py-2.5 hover:bg-slate-800/40 transition-colors group/pin"
            >
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-gray-600 mb-0.5">{{ senderName(pin.pinnedBy) }}</p>
                <p
                  class="text-xs text-gray-300 truncate cursor-pointer hover:text-indigo-300 transition-colors"
                  @click="scrollToMessage(pin.messageId); showPinned = false"
                >{{ pin.content || '📎 Attachment' }}</p>
              </div>
              <button
                @click="handleUnpin(pin.messageId)"
                class="opacity-0 group-hover/pin:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                title="Unpin"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <div v-if="showPinned" class="fixed inset-0 z-[9989]" @click="showPinned = false" />
    </Teleport>

    <!-- ── Image Lightbox ───────────────────────────────────────────── -->
    <ImageLightbox v-model="lightboxImage" :images="lightboxImages" />

    <!-- ── Forward Modal ───────────────────────────────────────────── -->
    <ForwardModal
      v-if="forwardMessage"
      :conversations="conversations as Conversation[]"
      :content="forwardMessage.content"
      @close="forwardMessage = null"
      @forwarded="forwardMessage = null"
    />

    <!-- ── New Conversation Modal ───────────────────────────────────── -->
    <NewConversationModal
      v-if="showModal"
      @close="showModal = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, Conversation, MessageAttachment, TeamMember } from '~/types'

definePageMeta({ layout: 'default' })

const {
  conversations,
  activeConversationId,
  activeConversation,
  messages,
  typingUsers,
  messageHasMore,
  messageLoadingMore,
  unreadSeparatorId,
  starredIds,
  loadConversations,
  selectConversation,
  sendMessage: chatSend,
  sendTyping,
  deleteMessage: chatDelete,
  editMessage: chatEdit,
  toggleReaction: chatReact,
  pinMessage: chatPin,
  unpinMessage: chatUnpin,
  loadMoreMessages,
  leaveGroup: chatLeave,
  removeMember: chatRemove,
  blockMember: chatBlock,
  unblockMember: chatUnblock,
  starMessage,
  unstarMessage,
  startListening,
  conversationName,
  conversationInitials,
  isMyMessage,
  isOnline,
  getLastSeen,
  formatDate,
} = useChat()

const { teamApi } = useApi()
const { isConnected } = useSocket()
const { user } = useAuth()

const showModal = ref(false)
const showMembers = ref(true)
const loadingMessages = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)
const inputRef = ref<{ focus: () => void; getDraft: () => string } | null>(null)

// Search
const searchQuery = ref('')

// Reply state
const replyingTo = ref<{ _id: string; content: string; senderName: string } | null>(null)

// Scroll-to-bottom button visibility
const isAtBottom = ref(true)

// Highlighted message (scroll-to-original animation)
const highlightedId = ref<string | null>(null)

// Lightbox
const lightboxImage = ref<MessageAttachment | null>(null)
const lightboxImages = ref<MessageAttachment[]>([])

// Pinned panel
const showPinned = ref(false)

// Draft message persistence
const draftToRestore = ref('')

// Typing label for multiple users
const typingLabel = computed(() => {
  const users = typingUsers.value
  if (users.length === 0) return ''
  if (users.length === 1) return users[0]
  if (users.length === 2) return `${users[0]} and ${users[1]}`
  return `${users.slice(0, 2).join(', ')} and ${users.length - 2} more`
})

// Forward modal
const forwardMessage = ref<ChatMessage | null>(null)

// Thread panel
const threadMessage = ref<ChatMessage | null>(null)

// Starred panel
const showStarred = ref(false)

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

function teamFromMemberMap(): TeamMember[] {
  return Array.from(memberMap.value.entries()).map(([_id, name]) => ({
    _id, name, email: '', role: 'admin' as const, isActive: true, isEmailVerified: true, createdAt: '',
  }))
}

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
    await loadConversations(teamFromMemberMap())
    selectedToAdd.value = new Set()
    addMemberSearch.value = ''
    showAddMembers.value = false
  }
}

// Search filter
const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) return messages.value
  const q = searchQuery.value.toLowerCase()
  return messages.value.filter(m => m.content.toLowerCase().includes(q))
})

// Map messageId → message for resolving replyTo
const messageMap = computed(() => {
  const map = new Map<string, ChatMessage>()
  for (const m of messages.value) map.set(m._id, m as ChatMessage)
  return map
})

// Group messages by calendar date
const groupedMessages = computed(() => {
  const groups: Record<string, ChatMessage[]> = {}
  for (const msg of filteredMessages.value) {
    const key = new Date(msg.createdAt).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key]!.push(msg as ChatMessage)
  }
  return groups
})

function senderName(senderId: string): string {
  return memberMap.value.get(senderId) ?? senderId.slice(-4)
}

let selectingConvId = ''

async function handleSelect(id: string) {
  // Save draft from the current conversation before switching
  if (activeConversationId.value && inputRef.value) {
    const draft = inputRef.value.getDraft()
    if (draft.trim()) localStorage.setItem(`chat-draft:${activeConversationId.value}`, draft)
    else localStorage.removeItem(`chat-draft:${activeConversationId.value}`)
  }

  selectingConvId = id
  loadingMessages.value = true
  await selectConversation(id)

  // Guard: user may have switched again while awaiting
  if (selectingConvId !== id) return

  loadingMessages.value = false
  draftToRestore.value = localStorage.getItem(`chat-draft:${id}`) ?? ''
  scrollToBottom()
  nextTick(() => inputRef.value?.focus())
}

async function onSend(content: string, files: File[] = []) {
  await chatSend(content, files, replyingTo.value?._id)
  replyingTo.value = null
  scrollToBottom()
}

function startReply(msg: ChatMessage) {
  replyingTo.value = {
    _id: msg._id,
    content: msg.content,
    senderName: senderName(msg.senderId),
  }
  nextTick(() => inputRef.value?.focus())
}

async function handleEdit(messageId: string, content: string) {
  await chatEdit(messageId, content)
}

async function handleReact(messageId: string, emoji: string) {
  await chatReact(messageId, emoji)
}

async function handlePin(messageId: string) {
  if (!activeConversation.value) return
  await chatPin(activeConversation.value._id, messageId)
}

async function handleUnpin(messageId: string) {
  if (!activeConversation.value) return
  await chatUnpin(activeConversation.value._id, messageId)
}

async function handleStar(messageId: string) {
  if (starredIds.value.has(messageId)) {
    await unstarMessage(messageId)
  } else {
    await starMessage(messageId)
  }
}

async function handleStarNavigate(conversationId: string, messageId: string) {
  if (activeConversationId.value !== conversationId) {
    await handleSelect(conversationId)
  }
  await nextTick()
  scrollToMessage(messageId)
}

const conversationNameMap = computed(() => {
  const map = new Map<string, string>()
  for (const conv of conversations.value) {
    map.set(conv._id, conversationName(conv as Conversation))
  }
  return map
})

/** Extract the first HTTP(S) URL from a message's content, or null */
function extractUrl(content: string): string | null {
  const match = content.match(/https?:\/\/[^\s<>"]+/)
  return match ? match[0]!.replace(/[.,;:!?)\]]+$/, '') : null
}

function openLightbox(attachment: MessageAttachment, allImages: MessageAttachment[]) {
  lightboxImages.value = allImages
  lightboxImage.value = attachment
}

function scrollToMessage(messageId: string) {
  const el = scrollRef.value?.querySelector(`[data-msg-id="${messageId}"]`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // Re-trigger animation if clicking the same message again
  highlightedId.value = null
  nextTick(() => { highlightedId.value = messageId })
  setTimeout(() => { if (highlightedId.value === messageId) highlightedId.value = null }, 2200)
}

function onTyping(isTyping: boolean) {
  sendTyping(isTyping)
}

async function deleteMessage(id: string) {
  await chatDelete(id)
}

async function handleCreated(id: string) {
  showModal.value = false
  await loadConversations(teamFromMemberMap())
  await handleSelect(id)
}

// ── Member actions ────────────────────────────────────────────────────────

const memberActionLoading = ref<Set<string>>(new Set())

function setMemberLoading(userId: string, isLoading: boolean) {
  const s = new Set(memberActionLoading.value)
  if (isLoading) s.add(userId)
  else s.delete(userId)
  memberActionLoading.value = s
}

async function leaveGroup() {
  if (!activeConversation.value) return
  if (!confirm('Leave this group? You will need to be re-added to rejoin.')) return
  setMemberLoading(currentUserId.value, true)
  await chatLeave(activeConversation.value._id)
  setMemberLoading(currentUserId.value, false)
}

async function removeMember(userId: string) {
  if (!activeConversation.value) return
  setMemberLoading(userId, true)
  await chatRemove(activeConversation.value._id, userId)
  setMemberLoading(userId, false)
}

async function toggleBlock(userId: string) {
  if (!activeConversation.value) return
  setMemberLoading(userId, true)
  const isBlocked = activeConversation.value.blockedMembers?.includes(userId)
  if (isBlocked) {
    await chatUnblock(activeConversation.value._id, userId)
  } else {
    await chatBlock(activeConversation.value._id, userId)
  }
  setMemberLoading(userId, false)
}

function scrollToBottom() {
  nextTick(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }))
}

// Only scroll to bottom when the last message changes (new message arrived),
// not when old messages are prepended at the top.
watch(
  () => messages.value[messages.value.length - 1]?._id,
  (newId, oldId) => {
    if (newId && newId !== oldId && !messageLoadingMore.value) scrollToBottom()
  },
)
watch(typingUsers, (users) => { if (users.length > 0) scrollToBottom() })

// ── Infinite scroll (load older messages on scroll-to-top) ────────────────

async function handleLoadMore() {
  if (!messageHasMore.value || messageLoadingMore.value) return
  const el = scrollRef.value
  if (!el) return
  const prevScrollHeight = el.scrollHeight
  await loadMoreMessages()
  await nextTick()
  // Restore position so the view doesn't jump
  el.scrollTop = el.scrollHeight - prevScrollHeight
}

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  isAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  if (el.scrollTop <= 80) handleLoadMore()
}

// Attach/detach the scroll listener whenever the container mounts/unmounts
watch(scrollRef, (el, prev) => {
  prev?.removeEventListener('scroll', onScroll)
  el?.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => scrollRef.value?.removeEventListener('scroll', onScroll))

onMounted(async () => {
  const team = await teamApi.getAll()
  teamMembers.value = team
  memberMap.value = new Map(team.map((m) => [m._id, m.name]))
  await loadConversations(team)
  startListening()
})
</script>
