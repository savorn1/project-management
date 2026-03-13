<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[9995] flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

      <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[80vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 flex-shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white">Saved Replies</h3>
          </div>
          <button @click="$emit('update:modelValue', false)" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search (select mode) or form (edit mode) -->
        <div class="px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
          <div v-if="!showForm" class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="search" type="text" placeholder="Search replies or type /shortcut…" class="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors" />
          </div>

          <!-- Create/edit form -->
          <div v-else class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">Title</label>
                <input v-model="form.title" type="text" placeholder="Daily Standup" class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">Shortcut</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">/</span>
                  <input v-model="form.shortcut" type="text" placeholder="standup" class="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-6 pr-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" @input="form.shortcut = form.shortcut.toLowerCase().replace(/[^a-z0-9_-]/g, '')" />
                </div>
              </div>
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">Content</label>
              <textarea v-model="form.content" rows="3" placeholder="Type your saved message here…" class="w-full bg-slate-800 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
            </div>
            <div class="flex gap-2">
              <button @click="cancelForm" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-gray-400 hover:bg-slate-700 transition-colors">Cancel</button>
              <button @click="saveForm" :disabled="!form.title || !form.shortcut || !form.content || saving" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors">
                {{ saving ? 'Saving…' : (editingId ? 'Update' : 'Create') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reply list -->
        <div class="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>

          <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
            <p class="text-sm text-gray-500">{{ search ? 'No matches found' : 'No saved replies yet' }}</p>
          </div>

          <div
            v-else
            v-for="reply in filtered"
            :key="reply._id"
            class="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/70 transition-colors cursor-pointer"
            @click="pickReply(reply)"
          >
            <div class="flex-shrink-0 mt-0.5">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-semibold">/{{ reply.shortcut }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-200 truncate">{{ reply.title }}</p>
              <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ reply.content }}</p>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button @click.stop="startEdit(reply)" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors" title="Edit">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button @click.stop="remove(reply._id)" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer: add new -->
        <div v-if="!showForm" class="px-4 py-3 border-t border-slate-800/60 flex-shrink-0">
          <button @click="startCreate" class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-gray-300 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New saved reply
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { SavedReply } from '~/types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  pick: [content: string]
}>()

const { savedReplies, loadSavedReplies, createSavedReply, updateSavedReply, deleteSavedReply } = useChat()

const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ title: '', shortcut: '', content: '' })

const filtered = computed(() => {
  const q = search.value.toLowerCase().replace(/^\//, '')
  if (!q) return savedReplies.value
  return savedReplies.value.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.shortcut.toLowerCase().includes(q) ||
    r.content.toLowerCase().includes(q)
  )
})

function pickReply(reply: SavedReply) {
  emit('pick', reply.content)
  emit('update:modelValue', false)
}

function startCreate() {
  editingId.value = null
  Object.assign(form, { title: '', shortcut: '', content: '' })
  showForm.value = true
}

function startEdit(reply: SavedReply) {
  editingId.value = reply._id
  Object.assign(form, { title: reply.title, shortcut: reply.shortcut, content: reply.content })
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

async function saveForm() {
  if (!form.title || !form.shortcut || !form.content) return
  saving.value = true
  try {
    if (editingId.value) {
      await updateSavedReply(editingId.value, { ...form })
    } else {
      await createSavedReply({ ...form })
    }
    cancelForm()
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  await deleteSavedReply(id)
}

watch(() => props.modelValue, async (v) => {
  if (v) {
    search.value = ''
    showForm.value = false
    loading.value = true
    try { await loadSavedReplies() } finally { loading.value = false }
  }
})
</script>
