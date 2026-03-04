// Single debounced API sync for all appearance settings
let syncTimer: ReturnType<typeof setTimeout> | null = null

export const useAppearanceSync = () => {
  function scheduleSync() {
    if (!import.meta.client) return
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(async () => {
      try {
        const { theme } = useTheme()
        const { settings } = useUISettings()
        const { updateUiSettings } = useAuth()
        await updateUiSettings({ ...settings.value, theme: theme.value })
      } catch { /* ignore — localStorage is the source of truth */ }
    }, 1000)
  }

  return { scheduleSync }
}
