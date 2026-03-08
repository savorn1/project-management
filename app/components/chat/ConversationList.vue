<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
      <h2 class="text-sm font-semibold text-white">Messages</h2>
      <button
        @click="$emit('new')"
        class="w-7 h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:text-indigo-300 transition-all"
        title="New conversation"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 px-3 pt-2 pb-1 flex-shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
        :class="activeTab === tab.key
          ? 'bg-indigo-500/20 text-indigo-300'
          : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/40'"
      >
        {{ tab.label }}
        <span
          v-if="tab.unread > 0"
          class="min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center"
        >{{ tab.unread }}</span>
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 py-1.5 flex-shrink-0">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search…"
          class="w-full pl-8 pr-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>
    </div>

    <!-- Label filter chips -->
    <div class="px-3 pb-1.5 flex flex-wrap gap-1 flex-shrink-0">
      <button
        @click="activeLabelFilter = ''"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
        :class="!activeLabelFilter ? 'bg-slate-700 text-gray-300' : 'text-gray-600 hover:text-gray-400'"
      >All</button>
      <button
        v-for="l in LABELS"
        :key="l.key"
        @click="activeLabelFilter = activeLabelFilter === l.key ? '' : l.key"
        class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
        :class="activeLabelFilter === l.key
          ? 'bg-slate-700 text-gray-200'
          : hasLabel(l.key) ? 'text-gray-500 hover:text-gray-300' : 'text-gray-700 hover:text-gray-600'"
      >
        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ background: l.color }" />
        {{ l.name }}
      </button>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Empty state -->
      <div v-if="pinnedList.length === 0 && unpinnedList.length === 0" class="flex flex-col items-center justify-center h-32 text-center px-4">
        <p class="text-xs text-gray-600">
          {{ search ? 'No results' : activeLabelFilter ? 'No conversations with this label' : activeTab === 'group' ? 'No group chats' : activeTab === 'private' ? 'No private chats' : 'No conversations yet' }}
        </p>
        <button v-if="!search && !activeLabelFilter" @click="$emit('new')" class="mt-2 text-xs text-indigo-400 hover:text-indigo-300">
          Start chatting →
        </button>
      </div>

      <!-- ── Pinned section ── -->
      <template v-if="pinnedList.length > 0">
        <div class="px-3 pt-2 pb-0.5 flex items-center gap-1.5">
          <svg class="w-2.5 h-2.5 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2l4 4-8 8-4-4 8-8zM8 14l-4 4" />
          </svg>
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Pinned</span>
        </div>
        <div v-for="item in pinnedList" :key="item._id">
          <ConvRow
            :item="item"
            :active-id="activeId"
            :is-pinned="true"
            :labels="convLabels.get(item._id) ?? []"
            :label-defs="LABELS"
            @select="$emit('select', item._id)"
            @toggle-pin="togglePin(item._id)"
            @toggle-mute="toggleMute(item)"
            @add-label="(k) => addLabel(item._id, k)"
            @remove-label="(k) => removeLabel(item._id, k)"
          />
        </div>
        <div v-if="unpinnedList.length > 0" class="h-px bg-slate-800/40 mx-3 my-1" />
      </template>

      <!-- ── Regular conversations ── -->
      <div v-for="item in unpinnedList" :key="item._id">
        <ConvRow
          :item="item"
          :active-id="activeId"
          :is-pinned="false"
          :labels="convLabels.get(item._id) ?? []"
          :label-defs="LABELS"
          @select="$emit('select', item._id)"
          @toggle-pin="togglePin(item._id)"
          @toggle-mute="toggleMute(item)"
          @add-label="(k) => addLabel(item._id, k)"
          @remove-label="(k) => removeLabel(item._id, k)"
        />
      </div>

      <!-- ── Archived section ── -->
      <div v-if="(archivedConversations ?? []).length > 0" class="border-t border-slate-800/30">
        <button
          @click="showArchived = !showArchived"
          class="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg class="w-3 h-3 transition-transform" :class="showArchived ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Archived ({{ (archivedConversations ?? []).length }})
        </button>
        <div v-if="showArchived">
          <div
            v-for="item in (archivedConversations ?? [])"
            :key="item._id"
            class="relative group/conv border-b border-slate-800/30 last:border-0"
          >
            <button
              @click="$emit('select', item._id)"
              class="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-800/40 transition-colors text-left opacity-70"
              :class="activeId === item._id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 opacity-100' : ''"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                :class="item.type === 'group' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'"
              >{{ conversationInitials(item) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-400 truncate">{{ conversationName(item) }}</p>
                <p class="text-[11px] text-gray-600 truncate">{{ lastMessagePreview(item) }}</p>
              </div>
              <svg class="w-3 h-3 text-gray-700 flex-shrink-0 group-hover/conv:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <!-- Unarchive button (visible on hover) -->
            <button
              @click.stop="$emit('unarchive', item._id)"
              class="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover/conv:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/80 border border-slate-600/40 text-[10px] text-gray-300 hover:text-white hover:bg-slate-600/80 transition-colors"
              title="Unarchive conversation"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Unarchive
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export const LABELS = [
  { key: 'work',     name: 'Work',     color: '#6366f1' },
  { key: 'personal', name: 'Personal', color: '#10b981' },
  { key: 'urgent',   name: 'Urgent',   color: '#f43f5e' },
  { key: 'team',     name: 'Team',     color: '#a855f7' },
  { key: 'project',  name: 'Project',  color: '#f59e0b' },
] as const
export type LabelKey = typeof LABELS[number]['key']
</script>

<script setup lang="ts">
import type { Conversation } from '~/types'

const props = defineProps<{
  conversations: Conversation[]
  archivedConversations?: Conversation[]
  activeId: string | null
}>()

defineEmits<{ select: [id: string]; new: []; unarchive: [id: string] }>()

const { conversationName, conversationInitials, lastMessagePreview, isUnread, muteConversation } = useChat()

// ── Pin state ─────────────────────────────────────────────────────────────────
const pinnedIds = ref<Set<string>>(new Set())

function loadPinned() {
  try {
    pinnedIds.value = new Set(JSON.parse(localStorage.getItem('chat-pinned-convs') ?? '[]') as string[])
  } catch { pinnedIds.value = new Set() }
}
function togglePin(id: string) {
  const next = new Set(pinnedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  pinnedIds.value = next
  localStorage.setItem('chat-pinned-convs', JSON.stringify([...next]))
}

// ── Label state ───────────────────────────────────────────────────────────────
const convLabels = ref<Map<string, LabelKey[]>>(new Map())

function loadLabels() {
  try {
    const raw = JSON.parse(localStorage.getItem('chat-conv-labels') ?? '{}') as Record<string, LabelKey[]>
    convLabels.value = new Map(Object.entries(raw))
  } catch { convLabels.value = new Map() }
}
function saveLabels() {
  const obj: Record<string, LabelKey[]> = {}
  convLabels.value.forEach((v, k) => { obj[k] = v })
  localStorage.setItem('chat-conv-labels', JSON.stringify(obj))
}
function addLabel(convId: string, key: LabelKey) {
  const map = new Map(convLabels.value)
  const cur = map.get(convId) ?? []
  if (!cur.includes(key)) { map.set(convId, [...cur, key]); convLabels.value = map; saveLabels() }
}
function removeLabel(convId: string, key: LabelKey) {
  const map = new Map(convLabels.value)
  map.set(convId, (map.get(convId) ?? []).filter((l) => l !== key))
  convLabels.value = map
  saveLabels()
}
function hasLabel(key: string): boolean {
  for (const labels of convLabels.value.values()) if (labels.includes(key as LabelKey)) return true
  return false
}

// ── Filters ───────────────────────────────────────────────────────────────────
const search = ref('')
const activeTab = ref<'all' | 'group' | 'private'>('all')
const activeLabelFilter = ref<LabelKey | ''>('')
const showArchived = ref(false)

const tabs = computed(() => {
  const unreadFor = (type?: 'group' | 'private') =>
    props.conversations.filter((c) => (type ? c.type === type : true) && isUnread(c))
      .reduce((sum, c) => sum + (c._unread ?? 0), 0)
  return [
    { key: 'all' as const,     label: 'All',     unread: unreadFor() },
    { key: 'group' as const,   label: 'Groups',  unread: unreadFor('group') },
    { key: 'private' as const, label: 'Private', unread: unreadFor('private') },
  ]
})

const filtered = computed(() => {
  let list = props.conversations
  if (activeTab.value !== 'all') list = list.filter((c) => c.type === activeTab.value)
  if (activeLabelFilter.value) {
    const lf = activeLabelFilter.value
    list = list.filter((c) => (convLabels.value.get(c._id) ?? []).includes(lf))
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((c) =>
      conversationName(c).toLowerCase().includes(q) ||
      (c.lastMessage?.content ?? '').toLowerCase().includes(q),
    )
  }
  return list
})

const pinnedList = computed(() => filtered.value.filter((c) => pinnedIds.value.has(c._id)))
const unpinnedList = computed(() => filtered.value.filter((c) => !pinnedIds.value.has(c._id)))

async function toggleMute(conv: Conversation) {
  await muteConversation(conv._id, !conv.muted)
}

onMounted(() => { loadPinned(); loadLabels() })
</script>
