<template>
  <div class="min-h-screen bg-slate-950 text-white p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Resume / CV</h1>
        <p class="text-slate-400 mt-1 text-sm">
          {{ resumeList.length }} CV{{ resumeList.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
      >
        <span class="text-base leading-none">+</span> New CV
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="resumeList.length === 0"
      class="flex flex-col items-center justify-center py-32 text-center"
    >
      <div class="text-6xl mb-4">📄</div>
      <h2 class="text-xl font-semibold text-white mb-2">No CVs yet</h2>
      <p class="text-slate-400 text-sm mb-6">Create your first CV to get started</p>
      <button
        @click="showModal = true"
        class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
      >
        Create CV
      </button>
    </div>

    <!-- CV Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="cv in resumeList"
        :key="cv._id"
        @click="navigateTo(`/resume/${cv._id}`)"
        class="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-blue-500/60 hover:bg-slate-800/80 transition-all"
      >
        <!-- Icon -->
        <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-xl mb-4">
          📄
        </div>

        <!-- Name -->
        <div class="mb-1" @click.stop>
          <input
            v-if="renamingId === cv._id"
            :id="`rename-${cv._id}`"
            v-model="renameValue"
            @keydown.enter="commitRename(cv._id)"
            @keydown.esc="cancelRename"
            @blur="commitRename(cv._id)"
            class="w-full bg-slate-700 border border-blue-500 rounded px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
          />
          <h3 v-else class="font-semibold text-white text-base truncate">
            {{ cv.cvName || 'Untitled CV' }}
          </h3>
        </div>
        <p class="text-slate-400 text-xs truncate mb-3">{{ cv.fullName || '—' }}</p>

        <!-- Updated date -->
        <p class="text-slate-500 text-xs">
          Updated {{ formatRelative(cv.updatedAt) }}
        </p>

        <!-- Hover arrow -->
        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 text-lg">→</div>

        <!-- Card actions -->
        <div class="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click.stop="startRename(cv, $event)"
            class="text-slate-400 hover:text-yellow-400 text-sm px-1.5 py-0.5 rounded hover:bg-yellow-900/20 transition-colors"
            title="Rename CV"
          >✎</button>
          <button
            @click.stop="handleClone(cv._id)"
            class="text-slate-400 hover:text-blue-400 text-sm px-1.5 py-0.5 rounded hover:bg-blue-900/20 transition-colors"
            title="Clone CV"
          >⧉</button>
          <button
            @click.stop="handleDelete(cv._id)"
            class="text-slate-400 hover:text-red-400 text-sm px-1.5 py-0.5 rounded hover:bg-red-900/20 transition-colors"
            title="Delete CV"
          >🗑</button>
        </div>
      </div>
    </div>

    <!-- New CV Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showModal = false">
      <div class="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-80">
        <h3 class="text-white font-semibold mb-4">New CV</h3>
        <input
          v-model="newCvName"
          ref="inputRef"
          @keydown.enter="handleCreate"
          @keydown.esc="showModal = false"
          placeholder="CV name (e.g. Software Engineer)"
          class="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
        />
        <div class="flex gap-2 justify-end">
          <button
            @click="showModal = false; newCvName = ''"
            class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors"
          >Cancel</button>
          <button
            @click="handleCreate"
            :disabled="creating || !newCvName.trim()"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm text-white font-medium transition-colors"
          >{{ creating ? 'Creating…' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Resume / CV' })

const { resumeList, loading, fetchResumeList, createResume, renameResume, cloneResume, deleteResume } = useResume()

const renamingId = ref<string | null>(null)
const renameValue = ref('')

function startRename(cv: { _id: string; cvName: string }, e: Event) {
  e.stopPropagation()
  renamingId.value = cv._id
  renameValue.value = cv.cvName
  nextTick(() => {
    const el = document.getElementById(`rename-${cv._id}`)
    el?.focus()
    ;(el as HTMLInputElement)?.select()
  })
}

async function commitRename(id: string) {
  const name = renameValue.value.trim()
  if (name && name !== resumeList.value.find(r => r._id === id)?.cvName) {
    await renameResume(id, name)
  }
  renamingId.value = null
}

function cancelRename() {
  renamingId.value = null
}

const showModal = ref(false)
const newCvName = ref('')
const creating = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

watch(showModal, (v) => {
  if (v) nextTick(() => inputRef.value?.focus())
})

onMounted(() => fetchResumeList())

function formatRelative(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString()
}

async function handleCreate() {
  if (!newCvName.value.trim()) return
  creating.value = true
  const created = await createResume({
    cvName: newCvName.value.trim(),
    fullName: '',
    title: '', phone: '', email: '', location: '', profileUrl: '', photo: '',
    summary: '', skills: [], experiences: [], education: [],
    languages: [], awards: [], references: [], hobbies: [],
  })
  creating.value = false
  if (created) {
    showModal.value = false
    newCvName.value = ''
    navigateTo(`/resume/${created._id}`)
  }
}

async function handleClone(id: string) {
  await cloneResume(id)
}

async function handleDelete(id: string) {
  if (!confirm('Delete this CV? This cannot be undone.')) return
  await deleteResume(id)
}
</script>
