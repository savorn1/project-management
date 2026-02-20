<template>
  <div class="relative" ref="menuRef">
    <!-- Trigger Button -->
    <button
      @click="showMenu = !showMenu"
      class="w-10 h-10 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-200 group relative"
      title="Developer Tools"
    >
      <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <div v-if="isConnected" class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></div>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        class="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Developer Tools
            </h3>
            <button
              @click="showMenu = false"
              class="p-1 text-gray-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="p-4 border-b border-slate-700/30 bg-slate-900/30">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400">WebSocket</span>
              <div class="flex items-center gap-1.5">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'"
                ></div>
                <span :class="isConnected ? 'text-emerald-400' : 'text-gray-500'">
                  {{ isConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400">Client ID</span>
              <code class="text-indigo-400 text-[10px] font-mono bg-slate-700/50 px-2 py-0.5 rounded">
                {{ clientId.substring(0, 8) }}...
              </code>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-2">
          <div class="space-y-1">
            <!-- Test Connection -->
            <button
              @click="testConnection"
              :disabled="testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Test Connection
              </span>
              <span v-if="testing" class="text-xs text-indigo-400">Testing...</span>
            </button>

            <!-- Send Test Task Event -->
            <button
              @click="sendTestTaskEvent"
              :disabled="!isConnected || testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Send Test Task Event
            </button>

            <!-- Send Test Project Event -->
            <button
              @click="sendTestProjectEvent"
              :disabled="!isConnected || testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Send Test Project Event
            </button>

            <!-- Reconnect -->
            <button
              @click="reconnect"
              :disabled="isConnected || testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reconnect
            </button>

            <!-- Disconnect -->
            <button
              @click="disconnect"
              :disabled="!isConnected || testing"
              class="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Disconnect
            </button>

            <!-- Divider -->
            <div class="border-t border-slate-700/30 my-2"></div>

            <!-- Check Backend Health -->
            <button
              @click="checkBackendHealth"
              :disabled="testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check Backend Health
            </button>

            <!-- Test Redis Pub/Sub -->
            <button
              @click="testRedisPubSub"
              :disabled="testing"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Test Redis Pub/Sub
            </button>

            <!-- Join Custom Room -->
            <button
              @click="showJoinRoomDialog"
              :disabled="!isConnected"
              class="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Join Custom Room
            </button>
          </div>
        </div>

        <!-- Event Log -->
        <div class="border-t border-slate-700/30 bg-slate-900/30 max-h-48 overflow-y-auto">
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-medium text-gray-400 uppercase tracking-wide">Event Log</h4>
              <button
                v-if="eventLog.length > 0"
                @click="eventLog = []"
                class="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div v-if="eventLog.length === 0" class="text-xs text-gray-600 text-center py-4">
              No events yet
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="(event, index) in eventLog.slice().reverse()"
                :key="index"
                class="text-xs p-2 bg-slate-800/50 rounded-lg border border-slate-700/30"
              >
                <div class="flex items-center justify-between mb-1">
                  <code class="text-indigo-400 font-mono text-[10px]">{{ event.type }}</code>
                  <span class="text-gray-500 text-[10px]">{{ event.time }}</span>
                </div>
                <div class="text-gray-400 text-[10px] font-mono truncate">
                  {{ event.data }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const socket = useSocket()
const toast = useToast()

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const testing = ref(false)
const eventLog = ref<Array<{ type: string; data: string; time: string }>>([])

const isConnected = computed(() => socket.isConnected.value)
const clientId = computed(() => socket.clientId)

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Listen to all events for logging
  socket.on('task:created', (data: any) => logEvent('task:created', data))
  socket.on('task:updated', (data: any) => logEvent('task:updated', data))
  socket.on('task:deleted', (data: any) => logEvent('task:deleted', data))
  socket.on('task:reordered', (data: any) => logEvent('task:reordered', data))
  socket.on('project:created', (data: any) => logEvent('project:created', data))
  socket.on('project:updated', (data: any) => logEvent('project:updated', data))
  socket.on('project:deleted', (data: any) => logEvent('project:deleted', data))
  socket.on('welcome', (data: any) => logEvent('welcome', data))
  socket.on('reconnected', (data: any) => logEvent('reconnected', data))
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function logEvent(type: string, data: any) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  eventLog.value.push({
    type,
    data: JSON.stringify(data).substring(0, 100),
    time
  })

  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(-20)
  }
}

async function testConnection() {
  testing.value = true
  try {
    if (!isConnected.value) {
      socket.connect()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (isConnected.value) {
      toast.success('WebSocket connection active!')
    } else {
      toast.error('Failed to connect to WebSocket')
    }
  } finally {
    testing.value = false
  }
}

async function sendTestTaskEvent() {
  testing.value = true
  try {
    // Join a test room first
    socket.joinRoom('project:test-project-123')

    // Call backend API to emit event
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/admin/events/test/task-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'test-project-123',
        title: 'Test Task from DevTools ' + new Date().toLocaleTimeString()
      })
    })

    if (response.ok) {
      const data = await response.json()
      logEvent('TEST_TASK_SENT', data)
      toast.success('Test task event sent via backend!')
    } else {
      toast.error('Failed to send test event')
    }
  } catch (error) {
    console.error('Error sending test task event:', error)
    toast.error('Error sending test event')
  } finally {
    testing.value = false
  }
}

async function sendTestProjectEvent() {
  testing.value = true
  try {
    socket.joinRoom('workplace:test-workplace-123')

    // Call backend API to emit event
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/admin/events/test/project-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workplaceId: 'test-workplace-123',
        name: 'Test Project from DevTools ' + new Date().toLocaleTimeString()
      })
    })

    if (response.ok) {
      const data = await response.json()
      logEvent('TEST_PROJECT_SENT', data)
      toast.success('Test project event sent via backend!')
    } else {
      toast.error('Failed to send test event')
    }
  } catch (error) {
    console.error('Error sending test project event:', error)
    toast.error('Error sending test event')
  } finally {
    testing.value = false
  }
}

function reconnect() {
  socket.connect()
  toast.info('Reconnecting...')
}

function disconnect() {
  socket.disconnect()
  toast.info('Disconnected from WebSocket')
}

async function checkBackendHealth() {
  testing.value = true
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/admin/events/health`)

    if (response.ok) {
      const data = await response.json()
      logEvent('HEALTH_CHECK', data)
      toast.success(`Backend healthy! ${data.service}`)
    } else {
      toast.error('Backend health check failed')
    }
  } catch (error) {
    console.error('Health check error:', error)
    toast.error('Failed to reach backend')
  } finally {
    testing.value = false
  }
}

async function testRedisPubSub() {
  testing.value = true
  try {
    // First join a test room
    socket.joinRoom('test:redis-pubsub')

    // Send a custom test event via backend
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/admin/events/test/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room: 'test:redis-pubsub',
        eventType: 'redis:test',
        data: {
          message: 'Redis Pub/Sub test from DevTools',
          timestamp: new Date().toISOString(),
          random: Math.random()
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      logEvent('REDIS_TEST_SENT', data)
      toast.success('Redis Pub/Sub test event sent!')
      toast.info('Check event log below for received event')
    } else {
      toast.error('Failed to send Redis test')
    }
  } catch (error) {
    console.error('Redis test error:', error)
    toast.error('Redis test failed')
  } finally {
    testing.value = false
  }

  // Listen for the test event
  socket.on('redis:test', (data: any) => {
    logEvent('redis:test', data)
    toast.success('✅ Redis Pub/Sub working! Event received.')
  })
}

function showJoinRoomDialog() {
  const roomName = prompt('Enter room name (e.g., project:123, workplace:456):')
  if (roomName) {
    socket.joinRoom(roomName)
    toast.success(`Joined room: ${roomName}`)
    logEvent('ROOM_JOINED', { room: roomName })
  }
}
</script>
