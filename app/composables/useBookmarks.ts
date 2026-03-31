// Personal message bookmarks — stored in localStorage, never sent to the server.
// Key: `chat-bookmarks` → BookmarkedMessage[]

export interface BookmarkedMessage {
  messageId: string
  conversationId: string
  content: string
  senderName: string
  senderId: string
  createdAt: string
  bookmarkedAt: string
}

const STORAGE_KEY = 'chat-bookmarks'

// Module-level reactive state (singleton)
const bookmarks = ref<BookmarkedMessage[]>([])
let loaded = false

function load() {
  if (loaded) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    bookmarks.value = raw ? JSON.parse(raw) : []
  } catch {
    bookmarks.value = []
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks.value))
  } catch {}
}

export function useBookmarks() {
  if (import.meta.client) load()

  const bookmarkedIds = computed<Set<string>>(() => new Set(bookmarks.value.map(b => b.messageId)))

  function isBookmarked(messageId: string): boolean {
    return bookmarkedIds.value.has(messageId)
  }

  function addBookmark(msg: BookmarkedMessage) {
    if (isBookmarked(msg.messageId)) return
    bookmarks.value = [{ ...msg, bookmarkedAt: new Date().toISOString() }, ...bookmarks.value]
    save()
  }

  function removeBookmark(messageId: string) {
    bookmarks.value = bookmarks.value.filter(b => b.messageId !== messageId)
    save()
  }

  function toggleBookmark(msg: BookmarkedMessage) {
    if (isBookmarked(msg.messageId)) removeBookmark(msg.messageId)
    else addBookmark(msg)
  }

  return {
    bookmarks: readonly(bookmarks),
    bookmarkedIds,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
  }
}
