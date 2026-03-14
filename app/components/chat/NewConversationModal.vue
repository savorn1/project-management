<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Panel -->
      <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 flex flex-col max-h-[80vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 flex-shrink-0">
          <h3 class="text-sm font-semibold text-white">New Conversation</h3>
          <button @click="$emit('close')" class="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Type tabs -->
        <div class="flex gap-1 px-5 pt-4 flex-shrink-0">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="type = tab.value"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="type === tab.value
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-gray-500 hover:text-gray-300'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Group / Broadcast name -->
        <div v-if="type === 'group' || type === 'broadcast'" class="px-5 pt-3 flex-shrink-0">
          <input
            v-model="groupName"
            type="text"
            :placeholder="type === 'broadcast' ? 'Announcement channel name' : 'Group name'"
            class="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <!-- Search members -->
        <div class="px-5 pt-3 flex-shrink-0">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Search team members…"
              class="w-full pl-8 pr-3 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <!-- Selected (group / broadcast) -->
        <div v-if="(type === 'group' || type === 'broadcast') && selected.length > 0" class="px-5 pt-2 flex flex-wrap gap-1.5 flex-shrink-0">
          <span
            v-for="id in selected"
            :key="id"
            class="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px]"
          >
            {{ memberName(id) }}
            <button @click="toggleSelect(id)" class="text-indigo-400 hover:text-indigo-200 leading-none">×</button>
          </span>
        </div>

        <!-- Member list -->
        <div class="flex-1 overflow-y-auto px-5 pt-2 pb-4">
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <div v-else-if="filteredMembers.length === 0" class="text-center py-8 text-xs text-gray-600">
            No team members found
          </div>
          <div v-else class="space-y-0.5">
            <button
              v-for="m in filteredMembers"
              :key="m._id"
              @click="type === 'private' ? startPrivate(m) : toggleSelect(m._id)"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors text-left"
              :class="selected.includes(m._id) ? 'bg-indigo-500/10 border border-indigo-500/20' : ''"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                {{ initials(m.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-white truncate">{{ m.name }}</p>
                <p class="text-[11px] text-gray-500 truncate">{{ m.email }}</p>
              </div>
              <div v-if="type === 'group' || type === 'broadcast'" class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                :class="selected.includes(m._id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'">
                <svg v-if="selected.includes(m._id)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Group / Broadcast create button -->
        <div v-if="type === 'group' || type === 'broadcast'" class="px-5 pb-4 flex-shrink-0">
          <button
            @click="type === 'broadcast' ? startBroadcast() : startGroup()"
            :disabled="!groupName.trim() || selected.length === 0 || creating"
            class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="groupName.trim() && selected.length > 0 && !creating
              ? type === 'broadcast'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500'
                : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500'
              : 'bg-slate-800 text-gray-600 cursor-not-allowed'"
          >
            <span v-if="!creating">
              {{ type === 'broadcast' ? 'Create Channel' : 'Create Group' }} ({{ selected.length }} member{{ selected.length !== 1 ? 's' : '' }})
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating…
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/types'

const emit = defineEmits<{
  close: []
  created: [conversationId: string]
}>()

const { teamApi } = useApi()
const { user } = useAuth()
const { createPrivateConversation, createGroupConversation, createBroadcastConversation } = useChat()

const type = ref<'private' | 'group' | 'broadcast'>('private')
const tabs = [
  { value: 'private' as const, label: 'Private' },
  { value: 'group' as const, label: 'Group' },
  { value: 'broadcast' as const, label: '📢 Announce' },
]

const search = ref('')
const groupName = ref('')
const selected = ref<string[]>([])
const members = ref<TeamMember[]>([])
const isLoading = ref(false)
const creating = ref(false)

const filteredMembers = computed(() => {
  const q = search.value.toLowerCase()
  return members.value
    .filter((m) => m._id !== user.value?.id)
    .filter((m) =>
      !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    )
})

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  return name.charAt(0).toUpperCase()
}

function memberName(id: string): string {
  return members.value.find((m) => m._id === id)?.name ?? id
}

function toggleSelect(id: string) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value = [...selected.value, id]
  else selected.value = selected.value.filter((s) => s !== id)
}

async function startPrivate(m: TeamMember) {
  creating.value = true
  const id = await createPrivateConversation(m._id, m.name)
  creating.value = false
  if (id) emit('created', id)
}

async function startGroup() {
  if (!groupName.value.trim() || selected.value.length === 0) return
  creating.value = true
  const id = await createGroupConversation(groupName.value.trim(), selected.value)
  creating.value = false
  if (id) emit('created', id)
}

async function startBroadcast() {
  if (!groupName.value.trim() || selected.value.length === 0) return
  creating.value = true
  const id = await createBroadcastConversation(groupName.value.trim(), selected.value)
  creating.value = false
  if (id) emit('created', id)
}

onMounted(async () => {
  isLoading.value = true
  members.value = await teamApi.getAll()
  isLoading.value = false
})
</script>
