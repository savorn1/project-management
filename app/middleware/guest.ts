export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, initAuth } = useAuth()

  // Initialize auth state from localStorage
  initAuth()

  // If already authenticated, redirect to home
  if (isAuthenticated.value) {
    return navigateTo('/')
  }
})
