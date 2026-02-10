export default defineNuxtRouteMiddleware((to) => {
  // Only check auth on client side (localStorage not available on server)
  if (import.meta.server) return

  const { isAuthenticated, initAuth } = useAuth()

  // Initialize auth state from localStorage
  initAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
