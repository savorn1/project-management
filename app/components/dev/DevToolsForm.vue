<template>
  <div class="space-y-4">
    <!-- Connection Status Card -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Connection Status
      </h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-400">WebSocket</span>
          <div class="flex items-center gap-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"
            ></div>
            <span :class="isConnected ? 'text-emerald-400' : 'text-red-400'">
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-400">Client ID</span>
          <code class="text-indigo-400 text-[10px] font-mono bg-slate-700/50 px-2 py-1 rounded">
            {{ clientId }}
          </code>
        </div>
      </div>
    </div>

    <!-- Test Redis Pub/Sub Form -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Test Redis Pub/Sub
      </h3>
      <form @submit.prevent="testRedisPubSub" class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Room Name</label>
          <input
            v-model="redisPubSubForm.room"
            type="text"
            placeholder="e.g., test:redis-pubsub"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Event Type</label>
          <input
            v-model="redisPubSubForm.eventType"
            type="text"
            placeholder="e.g., redis:test"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Message</label>
          <textarea
            v-model="redisPubSubForm.message"
            rows="3"
            placeholder="Enter custom message..."
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y"
          ></textarea>
        </div>
        <button
          type="submit"
          :disabled="testing || !isConnected"
          class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ testing ? 'Sending...' : 'Send Test Event' }}
        </button>
      </form>
    </div>

    <!-- Test Task Event Form -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Test Task Event
      </h3>
      <form @submit.prevent="testTaskEvent" class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Project ID</label>
          <input
            v-model="taskEventForm.projectId"
            type="text"
            placeholder="e.g., test-project-123"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Task Title</label>
          <input
            v-model="taskEventForm.title"
            type="text"
            placeholder="e.g., Test Task"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Event Type</label>
          <select
            v-model="taskEventForm.eventType"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="testing || !taskEventForm.projectId"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ testing ? 'Sending...' : 'Send Task Event' }}
        </button>
      </form>
    </div>

    <!-- Test Project Event Form -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        Test Project Event
      </h3>
      <form @submit.prevent="testProjectEvent" class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Workplace ID</label>
          <input
            v-model="projectEventForm.workplaceId"
            type="text"
            placeholder="e.g., test-workplace-123"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Project Name</label>
          <input
            v-model="projectEventForm.name"
            type="text"
            placeholder="e.g., Test Project"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Event Type</label>
          <select
            v-model="projectEventForm.eventType"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="testing || !projectEventForm.workplaceId"
          class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ testing ? 'Sending...' : 'Send Project Event' }}
        </button>
      </form>
    </div>

    <!-- Room Management -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Room Management
      </h3>
      <form @submit.prevent="joinCustomRoom" class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Room Name</label>
          <input
            v-model="customRoom"
            type="text"
            placeholder="e.g., project:YOUR_ID"
            class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          :disabled="!isConnected || !customRoom"
          class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Room
        </button>
      </form>

      <!-- Active Rooms -->
      <div v-if="joinedRooms.length > 0" class="mt-3 pt-3 border-t border-slate-700/30">
        <p class="text-xs text-gray-400 mb-2">Active Rooms ({{ joinedRooms.length }})</p>
        <div class="space-y-1">
          <div
            v-for="room in joinedRooms"
            :key="room"
            class="flex items-center justify-between p-2 bg-slate-700/30 rounded text-xs"
          >
            <code class="text-indigo-400 font-mono">{{ room }}</code>
            <button
              @click="leaveRoom(room)"
              class="text-red-400 hover:text-red-300"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="p-4 bg-slate-800/50 rounded-xl border border-slate-700/40">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Event Log ({{ eventLog.length }})
        </h3>
        <button
          v-if="eventLog.length > 0"
          @click="eventLog = []"
          class="text-xs text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>

      <div v-if="eventLog.length === 0" class="text-center py-8">
        <p class="text-xs text-gray-500">No events logged yet</p>
      </div>

      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="(event, index) in eventLog.slice().reverse()"
          :key="index"
          class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
        >
          <div class="flex items-center justify-between mb-1">
            <code class="text-xs text-indigo-400 font-mono font-semibold">{{ event.type }}</code>
            <span class="text-xs text-gray-500">{{ event.time }}</span>
          </div>
          <pre class="text-xs text-gray-400 font-mono overflow-x-auto">{{ event.data }}</pre>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-2">
      <button
        @click="checkBackendHealth"
        :disabled="testing"
        class="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        Backend Health
      </button>
      <button
        @click="reconnect"
        :disabled="isConnected || testing"
        class="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        Reconnect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const socket = useSocket()
const toast = useToast()
const config = useRuntimeConfig()

const testing = ref(false)
const customRoom = ref('')
const joinedRooms = ref<string[]>([])
const eventLog = ref<Array<{ type: string; data: string; time: string }>>([])

const isConnected = computed(() => socket.isConnected.value)
const clientId = computed(() => socket.clientId)

// Forms
const redisPubSubForm = ref({
  room: 'test:redis-pubsub',
  eventType: 'redis:test',
  message: 'Hello from Redis Pub/Sub test!'
})

const taskEventForm = ref({
  projectId: 'test-project-123',
  title: 'Test Task',
  eventType: 'created'
})

const projectEventForm = ref({
  workplaceId: 'test-workplace-123',
  name: 'Test Project',
  eventType: 'created'
})

onMounted(() => {
  // Listen to all events
  socket.on('task:created', (data: any) => logEvent('task:created', data))
  socket.on('task:updated', (data: any) => logEvent('task:updated', data))
  socket.on('task:deleted', (data: any) => logEvent('task:deleted', data))
  socket.on('project:created', (data: any) => logEvent('project:created', data))
  socket.on('project:updated', (data: any) => logEvent('project:updated', data))
  socket.on('project:deleted', (data: any) => logEvent('project:deleted', data))
  socket.on('redis:test', (data: any) => {
    logEvent('redis:test', data)
    toast.success('✅ Redis Pub/Sub Working!')
  })
  socket.on('welcome', (data: any) => logEvent('welcome', data))
})

function logEvent(type: string, data: any) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  eventLog.value.push({
    type,
    data: JSON.stringify(data, null, 2),
    time
  })

  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(-50)
  }
}

async function testRedisPubSub() {
  testing.value = true
  try {
    socket.joinRoom(redisPubSubForm.value.room)
    if (!joinedRooms.value.includes(redisPubSubForm.value.room)) {
      joinedRooms.value.push(redisPubSubForm.value.room)
    }

    const response = await fetch(`${config.public.apiBase}/admin/events/test/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: redisPubSubForm.value.room,
        eventType: redisPubSubForm.value.eventType,
        data: {
          message: redisPubSubForm.value.message,
          timestamp: new Date().toISOString(),
          clientId: clientId.value
        }
      })
    })

    if (response.ok) {
      toast.success('Redis Pub/Sub event sent!')
    } else {
      toast.error('Failed to send event')
    }
  } catch (error) {
    toast.error('Error sending event')
  } finally {
    testing.value = false
  }
}

async function testTaskEvent() {
  testing.value = true
  try {
    const room = `project:${taskEventForm.value.projectId}`
    socket.joinRoom(room)
    if (!joinedRooms.value.includes(room)) {
      joinedRooms.value.push(room)
    }

    const endpoint = `task-${taskEventForm.value.eventType}`
    const response = await fetch(`${config.public.apiBase}/admin/events/test/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: taskEventForm.value.projectId,
        title: taskEventForm.value.title
      })
    })

    if (response.ok) {
      toast.success(`Task ${taskEventForm.value.eventType} event sent!`)
    } else {
      toast.error('Failed to send event')
    }
  } catch (error) {
    toast.error('Error sending event')
  } finally {
    testing.value = false
  }
}

async function testProjectEvent() {
  testing.value = true
  try {
    const room = `workplace:${projectEventForm.value.workplaceId}`
    socket.joinRoom(room)
    if (!joinedRooms.value.includes(room)) {
      joinedRooms.value.push(room)
    }

    const endpoint = `project-${projectEventForm.value.eventType}`
    const response = await fetch(`${config.public.apiBase}/admin/events/test/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workplaceId: projectEventForm.value.workplaceId,
        name: projectEventForm.value.name
      })
    })

    if (response.ok) {
      toast.success(`Project ${projectEventForm.value.eventType} event sent!`)
    } else {
      toast.error('Failed to send event')
    }
  } catch (error) {
    toast.error('Error sending event')
  } finally {
    testing.value = false
  }
}

function joinCustomRoom() {
  if (customRoom.value) {
    socket.joinRoom(customRoom.value)
    if (!joinedRooms.value.includes(customRoom.value)) {
      joinedRooms.value.push(customRoom.value)
    }
    toast.success(`Joined room: ${customRoom.value}`)
    logEvent('ROOM_JOINED', { room: customRoom.value })
    customRoom.value = ''
  }
}

function leaveRoom(room: string) {
  socket.leaveRoom(room)
  joinedRooms.value = joinedRooms.value.filter(r => r !== room)
  toast.info(`Left room: ${room}`)
  logEvent('ROOM_LEFT', { room })
}

async function checkBackendHealth() {
  testing.value = true
  try {
    const response = await fetch(`${config.public.apiBase}/admin/events/health`)
    if (response.ok) {
      const data = await response.json()
      logEvent('HEALTH_CHECK', data)
      toast.success('Backend is healthy!')
    } else {
      toast.error('Health check failed')
    }
  } catch (error) {
    toast.error('Backend unreachable')
  } finally {
    testing.value = false
  }
}

function reconnect() {
  socket.connect()
  toast.info('Reconnecting...')
}
</script>
