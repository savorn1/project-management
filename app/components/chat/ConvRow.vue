<template>
  <div class="relative group/conv">
    <!-- Active left accent bar -->
    <div
      v-if="activeId === item._id"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-400 rounded-r-full"
    />
    <button
      @click="$emit('select')"
      class="w-full px-3 py-2.5 flex items-center gap-3 transition-all duration-150 text-left rounded-xl mx-1"
      :class="activeId === item._id
        ? 'bg-indigo-500/12 text-white'
        : 'hover:bg-slate-800/50'"
      style="width: calc(100% - 8px);"
    >
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img
          v-if="item.avatar"
          :src="item.avatar"
          class="w-9 h-9 rounded-full object-cover ring-2 transition-all duration-150"
          :class="hasUnread ? 'ring-indigo-400/70' : 'ring-transparent'"
        />
        <div
          v-else
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 transition-all duration-150"
          :class="[
            item.type === 'group'
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
              : item.type === 'broadcast'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600',
            hasUnread ? 'ring-indigo-400/70' : 'ring-transparent',
          ]"
        >{{ initials }}</div>
        <!-- Online presence dot (private chats only) -->
        <span
          v-if="otherParticipantId && isOnline(otherParticipantId)"
          class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"
        />
        <span
          v-if="isPinned"
          class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm"
          title="Pinned"
        >
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l4 4-8 8-4-4 8-8z"/>
          </svg>
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <p
            class="text-[13px] truncate transition-colors"
            :class="hasUnread ? 'font-bold text-white' : 'font-semibold text-gray-200'"
          >{{ name }}</p>
          <span
            class="text-[10px] flex-shrink-0 transition-colors"
            :class="hasUnread ? 'text-indigo-400 font-medium' : 'text-gray-600'"
          >{{ timeAgo }}</span>
        </div>
        <!-- Label dots -->
        <div v-if="labels.length > 0" class="flex items-center gap-1 mb-0.5">
          <span
            v-for="lk in labels"
            :key="lk"
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :style="{ background: labelColor(lk) }"
            :title="labelName(lk)"
          />
        </div>
        <div class="flex items-center gap-1 min-w-0">
          <svg v-if="item.muted" class="w-2.5 h-2.5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <!-- Typing indicator replaces preview -->
          <span v-if="isTyping" class="text-[11px] italic text-emerald-400 truncate">typing…</span>
          <template v-else>
            <!-- Draft badge -->
            <span v-if="hasDraft" class="text-[11px] font-semibold text-amber-400 flex-shrink-0">Draft:</span>
            <p
              class="text-[11px] truncate transition-colors"
              :class="hasUnread ? 'text-gray-300' : 'text-gray-500'"
            >{{ preview }}</p>
          </template>
        </div>
      </div>

      <!-- Unread badge -->
      <span
        v-if="hasUnread"
        class="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-indigo-500/40"
      >{{ item._unread }}</span>
    </button>

    <!-- Hover actions -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover/conv:flex items-center gap-0.5 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700/40 p-0.5 shadow-lg">
      <!-- Pin -->
      <button
        @click.stop="$emit('toggle-pin')"
        class="w-6 h-6 rounded flex items-center justify-center transition-colors"
        :class="isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-gray-300'"
        :title="isPinned ? 'Unpin' : 'Pin'"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l4 4-8 8-4-4 8-8z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14l-4 4" />
        </svg>
      </button>

      <!-- Label -->
      <div class="relative">
        <button
          @click.stop="toggleLabelPicker"
          class="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors"
          title="Labels"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 9.414V5a2 2 0 012-2z" />
          </svg>
        </button>

        <!-- Label picker dropdown (teleported) -->
        <Teleport to="body">
          <div
            v-if="showLabelPicker"
            class="fixed inset-0"
            style="z-index: 99998;"
            @click.stop="showLabelPicker = false"
          />
          <div
            v-if="showLabelPicker"
            class="fixed bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl py-1 min-w-[130px]"
            style="z-index: 99999;"
            :style="pickerStyle"
          >
            <button
              v-for="l in labelDefs"
              :key="l.key"
              @click.stop="toggleLabel(l.key)"
              class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-700/60 transition-colors"
              :class="labels.includes(l.key) ? 'text-gray-200' : 'text-gray-500'"
            >
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: l.color }" />
              {{ l.name }}
              <svg v-if="labels.includes(l.key)" class="w-3 h-3 ml-auto text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </Teleport>
      </div>

      <!-- Mute -->
      <button
        @click.stop="$emit('toggle-mute')"
        class="w-6 h-6 rounded flex items-center justify-center transition-colors"
        :class="item.muted ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-gray-300'"
        :title="item.muted ? 'Unmute' : 'Mute'"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!item.muted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12L7 9H4v6h3l5 3V6z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </button>

      <!-- Mark as unread -->
      <button
        @click.stop="$emit('mark-unread')"
        class="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors"
        title="Mark as unread"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'
import type { LabelKey } from '~/components/chat/ConversationList.vue'
import { LABELS } from '~/components/chat/ConversationList.vue'

const props = defineProps<{
  item: Conversation
  activeId: string | null
  isPinned: boolean
  labels: LabelKey[]
  labelDefs: typeof LABELS
  isTyping?: boolean
  hasDraft?: boolean
}>()

const emit = defineEmits<{
  select: []
  'toggle-pin': []
  'toggle-mute': []
  'add-label': [key: LabelKey]
  'remove-label': [key: LabelKey]
  'mark-unread': []
}>()

const { conversationName, conversationInitials, lastMessagePreview, isOnline } = useChat()
const { user } = useAuth()
const currentUserId = computed(() => user.value?.id ?? '')

const otherParticipantId = computed(() => {
  if (props.item.type !== 'private') return null
  return props.item.participants.find(p => p !== currentUserId.value) ?? null
})

const name = computed(() => conversationName(props.item))
const initials = computed(() => conversationInitials(props.item))
const preview = computed(() => lastMessagePreview(props.item))
const hasUnread = computed(() => (props.item._unread ?? 0) > 0)

const timeAgo = computed(() => {
  const ts = props.item.lastMessage?.createdAt ?? props.item.updatedAt
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})

function labelColor(key: LabelKey) {
  return props.labelDefs.find((l) => l.key === key)?.color ?? '#888'
}
function labelName(key: LabelKey) {
  return props.labelDefs.find((l) => l.key === key)?.name ?? key
}

// Label picker
const showLabelPicker = ref(false)
const pickerStyle = ref<Record<string, string>>({})
const pickerBtnRef = ref<HTMLElement | null>(null)

function toggleLabelPicker(e: MouseEvent) {
  if (showLabelPicker.value) { showLabelPicker.value = false; return }
  const btn = (e.currentTarget as HTMLElement)
  const rect = btn.getBoundingClientRect()
  pickerStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, rect.left - 60)}px`,
  }
  showLabelPicker.value = true
}

function toggleLabel(key: LabelKey) {
  if (props.labels.includes(key)) {
    emit('remove-label', key)
  } else {
    emit('add-label', key)
  }
}
</script>
