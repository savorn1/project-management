export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, initAuth } = useAuth()

  // Initialize auth state from localStorage
  initAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
