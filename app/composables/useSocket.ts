import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '~/types/socketEvents'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
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
      transports: ['polling', 'websocket'],
      auth: {
        token: tokens.value?.accessToken,
        username: user.value?.name || 'Anonymous',
        userId: user.value?.id ?? '',
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

  function on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: (data: Parameters<ServerToClientEvents[K]>[0]) => void,
  ) {
    socket?.on(event, callback as never)
  }

  function off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: (data: Parameters<ServerToClientEvents[K]>[0]) => void,
  ) {
    if (callback) {
      socket?.off(event, callback as never)
    } else {
      socket?.off(event)
    }
  }

  function emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) {
    socket?.emit(event, ...args)
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
    emit,
  }
}
