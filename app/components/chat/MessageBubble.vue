<template>
  <div
    :data-msg-id="message._id"
    class="flex gap-2 group/bubble rounded-2xl"
    :class="[mine ? 'flex-row-reverse' : 'flex-row', highlighted && 'msg-highlight']"
  >
    <!-- Avatar (other person only) -->
    <div v-if="!mine" class="relative flex-shrink-0 self-end w-7">
      <template v-if="!isGrouped">
        <div
          class="w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shadow-md"
          :class="senderGradient"
        >
          {{ senderInitials }}
        </div>
        <span
          v-if="isOnline(message.senderId)"
          class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-900"
        />
      </template>
    </div>

    <div class="max-w-[70%] flex flex-col" :class="mine ? 'items-end' : 'items-start'">

      <!-- Sender name (other people only, not grouped) -->
      <span
        v-if="!mine && senderName && !isGrouped"
        class="text-[11px] font-semibold mb-1 px-1 leading-none"
        :class="senderNameColor"
      >{{ senderName }}</span>

      <!-- Reply preview (quoted message) -->
      <div
        v-if="replyToMessage && !message.isDeleted"
        class="flex items-start gap-1.5 mb-1 px-2.5 py-1.5 rounded-xl border-l-2 max-w-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        :class="mine
          ? 'bg-indigo-800/40 border-indigo-400/60 self-end'
          : 'bg-slate-800/60 border-slate-500/60'"
        @click="message.replyTo && $emit('scroll-to', message.replyTo)"
      >
        <div class="min-w-0">
          <p class="text-[10px] font-semibold mb-0.5" :class="mine ? 'text-indigo-300' : 'text-gray-400'">
            {{ replyToMessage.senderName }}
          </p>
          <p class="text-[11px] text-gray-400 truncate max-w-[220px]">
            {{ replyToMessage.content || '📎 Attachment' }}
          </p>
        </div>
      </div>

      <!-- Deleted message -->
      <div
        v-if="message.isDeleted"
        class="px-3 py-2 rounded-2xl text-xs text-gray-600 italic border border-slate-700/40"
        :class="mine ? 'rounded-tr-sm' : 'rounded-tl-sm'"
      >
        Message deleted
      </div>

      <template v-else>
        <!-- Edit mode -->
        <div v-if="isEditMode" class="w-full">
          <textarea
            ref="editTextareaRef"
            v-model="editContent"
            @keydown.enter.exact.prevent="saveEdit"
            @keydown.escape="cancelEdit"
            rows="2"
            class="w-full bg-slate-700/60 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none resize-none"
          />
          <div class="flex gap-1.5 mt-1" :class="mine ? 'justify-end' : 'justify-start'">
            <button
              @click="saveEdit"
              class="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium hover:bg-indigo-500/30 transition-colors"
            >Save</button>
            <button
              @click="cancelEdit"
              class="px-2.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/30 text-gray-400 text-[10px] hover:bg-slate-700/60 transition-colors"
            >Cancel</button>
          </div>
        </div>

        <template v-else>
          <!-- Forwarded indicator -->
          <div
            v-if="message.forwardedFrom"
            class="flex items-center gap-1 text-[10px] mb-1"
            :class="mine ? 'text-indigo-300/70 justify-end' : 'text-sky-400/80'"
          >
            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Forwarded from <span class="font-medium">{{ message.forwardedFrom.senderName }}</span></span>
          </div>

          <!-- Poll -->
          <PollMessage
            v-if="message.type === 'poll' && message.poll"
            :poll="message.poll"
            :current-user-id="currentUserId"
            :mine="mine"
            :is-deleted="message.isDeleted"
            @vote="(idx) => emit('vote', message._id, idx)"
          />

          <!-- Text bubble -->
          <div
            v-if="message.content && message.type !== 'poll'"
            class="px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
            :class="mine
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
              : 'bg-slate-800/80 text-gray-200 rounded-tl-sm border border-slate-700/40'"
            v-html="renderedContent"
          />

          <!-- Attachments -->
          <div v-if="message.attachments?.length" class="flex flex-col gap-1.5 mt-1 w-full">
            <div
              v-if="imageAttachments.length"
              class="flex flex-wrap gap-1"
              :class="mine ? 'justify-end' : 'justify-start'"
            >
              <button
                v-for="img in imageAttachments"
                :key="img.url"
                @click="$emit('open-image', img)"
                class="block rounded-xl overflow-hidden border border-slate-700/40 hover:opacity-90 transition-opacity cursor-zoom-in"
                :style="imageAttachments.length === 1 ? 'max-width:240px' : 'width:112px;height:112px'"
              >
                <img :src="img.url" :alt="img.originalName" loading="lazy" class="object-cover w-full h-full"
                  :style="imageAttachments.length === 1 ? 'max-height:200px' : ''" />
              </button>
            </div>
            <!-- Audio attachments (voice messages) -->
            <div
              v-for="audio in audioAttachments"
              :key="audio.url"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl border max-w-[260px]"
              :class="mine
                ? 'bg-indigo-700/50 border-indigo-500/30'
                : 'bg-slate-800/80 border-slate-700/40'"
            >
              <svg class="w-4 h-4 flex-shrink-0 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zm-1 9V6a1 1 0 112 0v6a1 1 0 11-2 0zm-4 .5a5 5 0 0010 0h2a7 7 0 01-14 0h2z"/>
              </svg>
              <audio :src="audio.url" controls preload="metadata"
                class="h-7 flex-1 min-w-0"
                style="filter: invert(0.8) hue-rotate(200deg) brightness(1.2);"
              />
            </div>

            <a
              v-for="file in fileAttachments"
              :key="file.url"
              :href="file.url"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors max-w-[240px]"
              :class="mine
                ? 'bg-indigo-700/50 border-indigo-500/30 text-indigo-100 hover:bg-indigo-700/70'
                : 'bg-slate-800/80 border-slate-700/40 text-gray-300 hover:bg-slate-700/60'"
            >
              <svg class="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="truncate flex-1">{{ file.originalName }}</span>
              <span v-if="file.size" class="opacity-50 flex-shrink-0">{{ formatBytes(file.size) }}</span>
            </a>
          </div>

          <!-- Delivery status + read receipts (own messages only) -->
          <div v-if="mine" class="flex items-center gap-1 mt-0.5 select-none">
            <!-- Sending spinner -->
            <svg v-if="receiptState === 'sending'" class="w-2.5 h-2.5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>

            <!-- Sent (✓) -->
            <svg v-else-if="receiptState === 'sent'" class="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Sent">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>

            <!-- Delivered (✓✓) -->
            <svg v-else-if="receiptState === 'delivered'" class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Delivered">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 12l4 4L18 6" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 12l4 4L22 6" />
            </svg>

            <!-- Read (colored ✓✓) + read-by list -->
            <div v-else class="flex items-center gap-1">
              <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Read">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 12l4 4L18 6" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 12l4 4L22 6" />
              </svg>
              <button
                v-if="readCount > 0"
                ref="readByBtnRef"
                @click.stop="showReadBy = !showReadBy"
                class="text-[11px] text-indigo-300/50 hover:text-indigo-200/80 transition-colors underline-offset-2 hover:underline"
              >Seen by {{ readCount }}</button>
            </div>
          </div>

          <!-- Read-by popover -->
          <Teleport to="body">
            <div
              v-if="showReadBy && readByList.length"
              class="fixed z-[9999] min-w-[160px] bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 py-1.5 px-0.5"
              :style="readByPopoverStyle"
              @click.stop
            >
              <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-600 px-3 pb-1">Read by</p>
              <div
                v-for="r in readByList"
                :key="r.userId"
                class="flex items-center justify-between gap-3 px-3 py-1"
              >
                <span class="text-[11px] text-gray-300">{{ r.name }}</span>
                <span class="text-[9px] text-gray-600 flex-shrink-0">{{ formatTime(r.readAt) }}</span>
              </div>
            </div>
            <div v-if="showReadBy" class="fixed inset-0 z-[9998]" @click="showReadBy = false" />
          </Teleport>

          <!-- Reaction bar -->
          <div
            v-if="groupedReactions.length > 0"
            class="flex flex-wrap gap-1 mt-1.5"
            :class="mine ? 'justify-end' : 'justify-start'"
          >
            <button
              v-for="group in groupedReactions"
              :key="group.emoji"
              @click="$emit('react', message._id, group.emoji)"
              @mouseenter="openReactionDetail($event, group.emoji)"
              @mouseleave="closeReactionDetail"
              class="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] transition-all duration-150 hover:scale-110 active:scale-95"
              :class="group.reacted
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-800/60 border-slate-700/40 text-gray-400 hover:bg-slate-700/50 hover:border-slate-600/60'"
            >
              <span>{{ group.emoji }}</span>
              <span class="font-medium">{{ group.count }}</span>
            </button>
          </div>

          <!-- Reaction detail tooltip -->
          <Teleport to="body">
            <div
              v-if="showReactionDetail && reactionDetailUsers.length"
              class="fixed z-[9999] bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 px-3 py-2 min-w-[100px] max-w-[180px] pointer-events-none"
              :style="reactionDetailStyle"
            >
              <p class="text-base text-center leading-none mb-1.5">{{ reactionDetailEmoji }}</p>
              <p v-for="name in reactionDetailUsers" :key="name" class="text-[11px] text-gray-300 truncate leading-snug">{{ name }}</p>
            </div>
          </Teleport>
        </template>
      </template>

      <!-- Time + actions row -->
      <div class="flex items-center gap-2 mt-1 px-0.5" :class="mine ? 'flex-row-reverse' : 'flex-row'">
        <!-- Disappearing timer icon -->
        <svg
          v-if="message.expiresAt"
          class="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0"
          :title="`Disappears ${formatTime(message.expiresAt!)}`"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs text-gray-600" :title="fullDateTime">{{ formatTime(message.createdAt) }}</span>
        <button
          v-if="message.editedAt"
          @click.stop="emit('show-edit-history', message)"
          class="text-xs text-gray-600 hover:text-gray-400 transition-colors underline-offset-2 hover:underline"
          title="View edit history"
        >(edited)</button>

        <!-- Hover actions: ··· | emoji | forward -->
        <div
          v-if="!message.isDeleted && !isEditMode"
          class="flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 focus-within:opacity-100 transition-all duration-150 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl px-1.5 py-1 shadow-lg shadow-black/30"
          :class="mine ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Quick emoji reactions -->
          <button
            v-for="emoji in QUICK_EMOJIS"
            :key="emoji"
            @click.stop="$emit('react', message._id, emoji)"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-base hover:scale-125 active:scale-95 transition-transform hover:bg-slate-700/50"
            :title="emoji"
          >{{ emoji }}</button>
          <div class="w-px h-4 bg-slate-700/50 mx-0.5 flex-shrink-0" />

          <!-- ··· More menu -->
          <div class="relative">
            <button
              ref="moreBtnRef"
              @click.stop="toggleMoreMenu"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="More"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>

            <!-- More menu popup -->
            <Teleport to="body">
              <div v-if="showMoreMenu" class="fixed inset-0 z-[9998]" @click="showMoreMenu = false" />
              <div
                v-if="showMoreMenu"
                class="fixed z-[9999] bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 py-1.5 min-w-[180px] overflow-hidden"
                :style="moreMenuStyle"
                @click.stop
              >
                <button @click="doAction('reply')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
                <button @click="doAction('pin')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l4 4-8 8-4-4 8-8z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14l-4 4" />
                  </svg>
                  Pin
                </button>
                <button @click="doAction('star')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 flex-shrink-0" :fill="isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"
                    :class="isStarred ? 'text-amber-400' : 'text-gray-400'">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {{ isStarred ? 'Unstar' : 'Star' }}
                </button>
                <button v-if="message.content" @click="doAction('copy')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button v-if="!message.isDeleted" @click="doAction('thread')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Thread
                </button>
                <button @click="doAction('remind')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Remind me
                </button>
                <button v-if="message.content" @click="doAction('create-task')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Create task
                </button>
                <template v-if="mine && message.content">
                  <button @click="doAction('edit')"
                    class="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-200 hover:bg-slate-700/60 transition-colors text-left">
                    <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </template>
                <div v-if="mine" class="h-px bg-slate-700/60 mx-2 my-0.5" />
                <button v-if="mine" @click="doAction('delete')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Unsend
                </button>
                <button v-if="!mine" @click="doAction('report')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-base text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report
                </button>
              </div>
            </Teleport>
          </div>

          <!-- Emoji react -->
          <div class="relative">
            <button
              ref="reactionBtnRef"
              @click.stop="showReactionPicker = !showReactionPicker"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              title="React"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <Teleport to="body">
              <div v-if="showReactionPicker" class="fixed z-[9999]" :style="reactionPickerStyle" @click.stop>
                <EmojiPicker @pick="pickReaction" />
              </div>
              <div v-if="showReactionPicker" class="fixed inset-0 z-[9998]" @click="showReactionPicker = false" />
            </Teleport>
          </div>

          <!-- Forward -->
          <button
            @click="$emit('forward', message)"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
            title="Forward"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageAttachment } from '~/types';

interface ReplyPreview {
  _id: string
  content: string
  senderName: string
}

const props = defineProps<{
  message: ChatMessage
  mine: boolean
  senderName?: string
  replyToMessage?: ReplyPreview
  currentUserId?: string
  highlighted?: boolean
  isStarred?: boolean
  isGrouped?: boolean
  memberMap?: Map<string, string>
  /** Used for group read/delivered rules (ALL others). */
  participantsCount?: number
}>()

const emit = defineEmits<{
  delete: [id: string]
  reply: [message: ChatMessage]
  edit: [messageId: string, content: string]
  'scroll-to': [messageId: string]
  'open-image': [attachment: MessageAttachment]
  react: [messageId: string, emoji: string]
  pin: [messageId: string]
  forward: [message: ChatMessage]
  thread: [message: ChatMessage]
  star: [messageId: string]
  vote: [messageId: string, optionIndex: number]
  'create-task': [message: ChatMessage]
  remind: [message: ChatMessage]
  'show-edit-history': [message: ChatMessage]
}>()

const { formatTime, isOnline } = useChat()

// ── Computed helpers ──────────────────────────────────────────────────────────

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

const SENDER_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600',
]

const senderInitials = computed(() => {
  const name = props.senderName ?? 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return name.charAt(0).toUpperCase()
})

const SENDER_NAME_COLORS = [
  'text-violet-400',
  'text-rose-400',
  'text-amber-400',
  'text-emerald-400',
  'text-sky-400',
  'text-fuchsia-400',
  'text-cyan-400',
  'text-lime-400',
]

function hashName(name: string): number {
  let hash = 0
  for (const ch of name) hash = ((hash << 5) - hash) + ch.charCodeAt(0)
  return Math.abs(hash)
}

const senderGradient = computed(() => {
  const name = props.senderName ?? 'U'
  return SENDER_GRADIENTS[hashName(name) % SENDER_GRADIENTS.length]!
})

const senderNameColor = computed(() => {
  const name = props.senderName ?? 'U'
  return SENDER_NAME_COLORS[hashName(name) % SENDER_NAME_COLORS.length]!
})

const imageAttachments = computed<MessageAttachment[]>(() =>
  (props.message.attachments ?? []).filter((a) => a.mimeType.startsWith('image/')),
)

const audioAttachments = computed<MessageAttachment[]>(() =>
  (props.message.attachments ?? []).filter((a) => a.mimeType.startsWith('audio/')),
)

const fileAttachments = computed<MessageAttachment[]>(() =>
  (props.message.attachments ?? []).filter((a) => !a.mimeType.startsWith('image/') && !a.mimeType.startsWith('audio/')),
)

const groupedReactions = computed(() => {
  const map = new Map<string, { emoji: string; count: number; reacted: boolean; userIds: string[] }>()
  for (const r of (props.message.reactions ?? [])) {
    const entry = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, reacted: false, userIds: [] }
    entry.count++
    entry.userIds.push(r.userId)
    if (r.userId === props.currentUserId) entry.reacted = true
    map.set(r.emoji, entry)
  }
  return [...map.values()]
})

// ── Reaction detail tooltip ───────────────────────────────────────────────────

const showReactionDetail = ref(false)
const reactionDetailEmoji = ref('')
const reactionDetailStyle = ref('')
let _reactionDetailTimer: ReturnType<typeof setTimeout> | null = null

const reactionDetailUsers = computed(() => {
  const group = groupedReactions.value.find(g => g.emoji === reactionDetailEmoji.value)
  if (!group) return []
  return group.userIds.map(id =>
    id === props.currentUserId ? 'You' : (props.memberMap?.get(id) ?? id.slice(-4))
  )
})

function openReactionDetail(event: MouseEvent, emoji: string) {
  if (_reactionDetailTimer) { clearTimeout(_reactionDetailTimer); _reactionDetailTimer = null }
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  reactionDetailEmoji.value = emoji
  const left = Math.min(Math.max(rect.left - 40, 8), window.innerWidth - 200)
  reactionDetailStyle.value = `left:${left}px;top:${rect.top - 8}px;transform:translateY(-100%)`
  showReactionDetail.value = true
}

function closeReactionDetail() {
  _reactionDetailTimer = setTimeout(() => { showReactionDetail.value = false }, 200)
}

const readCount = computed(() => {
  const count = (props.message.readBy ?? []).filter(
    (r) => r.userId !== props.currentUserId,
  ).length
  return count
})

const deliveredCount = computed(() => {
  const count = (props.message.deliveredTo ?? []).filter(
    (r) => r.userId !== props.currentUserId,
  ).length
  return count
})

/**
 * Rule:
 * - ✓   = saved/sent (default when not sending)
 * - ✓✓  = delivered to at least 1 recipient (for private/group)
 * - colored ✓✓ = read (for group: ALL others read; for private: recipient read)
 */
const receiptState = computed<'sending' | 'sent' | 'delivered' | 'read'>(() => {
  if (props.message._status === 'sending') return 'sending'
  const participantsCount: number | null = typeof props.participantsCount === 'number' ? props.participantsCount : null

  const isGroup = !!participantsCount && participantsCount > 2

  // READ rule:
  // - private: readCount > 0
  // - group: readCount >= (participantsCount - 1)
  if (isGroup) {
    const others = Math.max(participantsCount - 1, 0)
    if (others > 0 && readCount.value >= others) return 'read'
  } else {
    if (readCount.value > 0) return 'read'
  }

  // DELIVERED rule:
  // - private: deliveredCount > 0
  // - group: deliveredCount >= (participantsCount - 1)
  if (isGroup) {
    const others = Math.max((participantsCount ?? 0) - 1, 0)
    if (others > 0 && deliveredCount.value >= others) return 'delivered'
  } else {
    if (deliveredCount.value > 0) return 'delivered'
  }
  return 'sent'
})

const fullDateTime = computed(() =>
  new Date(props.message.createdAt).toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }),
)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Rendered content ──────────────────────────────────────────────────────────

function mentionChip(name: string, isEveryone: boolean): string {
  const cls = isEveryone
    ? 'background:rgba(245,158,11,0.15);color:rgb(252,211,77);border:1px solid rgba(245,158,11,0.25);'
    : 'background:rgba(99,102,241,0.15);color:rgb(165,180,252);border:1px solid rgba(99,102,241,0.25);'
  return `<span style="${cls}padding:0 4px;border-radius:4px;font-weight:600;font-size:11px;white-space:nowrap;">@${name}</span>`
}

function linkify(text: string): string {
  return text.replace(/https?:\/\/[^\s<>"]+/g, (rawUrl) => {
    const url = rawUrl.replace(/[.,;:!?)\]]+$/, '')
    const trailing = rawUrl.slice(url.length)
    const href = url.replace(/&amp;/g, '&')
    const link = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:rgb(129,140,248);text-decoration:underline;word-break:break-all;">${url}</a>`
    return link + trailing
  })
}

const renderedContent = computed(() => {
  const raw = props.message.content

  const codeBlocks: string[] = []
  let text = raw.replace(/```([\s\S]*?)```/g, (_, code: string) => {
    const escapedCode = code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^\n/, '')
    const idx = codeBlocks.length
    codeBlocks.push(
      `<pre style="background:rgba(15,23,42,0.85);border:1px solid rgba(71,85,105,0.4);border-radius:8px;padding:8px 12px;margin:4px 0;overflow-x:auto;font-family:'Courier New',monospace;font-size:11px;line-height:1.6;color:rgb(148,163,184);white-space:pre;">${escapedCode}</pre>`
    )
    return `\x00BLOCK${idx}\x00`
  })

  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  text = text.replace(/`([^`\n]+)`/g, (_, code: string) =>
    `<code style="background:rgba(15,23,42,0.7);border:1px solid rgba(71,85,105,0.4);border-radius:4px;padding:1px 5px;font-family:'Courier New',monospace;font-size:11px;color:rgb(148,163,184);">${code}</code>`
  )
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;">$1</strong>')
  text = text.replace(/\*([^*\n]+)\*/g, '<em style="font-style:italic;">$1</em>')
  text = text.replace(/~~([^~]+)~~/g, '<s style="opacity:0.7;">$1</s>')
  text = text
    .replace(/@\[everyone\]/g, () => mentionChip('everyone', true))
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, (_, name: string) => mentionChip(name, false))
  text = linkify(text)
  text = text.replace(/\n/g, '<br>')
  text = text.replace(/\x00BLOCK(\d+)\x00/g, (_, idx: string) => codeBlocks[Number(idx)] ?? '')
  return text
})

// ── Read-by detail ────────────────────────────────────────────────────────────

const showReadBy = ref(false)
const readByBtnRef = ref<HTMLElement | null>(null)
const readByPopoverStyle = ref('')

const readByList = computed(() =>
  (props.message.readBy ?? [])
    .filter(r => r.userId !== props.currentUserId)
    .map(r => ({
      userId: r.userId,
      name: props.memberMap?.get(r.userId) ?? r.userId.slice(-4),
      readAt: r.readAt,
    }))
    .sort((a, b) => new Date(a.readAt).getTime() - new Date(b.readAt).getTime())
)

watch(showReadBy, (val) => {
  if (!val || !readByBtnRef.value) return
  nextTick(() => {
    const rect = readByBtnRef.value!.getBoundingClientRect()
    const top = rect.top - 8
    const left = Math.min(rect.left, window.innerWidth - 200)
    readByPopoverStyle.value = `top:${top}px;left:${left}px;transform:translateY(-100%)`
  })
})

// ── Copy ─────────────────────────────────────────────────────────────────────

async function copyContent() {
  await navigator.clipboard.writeText(props.message.content)
}

// ── Reaction picker ───────────────────────────────────────────────────────────

const showReactionPicker = ref(false)
const reactionPickerStyle = ref('')
const reactionBtnRef = ref<HTMLElement | null>(null)

watch(showReactionPicker, (val) => {
  if (!val) return
  nextTick(() => {
    const btn = reactionBtnRef.value
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const pickerW = 300
    const pickerH = 360
    const left = Math.min(Math.max(rect.left - pickerW / 2, 8), window.innerWidth - pickerW - 8)
    const top = rect.top - pickerH - 8 < 8
      ? rect.bottom + 8
      : rect.top - pickerH - 8
    reactionPickerStyle.value = `top:${top}px;left:${left}px`
  })
})

function pickReaction(emoji: string) {
  emit('react', props.message._id, emoji)
  showReactionPicker.value = false
}

// ── More menu ─────────────────────────────────────────────────────────────────

const showMoreMenu = ref(false)
const moreMenuStyle = ref<Record<string, string>>({})
const moreBtnRef = ref<HTMLElement | null>(null)

function toggleMoreMenu() {
  if (showMoreMenu.value) { showMoreMenu.value = false; return }
  nextTick(() => {
    const btn = moreBtnRef.value
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const menuW = 160
    const menuH = 380
    const left = Math.min(Math.max(rect.left, 8), window.innerWidth - menuW - 8)
    const top = rect.top - menuH - 8 < 8 ? rect.bottom + 6 : rect.top - menuH - 6
    moreMenuStyle.value = { top: `${top}px`, left: `${left}px` }
    showMoreMenu.value = true
  })
}

type MenuAction = 'reply' | 'pin' | 'star' | 'copy' | 'thread' | 'remind' | 'create-task' | 'edit' | 'delete' | 'report'

function doAction(action: MenuAction) {
  showMoreMenu.value = false
  switch (action) {
    case 'reply':       emit('reply', props.message); break
    case 'pin':         emit('pin', props.message._id); break
    case 'star':        emit('star', props.message._id); break
    case 'copy':        copyContent().then(() => useToast().success('Copied!')); break
    case 'thread':      emit('thread', props.message); break
    case 'remind':      emit('remind', props.message); break
    case 'create-task': emit('create-task', props.message); break
    case 'edit':        startEdit(); break
    case 'delete':      emit('delete', props.message._id); break
    case 'report':      useToast().info('Message reported.'); break
  }
}

// ── Edit ─────────────────────────────────────────────────────────────────────

const isEditMode = ref(false)
const editContent = ref('')
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)

function startEdit() {
  editContent.value = props.message.content
  isEditMode.value = true
  nextTick(() => editTextareaRef.value?.focus())
}

function cancelEdit() {
  isEditMode.value = false
  editContent.value = ''
}

function saveEdit() {
  const trimmed = editContent.value.trim()
  if (!trimmed || trimmed === props.message.content) {
    cancelEdit()
    return
  }
  emit('edit', props.message._id, trimmed)
  isEditMode.value = false
}
</script>

<style scoped>
@keyframes msg-highlight {
  0%   {
    background-color: rgba(99, 102, 241, 0);
    box-shadow: none;
    transform: scale(1);
  }
  6%   {
    background-color: rgba(99, 102, 241, 0.28);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.55),
                0 0 28px rgba(99, 102, 241, 0.22),
                inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    transform: scale(1.009);
  }
  22%  {
    background-color: rgba(99, 102, 241, 0.18);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35),
                0 0 16px rgba(99, 102, 241, 0.14);
    transform: scale(1.003);
  }
  55%  {
    background-color: rgba(99, 102, 241, 0.08);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.18),
                0 0 8px  rgba(99, 102, 241, 0.07);
    transform: scale(1);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
}

.msg-highlight {
  animation: msg-highlight 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  border-radius: 1rem;
  padding: 4px 6px;
  margin: -4px -6px;
}
</style>
