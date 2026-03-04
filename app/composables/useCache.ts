interface CacheEntry<T> {
  data: T
  expiresAt: number
}

// Module-level store — survives route navigations, resets on hard refresh
const store = new Map<string, CacheEntry<unknown>>()

export const useCache = () => {
  function get<T>(key: string): T | null {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.data as T
  }

  function set<T>(key: string, data: T, ttlMs: number) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  function invalidate(key: string) {
    store.delete(key)
  }

  function invalidatePrefix(prefix: string) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key)
    }
  }

  /** Fetch from cache or call fetcher, cache the result for ttlMs milliseconds */
  async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 5 * 60 * 1000,
  ): Promise<T> {
    const hit = get<T>(key)
    if (hit !== null) return hit
    const data = await fetcher()
    set(key, data, ttlMs)
    return data
  }

  return { get, set, invalidate, invalidatePrefix, cachedFetch }
}
