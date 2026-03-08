<template>
  <div class="flex h-full -m-6 overflow-hidden">
    <!-- ── Conversation sidebar ─────────────────────────────────────── -->
    <div class="w-72 flex-shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col h-full">
      <ConversationList
        :conversations="conversations as Conversation[]"
        :archived-conversations="archivedConversations as Conversation[]"
        :active-id="activeConversationId"
        @select="handleSelect"
        @unarchive="(id) => archiveConversation(id, false)"
        @new="showModal = true"
      />

      <!-- My status footer — always accessible -->
      <div class="flex-shrink-0 border-t border-slate-800/60 px-3 py-2.5">
        <div class="relative">
          <button
            ref="statusBtnRef"
            @click.stop="showStatusPicker = !showStatusPicker"
            class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors text-left"
          >
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {{ (user?.name ?? '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-300 truncate">{{ user?.name ?? 'Me' }}</p>
              <p v-if="myStatus?.text" class="text-[10px] text-gray-500 truncate">
                {{ myStatus.emoji }} {{ myStatus.text }}
              </p>
              <p v-else class="text-[10px] text-gray-700">Set a status…</p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <Teleport to="body">
            <div
              v-if="showStatusPicker"
              class="fixed z-[9999]"
              :style="statusPickerStyle"
              @click.stop
            >
              <UserStatusPicker
                :current-emoji="myStatus?.emoji"
                :current-text="myStatus?.text"
                @save="handleSetStatus"
                @close="showStatusPicker = false"
              />
            </div>
            <div v-if="showStatusPicker" class="fixed inset-0 z-[9998]" @click="showStatusPicker = false" />
          </Teleport>
        </div>
      </div>
    </div>

    <!-- ── Message area ────────────────────────────────────────────── -->
    <div class="flex-1 flex h-full overflow-hidden">

    <!-- Main chat column -->
    <div
      class="relative flex-1 flex flex-col h-full overflow-hidden min-w-0"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent
      @dragleave="onDragLeave"
      @drop.prevent="onDropFiles"
    >

      <!-- Drag & Drop overlay -->
      <div
        v-if="isDraggingFile && activeConversation"
        class="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 border-2 border-dashed border-indigo-400/50 pointer-events-none"
      >
        <div class="text-center">
          <svg class="w-12 h-12 text-indigo-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-white font-semibold text-sm">Drop files to attach</p>
          <p class="text-indigo-300/60 text-xs mt-1">Max 5 files · 20 MB each</p>
        </div>
      </div>

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
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-white">{{ conversationName(activeConversation) }}</p>

              <!-- Rename group (admins only) -->
              <button
                v-if="activeConversation.type === 'group' && activeConversation.admins?.includes(currentUserId)"
                @click="openRenameGroup()"
                class="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-indigo-300 hover:bg-slate-800/60 transition-colors"
                title="Rename group"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
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

            <!-- Global search -->
            <button
              @click="showGlobalSearch = true"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-slate-800/60 transition-colors"
              title="Search messages (Ctrl+K)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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

            <!-- Archive conversation -->
            <button
              @click="handleArchive(!activeConversation.archived)"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="activeConversation.archived ? 'bg-amber-500/20 text-amber-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              :title="activeConversation.archived ? 'Unarchive conversation' : 'Archive conversation'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>

            <!-- Disappearing messages toggle -->
            <div class="relative ml-1">
              <button
                @click.stop="showDisappearingMenu = !showDisappearingMenu"
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                :class="activeConversation.disappearingMessages?.enabled
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
                title="Disappearing messages"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <Teleport to="body">
                <div
                  v-if="showDisappearingMenu"
                  class="fixed z-[9990] w-44 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 py-1 overflow-hidden"
                  style="top:56px;right:16px"
                  @click.stop
                >
                  <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-1.5">Auto-delete messages</p>
                  <button
                    v-for="opt in disappearingOptions"
                    :key="opt.label"
                    @click="setDisappearing(opt.enabled, opt.ttl)"
                    class="w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors"
                    :class="(!opt.enabled && !activeConversation.disappearingMessages?.enabled) ||
                      (opt.enabled && activeConversation.disappearingMessages?.enabled && activeConversation.disappearingMessages?.ttl === opt.ttl)
                      ? 'text-indigo-300 bg-indigo-500/10'
                      : 'text-gray-400 hover:bg-slate-800/60'"
                  >
                    {{ opt.label }}
                    <svg v-if="(!opt.enabled && !activeConversation.disappearingMessages?.enabled) ||
                      (opt.enabled && activeConversation.disappearingMessages?.enabled && activeConversation.disappearingMessages?.ttl === opt.ttl)"
                      class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <div v-if="showDisappearingMenu" class="fixed inset-0 z-[9989]" @click="showDisappearingMenu = false" />
              </Teleport>
            </div>

            <!-- Media gallery toggle -->
            <button
              @click="showMediaGallery = !showMediaGallery"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="showMediaGallery ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              title="Media & Files"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <!-- Scheduled messages toggle -->
            <button
              v-if="convScheduledMsgs.length > 0"
              @click="showScheduledPanel = !showScheduledPanel"
              class="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-colors relative"
              :class="showScheduledPanel ? 'bg-violet-500/20 text-violet-400' : 'text-gray-600 hover:text-gray-400 hover:bg-slate-800/60'"
              title="Scheduled messages"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-violet-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{{ convScheduledMsgs.length }}</span>
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
                  :participants-count="activeConversation.participants.length"
                  :highlighted="msg._id === highlightedId"
                  :is-starred="starredIds.has(msg._id)"
                  :member-map="memberMap"
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
                  @vote="handleVotePoll"
                  @create-task="handleCreateTask"
                  @remind="handleRemind"
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
          @schedule="handleScheduleMessage"
          @typing="onTyping"
          @cancel-reply="replyingTo = null"
          @poll="handleCreatePoll"
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
              <!-- Custom status -->
              <p
                v-if="customStatusMap.get(participantId)?.text"
                class="text-[10px] text-gray-500 truncate max-w-[120px]"
              >{{ customStatusMap.get(participantId)?.emoji }} {{ customStatusMap.get(participantId)?.text }}</p>

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

    <!-- ── Media Gallery panel ──────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <MediaGallery
        v-if="activeConversation && showMediaGallery"
        :messages="messages as ChatMessage[]"
        @close="showMediaGallery = false"
        @open-image="(img, imgs) => openLightbox(img, imgs)"
      />
    </Transition>

    <!-- ── Scheduled messages panel ──────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-4"
    >
      <div
        v-if="showScheduledPanel && activeConversation"
        class="w-60 flex-shrink-0 border-l border-slate-800/60 flex flex-col h-full bg-slate-900/40"
      >
        <div class="px-3 py-3 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled</span>
          <button @click="showScheduledPanel = false" class="text-gray-600 hover:text-gray-300 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="convScheduledMsgs.length === 0" class="flex flex-col items-center justify-center h-32 text-center px-4">
            <p class="text-xs text-gray-600">No scheduled messages</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="s in convScheduledMsgs"
              :key="s.id"
              class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5"
            >
              <p class="text-xs text-gray-300 line-clamp-3 mb-1.5">{{ s.content || '(no text)' }}</p>
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] text-violet-400">
                  {{ new Date(s.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <button
                  @click="cancelScheduled(s.id)"
                  class="text-[10px] text-gray-600 hover:text-rose-400 transition-colors"
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    </div><!-- end message area flex wrapper -->

    <!-- ── Global Search ───────────────────────────────────────────── -->
    <Teleport to="body">
      <GlobalSearch
        v-if="showGlobalSearch"
        :member-map="memberMap"
        :conversation-name-map="conversationNameMap"
        @close="showGlobalSearch = false"
        @navigate="handleStarNavigate"
      />
    </Teleport>

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

    <!-- Rename group modal (simple prompt-like modal) -->
    <Teleport to="body">
      <div v-if="showRenameModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/60" @click="showRenameModal = false" />
        <div class="relative w-[360px] max-w-[92vw] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white">Rename group</p>
            <button @click="showRenameModal = false" class="text-gray-600 hover:text-gray-300 transition-colors" title="Close">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-600">This will update the name for all members.</p>

          <input
            v-model="renameGroupName"
            type="text"
            maxlength="60"
            class="mt-3 w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            placeholder="Group name"
            @keydown.enter.prevent="confirmRenameGroup"
          />

          <div class="mt-4 flex items-center justify-end gap-2">
            <button
              @click="showRenameModal = false"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-slate-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmRenameGroup"
              :disabled="renamingGroup || !renameGroupName.trim()"
              class="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {{ renamingGroup ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Create Task from Message modal ──────────────────────── -->
    <Teleport to="body">
      <div v-if="createTaskMessage" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/60" @click="createTaskMessage = null" />
        <div class="relative w-[400px] max-w-[92vw] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-5" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-white">Create Task</p>
            <button @click="createTaskMessage = null" class="text-gray-600 hover:text-gray-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Source message preview -->
          <div class="mb-3 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl">
            <p class="text-[10px] text-gray-600 mb-0.5">From message</p>
            <p class="text-xs text-gray-400 line-clamp-2">{{ createTaskMessage.content || '📎 Attachment' }}</p>
          </div>

          <!-- Title -->
          <div class="mb-3">
            <label class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1 block">Task Title</label>
            <input
              v-model="createTaskTitle"
              type="text"
              maxlength="120"
              placeholder="Task title…"
              class="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
              @keydown.enter.prevent="confirmCreateTask"
            />
          </div>

          <!-- Project -->
          <div class="mb-4">
            <label class="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1 block">Project</label>
            <select
              v-model="createTaskProjectId"
              class="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="" disabled>Select a project…</option>
              <option v-for="p in createTaskProjects" :key="p._id" :value="p._id">{{ p.name }}</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2">
            <button
              @click="createTaskMessage = null"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-slate-800/60 transition-colors"
            >Cancel</button>
            <button
              @click="confirmCreateTask"
              :disabled="createTaskLoading || !createTaskTitle.trim() || !createTaskProjectId"
              class="px-4 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >{{ createTaskLoading ? 'Creating…' : 'Create Task' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Message Reminder popup ───────────────────────────────── -->
    <Teleport to="body">
      <div v-if="reminderMessage" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/60" @click="reminderMessage = null" />
        <div class="relative w-[300px] max-w-[92vw] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-5" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-white">Set Reminder</p>
            <button @click="reminderMessage = null" class="text-gray-600 hover:text-gray-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Message preview -->
          <div class="mb-4 px-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl">
            <p class="text-[10px] text-gray-600 mb-0.5">Reminding you about</p>
            <p class="text-xs text-gray-400 line-clamp-2">{{ reminderMessage.content || '📎 Attachment' }}</p>
          </div>

          <!-- Time options -->
          <div class="flex flex-col gap-1.5">
            <button
              v-for="opt in getReminderOptions()"
              :key="opt.label"
              @click="setReminder(opt.minutes)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30 transition-colors text-left"
            >
              <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs font-medium text-gray-300">{{ opt.label }}</p>
                <p class="text-[10px] text-gray-600">{{ opt.desc }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, Conversation, MessageAttachment, Project, TeamMember } from '~/types'

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
  loadMessagesAround,
  leaveGroup: chatLeave,
  removeMember: chatRemove,
  blockMember: chatBlock,
  unblockMember: chatUnblock,
  starMessage,
  unstarMessage,
  customStatusMap,
  setMyStatus,
  votePoll,
  setDisappearingMessages,
  archiveConversation,
  loadArchivedConversations,
  archivedConversations,
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
const inputRef = ref<{ focus: () => void; getDraft: () => string; addFiles: (files: File[]) => void } | null>(null)

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

// Global search
const showGlobalSearch = ref(false)

// Rename group modal
const showRenameModal = ref(false)
const renameGroupName = ref('')
const renamingGroup = ref(false)

// User status picker
const showStatusPicker = ref(false)
const statusBtnRef = ref<HTMLElement | null>(null)
const statusPickerStyle = ref('')
const myStatus = computed(() =>
  currentUserId.value ? customStatusMap.value.get(currentUserId.value) : undefined
)

watch(showStatusPicker, (val) => {
  if (!val || !statusBtnRef.value) return
  nextTick(() => {
    const rect = statusBtnRef.value!.getBoundingClientRect()
    // Open upward from the sidebar footer button
    statusPickerStyle.value = `bottom:${window.innerHeight - rect.top + 6}px;left:${rect.left}px`
  })
})

function handleSetStatus(emoji: string, text: string) {
  setMyStatus(emoji, text)
}

async function handleVotePoll(messageId: string, optionIndex: number) {
  await votePoll(messageId, optionIndex)
}

async function handleCreatePoll(question: string, options: string[]) {
  if (!activeConversation.value) return
  const { chatApi } = useApi()
  await chatApi.createPoll(activeConversation.value._id, question, options)
}

// Disappearing messages — TTL dropdown state
const showDisappearingMenu = ref(false)
const disappearingOptions = [
  { label: 'Off', ttl: 0, enabled: false },
  { label: '1 hour', ttl: 3600, enabled: true },
  { label: '24 hours', ttl: 86400, enabled: true },
  { label: '7 days', ttl: 604800, enabled: true },
]

async function setDisappearing(enabled: boolean, ttl: number) {
  if (!activeConversation.value) return
  await setDisappearingMessages(activeConversation.value._id, enabled, ttl)
  showDisappearingMenu.value = false
}

// Archive / unarchive current conversation
async function handleArchive(archive: boolean) {
  if (!activeConversation.value) return
  await archiveConversation(activeConversation.value._id, archive)
}

// ── Feature 1: Drag & Drop ────────────────────────────────────────────────────
const isDraggingFile = ref(false)
let _dragCounter = 0

function onDragEnter() {
  _dragCounter++
  isDraggingFile.value = true
}

function onDragLeave() {
  _dragCounter--
  if (_dragCounter <= 0) {
    _dragCounter = 0
    isDraggingFile.value = false
  }
}

function onDropFiles(e: DragEvent) {
  isDraggingFile.value = false
  _dragCounter = 0
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length > 0) inputRef.value?.addFiles(files)
}

// ── Feature 2: Media Gallery ──────────────────────────────────────────────────
const showMediaGallery = ref(false)

// ── Feature 4: Create Task from Message ──────────────────────────────────────
const createTaskMessage = ref<ChatMessage | null>(null)
const createTaskTitle = ref('')
const createTaskProjectId = ref('')
const createTaskProjects = ref<Project[]>([])
const createTaskLoading = ref(false)

async function handleCreateTask(msg: ChatMessage) {
  createTaskTitle.value = (msg.content ?? '').slice(0, 80).trim()
  createTaskLoading.value = false
  const { projectsApi } = useApi()
  createTaskProjects.value = await projectsApi.getAll()
  if (createTaskProjects.value.length > 0 && !createTaskProjectId.value) {
    createTaskProjectId.value = createTaskProjects.value[0]!._id
  }
  createTaskMessage.value = msg
}

async function confirmCreateTask() {
  if (!createTaskMessage.value || !createTaskTitle.value.trim() || !createTaskProjectId.value) return
  createTaskLoading.value = true
  const { tasksApi } = useApi()
  const task = await tasksApi.create(
    { title: createTaskTitle.value.trim(), description: `From chat: ${createTaskMessage.value.content ?? ''}` },
    createTaskProjectId.value,
  )
  createTaskLoading.value = false
  if (task) {
    createTaskMessage.value = null
    useToast().success('Task created successfully')
  }
}

// ── Feature 5: Message Reminder ───────────────────────────────────────────────
const reminderMessage = ref<ChatMessage | null>(null)

interface ReminderEntry { messageId: string; content: string; fireAt: number }

function getReminderOptions() {
  const now = new Date()
  const tom9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0)
  const minsToTom9 = Math.max(1, Math.round((tom9.getTime() - now.getTime()) / 60000))
  return [
    { label: 'In 30 minutes', desc: 'Quick reminder', minutes: 30 },
    { label: 'In 1 hour', desc: 'In a bit', minutes: 60 },
    { label: 'In 4 hours', desc: 'Later today', minutes: 240 },
    { label: 'Tomorrow at 9 AM', desc: 'Fresh start', minutes: minsToTom9 },
  ]
}

function handleRemind(msg: ChatMessage) {
  reminderMessage.value = msg
}

function scheduleReminder(r: ReminderEntry) {
  const delay = r.fireAt - Date.now()
  if (delay <= 0) return
  setTimeout(() => {
    useToast().info(`⏰ Reminder: "${(r.content ?? '').slice(0, 60)}${(r.content ?? '').length > 60 ? '…' : ''}"`)
    try {
      const items: ReminderEntry[] = JSON.parse(localStorage.getItem('chat-reminders') ?? '[]')
      localStorage.setItem('chat-reminders', JSON.stringify(items.filter((i) => i.messageId !== r.messageId)))
    } catch { /* ignore */ }
  }, Math.min(delay, 2_147_483_647))
}

function setReminder(minutes: number) {
  if (!reminderMessage.value) return
  const msg = reminderMessage.value
  const fireAt = Date.now() + minutes * 60 * 1000
  const entry: ReminderEntry = { messageId: msg._id, content: msg.content ?? '', fireAt }
  try {
    const items: ReminderEntry[] = JSON.parse(localStorage.getItem('chat-reminders') ?? '[]')
    localStorage.setItem('chat-reminders', JSON.stringify([...items.filter((i) => i.messageId !== msg._id), entry]))
  } catch { /* ignore */ }
  scheduleReminder(entry)
  reminderMessage.value = null
  const label = minutes < 60 ? `${minutes} min` : minutes < 1440 ? `${minutes / 60} hr` : 'tomorrow'
  useToast().success(`Reminder set for ${label}`)
}

function loadReminders() {
  try {
    const items: ReminderEntry[] = JSON.parse(localStorage.getItem('chat-reminders') ?? '[]')
    const now = Date.now()
    for (const r of items) {
      if (r.fireAt > now) scheduleReminder(r)
    }
    localStorage.setItem('chat-reminders', JSON.stringify(items.filter((r) => r.fireAt > now)))
  } catch { /* ignore */ }
}

// ── Scheduled Messages ────────────────────────────────────────────────────────
interface ScheduledMsg { id: string; convId: string; content: string; files: string[]; scheduledFor: number }

const scheduledMsgs = ref<ScheduledMsg[]>([])
const showScheduledPanel = ref(false)

function loadScheduled() {
  try {
    scheduledMsgs.value = JSON.parse(localStorage.getItem('chat-scheduled-msgs') ?? '[]')
    const now = Date.now()
    // fire any that are overdue
    for (const s of scheduledMsgs.value) {
      if (s.scheduledFor <= now) armScheduled(s)
    }
  } catch { scheduledMsgs.value = [] }
}

function saveScheduled() {
  localStorage.setItem('chat-scheduled-msgs', JSON.stringify(scheduledMsgs.value))
}

function armScheduled(s: ScheduledMsg) {
  const delay = Math.max(0, s.scheduledFor - Date.now())
  setTimeout(async () => {
    if (!scheduledMsgs.value.find((x) => x.id === s.id)) return
    try {
      const { chatApi } = useApi()
      await chatApi.sendMessage(s.convId, s.content, undefined, [])
      useToast().success('Scheduled message sent.')
    } catch {
      useToast().error('Failed to send scheduled message.')
    }
    scheduledMsgs.value = scheduledMsgs.value.filter((x) => x.id !== s.id)
    saveScheduled()
  }, Math.min(delay, 2_147_483_647))
}

function handleScheduleMessage(content: string, _files: File[], scheduledFor: number) {
  if (!activeConversation.value) return
  const entry: ScheduledMsg = {
    id: `${Date.now()}-${Math.random()}`,
    convId: activeConversation.value._id,
    content,
    files: [],
    scheduledFor,
  }
  scheduledMsgs.value = [...scheduledMsgs.value, entry]
  saveScheduled()
  armScheduled(entry)
  const timeStr = new Date(scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  useToast().success(`Message scheduled for ${timeStr}`)
}

function cancelScheduled(id: string) {
  scheduledMsgs.value = scheduledMsgs.value.filter((s) => s.id !== id)
  saveScheduled()
}

const convScheduledMsgs = computed(() =>
  scheduledMsgs.value.filter((s) => s.convId === activeConversation.value?._id)
)

onMounted(() => {
  loadReminders()
  loadScheduled()

  function handleCtrlK(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      showGlobalSearch.value = !showGlobalSearch.value
    }
  }
  window.addEventListener('keydown', handleCtrlK)
  onUnmounted(() => window.removeEventListener('keydown', handleCtrlK))
})

const currentUserId = computed(() => user.value?.id ?? '')

function openRenameGroup() {
  if (!activeConversation.value || activeConversation.value.type !== 'group') return
  showRenameModal.value = true
  renameGroupName.value = activeConversation.value.name ?? ''
}

async function confirmRenameGroup() {
  if (!activeConversation.value || activeConversation.value.type !== 'group') return
  const name = renameGroupName.value.trim()
  if (!name) return
  renamingGroup.value = true
  const { chatApi } = useApi()
  const updated = await chatApi.updateGroup(activeConversation.value._id, { name })
  renamingGroup.value = false
  if (updated) {
    // Optimistic UI update (socket will also sync all members)
    await loadConversations(teamFromMemberMap())
    showRenameModal.value = false
  }
}

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
  // If message isn't currently rendered (older than current page), load a context window around it.
  const exists = messages.value.some((m) => m._id === messageId)
  if (!exists) {
    const ok = await loadMessagesAround(conversationId, messageId, 60)
    if (ok) {
      await nextTick()
    }
  }
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
  await loadArchivedConversations()
  startListening()
})
</script>
