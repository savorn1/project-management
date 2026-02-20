<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">File Uploads</h1>
        <p class="text-gray-400 mt-1">Upload files to MinIO (S3-compatible) and manage attachments</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-xs text-gray-500">
          {{ storageStats.totalFiles }} files · {{ formatBytes(storageStats.totalSizeBytes) }}
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-500/30">
          MinIO · {{ storageStats.bucket }}
        </span>
      </div>
    </div>

    <!-- Upload area -->
    <div
      class="bg-slate-800/60 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer"
      :class="dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="onFileSelect"
      />
      <div class="text-4xl mb-3">{{ dragging ? '📂' : '☁️' }}</div>
      <div class="text-white font-semibold mb-1">
        {{ dragging ? 'Drop files here' : 'Drag & drop files or click to browse' }}
      </div>
      <div class="text-xs text-gray-500">Images, PDFs, documents — max 20 MB per file</div>

      <!-- Staged files -->
      <div v-if="staged.length > 0" class="mt-4 space-y-2 text-left" @click.stop>
        <div
          v-for="(f, i) in staged"
          :key="i"
          class="flex items-center gap-3 bg-slate-900/60 rounded-lg px-3 py-2"
        >
          <span class="text-lg">{{ fileIcon(f.type) }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white truncate">{{ f.name }}</div>
            <div class="text-xs text-gray-500">{{ formatBytes(f.size) }} · {{ f.type || 'unknown' }}</div>
          </div>
          <!-- Upload progress -->
          <div v-if="uploadProgress[i] !== undefined" class="w-24">
            <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="uploadProgress[i] === 100 ? 'bg-emerald-500' : 'bg-indigo-500'"
                :style="{ width: uploadProgress[i] + '%' }"
              ></div>
            </div>
            <div class="text-xs text-center mt-0.5" :class="uploadProgress[i] === 100 ? 'text-emerald-400' : 'text-gray-500'">
              {{ uploadProgress[i] === 100 ? 'Done' : uploadProgress[i] + '%' }}
            </div>
          </div>
          <button v-else @click.stop="staged.splice(i, 1)" class="text-gray-600 hover:text-rose-400">✕</button>
        </div>

        <!-- Upload options -->
        <div class="flex gap-2 items-center pt-1" @click.stop>
          <input
            v-model="uploaderId"
            class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            placeholder="Uploader ID (any string for demo)"
          />
          <input
            v-model="taskIdInput"
            class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            placeholder="Task ID (optional)"
          />
          <button
            @click.stop="uploadAll"
            :disabled="uploading || !uploaderId"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {{ uploading ? 'Uploading…' : `Upload ${staged.length} file${staged.length !== 1 ? 's' : ''}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Architecture note -->
    <div class="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-xs text-gray-400 grid grid-cols-4 gap-3">
      <div class="bg-slate-900/50 rounded-lg p-3">
        <div class="font-semibold text-white mb-1">1. Browser → API</div>
        <code class="text-indigo-400">POST /uploads/single</code><br/>
        Multipart form-data. Multer parses the stream in memory.
      </div>
      <div class="bg-slate-900/50 rounded-lg p-3">
        <div class="font-semibold text-white mb-1">2. API → MinIO</div>
        <code class="text-indigo-400">PutObjectCommand</code><br/>
        AWS SDK streams buffer to MinIO. Path-style URL required for local.
      </div>
      <div class="bg-slate-900/50 rounded-lg p-3">
        <div class="font-semibold text-white mb-1">3. Metadata → MongoDB</div>
        <code class="text-indigo-400">File collection</code><br/>
        Stores key, URL, mimeType, size, uploaderId, taskId.
      </div>
      <div class="bg-slate-900/50 rounded-lg p-3">
        <div class="font-semibold text-white mb-1">4. Presigned URL</div>
        <code class="text-indigo-400">GetObjectCommand</code><br/>
        Temporary signed URL lets browser download directly from MinIO (15 min).
      </div>
    </div>

    <!-- File list -->
    <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl">
      <div class="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h2 class="text-sm font-semibold text-white">Uploaded Files</h2>
        <button @click="loadFiles" class="text-xs text-gray-400 hover:text-white px-2 py-1 bg-slate-700/50 rounded">Refresh</button>
      </div>

      <div v-if="loading" class="text-center py-10 text-gray-500">Loading…</div>
      <div v-else-if="files.length === 0" class="text-center py-10">
        <div class="text-3xl mb-2">📭</div>
        <div class="text-gray-500 text-sm">No files uploaded yet</div>
      </div>

      <div v-else class="divide-y divide-slate-700/30">
        <div
          v-for="file in files"
          :key="file._id"
          class="flex items-center gap-4 px-4 py-3 hover:bg-slate-700/20 transition-colors group"
        >
          <!-- Icon -->
          <span class="text-2xl flex-shrink-0">{{ fileIcon(file.mimeType) }}</span>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="text-sm text-white font-medium truncate">{{ file.originalName }}</div>
            <div class="flex gap-3 text-xs text-gray-500 mt-0.5">
              <span>{{ formatBytes(file.size) }}</span>
              <span>{{ file.mimeType }}</span>
              <span>{{ formatDate(file.createdAt) }}</span>
              <span v-if="file.taskId" class="text-indigo-400">task: {{ file.taskId }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              :href="file.url"
              target="_blank"
              class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors"
            >Open</a>
            <button
              @click="getPresignedUrl(file)"
              class="px-2 py-1 text-xs bg-indigo-700 hover:bg-indigo-600 text-white rounded transition-colors"
            >Presigned URL</button>
            <button
              @click="deleteFile(file)"
              class="px-2 py-1 text-xs bg-rose-700/60 hover:bg-rose-700 text-rose-300 rounded transition-colors"
            >Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Presigned URL result modal -->
    <div v-if="presignedResult" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <h3 class="text-lg font-semibold text-white mb-1">Presigned Download URL</h3>
        <p class="text-xs text-gray-400 mb-3">Expires in 15 minutes — anyone with this URL can download the file directly from MinIO</p>
        <div class="bg-slate-800 rounded-lg p-3 break-all text-xs text-indigo-300 font-mono mb-4 border border-slate-700">
          {{ presignedResult }}
        </div>
        <div class="flex gap-2">
          <a :href="presignedResult" target="_blank" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm text-center rounded-lg">Open URL</a>
          <button @click="presignedResult = null" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeoMeta({
  title: 'File Uploads | TaskFlow',
  description: 'Upload and manage files with MinIO S3-compatible storage',
})

const runtimeConfig = useRuntimeConfig()
const BASE = `${runtimeConfig.public.apiBase}/uploads`

interface UploadedFile {
  _id: string
  originalName: string
  filename: string
  url: string
  s3Key?: string
  mimeType: string
  size: number
  uploaderId: string
  taskId?: string
  createdAt: string
}

interface StorageStats {
  totalFiles: number
  totalSizeBytes: number
  bucket: string
}

const files = ref<UploadedFile[]>([])
const loading = ref(true)
const uploading = ref(false)
const dragging = ref(false)
const staged = ref<File[]>([])
const uploadProgress = ref<Record<number, number>>({})
const uploaderId = ref('user-demo')
const taskIdInput = ref('')
const presignedResult = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const storageStats = reactive<StorageStats>({ totalFiles: 0, totalSizeBytes: 0, bucket: '—' })

// ─── File selection ───────────────────────────────────────────────────────

function onDrop(e: DragEvent) {
  dragging.value = false
  const dropped = Array.from(e.dataTransfer?.files ?? [])
  staged.value.push(...dropped)
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  staged.value.push(...selected)
  input.value = ''
}

// ─── Upload ───────────────────────────────────────────────────────────────

async function uploadAll() {
  if (staged.value.length === 0 || !uploaderId.value) return
  uploading.value = true
  uploadProgress.value = {}

  for (let i = 0; i < staged.value.length; i++) {
    const file = staged.value[i]
    uploadProgress.value[i] = 0

    const formData = new FormData()
    formData.append('file', file)

    const params = new URLSearchParams({ uploaderId: uploaderId.value })
    if (taskIdInput.value) params.set('taskId', taskIdInput.value)

    try {
      await fetch(`${BASE}/single?${params}`, { method: 'POST', body: formData })
      uploadProgress.value[i] = 100
    } catch {
      uploadProgress.value[i] = -1
    }
  }

  await new Promise((r) => setTimeout(r, 800))
  staged.value = []
  uploadProgress.value = {}
  uploading.value = false
  await loadFiles()
}

// ─── API ──────────────────────────────────────────────────────────────────

async function loadFiles() {
  loading.value = true
  try {
    const [res, stats] = await Promise.all([
      $fetch<{ data: UploadedFile[] }>(BASE),
      $fetch<StorageStats>(`${BASE}/stats`),
    ])
    files.value = res.data
    Object.assign(storageStats, stats)
  } finally {
    loading.value = false
  }
}

async function deleteFile(file: UploadedFile) {
  if (!confirm(`Delete "${file.originalName}"?`)) return
  await $fetch(`${BASE}/${file._id}`, { method: 'DELETE' })
  await loadFiles()
}

async function getPresignedUrl(file: UploadedFile) {
  const res = await $fetch<{ url: string }>(`${BASE}/${file._id}/presigned`)
  presignedResult.value = res.url
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function fileIcon(mimeType: string): string {
  if (mimeType?.startsWith('image/')) return '🖼️'
  if (mimeType?.startsWith('video/')) return '🎬'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return '📊'
  if (mimeType?.includes('zip') || mimeType?.includes('tar')) return '📦'
  return '📎'
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(loadFiles)
</script>
