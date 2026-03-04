<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
const { initSettings } = useUISettings()
const { getProfile, isAuthenticated } = useAuth()

onMounted(async () => {
  // 1. Apply localStorage settings immediately for fast first paint
  initTheme()
  initSettings()

  // 2. Override with server-saved settings — getProfile() is cached (5 min TTL),
  //    so this never makes duplicate network requests across page changes.
  if (isAuthenticated.value) {
    const profile = await getProfile()
    const ui = profile?.uiSettings
    if (ui && Object.keys(ui).length > 0) {
      const { theme, ...uiOnly } = ui
      initSettings(uiOnly as Record<string, unknown>)
      if (theme) initTheme(theme)
    }
  }
})
</script>
