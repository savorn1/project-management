import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
const isConnected = ref(false)
const pendingRooms = new Set<string>()

// Unique ID per browser tab - used to skip self-events
const clientId = Math.random().toString(36).substring(2) + Date.now().toString(36)

export function useSocket() {
  const config = useRuntimeConfig()
  const { tokens, user } = useAuth()

  function connect() {
    if (socket?.connected) return

    // If socket exists but disconnected, reconnect it
    if (socket) {
      socket.connect()
      return
    }

    const apiBase = config.public.apiBase as string

    socket = io(apiBase, {
      transports: ['websocket', 'polling'],
      auth: {
        token: tokens.value?.accessToken,
        username: user.value?.name || 'Anonymous',
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => {
      isConnected.value = true
      // Re-join all pending rooms on connect/reconnect
      pendingRooms.forEach((room) => {
        socket?.emit('joinRoom', { room })
      })
    })

    socket.on('disconnect', () => {
      isConnected.value = false
    })

    socket.on('connect_error', () => {
      isConnected.value = false
    })
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
      pendingRooms.clear()
    }
  }

  function joinRoom(room: string) {
    pendingRooms.add(room)
    if (socket?.connected) {
      socket.emit('joinRoom', { room })
    }
  }

  function leaveRoom(room: string) {
    pendingRooms.delete(room)
    if (socket?.connected) {
      socket.emit('leaveRoom', { room })
    }
  }

  function on<T = unknown>(event: string, callback: (data: T) => void) {
    socket?.on(event, callback as any)
  }

  function off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      socket?.off(event, callback)
    } else {
      socket?.off(event)
    }
  }

  return {
    clientId,
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    on,
    off,
  }
}
