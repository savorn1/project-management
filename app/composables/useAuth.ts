export interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

interface AuthResponse {
  success: boolean
  message: string
  user: User
  tokens: AuthTokens
}

interface ProfileResponse {
  success: boolean
  data: User
}

// Global state - persists across components
const user = ref<User | null>(null)
const tokens = ref<AuthTokens | null>(null)
const isAuthenticated = computed(() => !!tokens.value?.accessToken)
const isLoading = ref(false)
const authError = ref<string | null>(null)

export function useAuth() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const router = useRouter()

  // Initialize auth state from localStorage on client
  const initAuth = () => {
    if (import.meta.client) {
      const storedTokens = localStorage.getItem('auth_tokens')
      const storedUser = localStorage.getItem('auth_user')

      if (storedTokens) {
        tokens.value = JSON.parse(storedTokens)
      }
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
    }
  }

  // Save auth state to localStorage
  const saveAuthState = () => {
    if (import.meta.client) {
      if (tokens.value) {
        localStorage.setItem('auth_tokens', JSON.stringify(tokens.value))
      }
      if (user.value) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
    }
  }

  // Clear auth state
  const clearAuthState = () => {
    user.value = null
    tokens.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('auth_user')
    }
  }

  // Get authorization header
  const getAuthHeader = (): Record<string, string> => {
    if (tokens.value?.accessToken) {
      return { Authorization: `Bearer ${tokens.value.accessToken}` }
    }
    return {}
  }

  // Login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    authError.value = null

    try {
      const response = await fetch(`${apiBase}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data: AuthResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        user.value = data.user
        tokens.value = data.tokens
        saveAuthState()
        return true
      }

      throw new Error(data.message || 'Login failed')
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Register
  const register = async (data: RegisterData): Promise<boolean> => {
    isLoading.value = true
    authError.value = null

    try {
      const response = await fetch(`${apiBase}/admin/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: AuthResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      if (result.success) {
        user.value = result.user
        tokens.value = result.tokens
        saveAuthState()
        return true
      }

      throw new Error(result.message || 'Registration failed')
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      if (tokens.value?.accessToken) {
        await fetch(`${apiBase}/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        })
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearAuthState()
      router.push('/login')
    }
  }

  // Get profile
  const getProfile = async (): Promise<User | null> => {
    if (!tokens.value?.accessToken) return null

    try {
      const response = await fetch(`${apiBase}/admin/auth/profile`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthState()
        }
        return null
      }

      const data: ProfileResponse = await response.json()

      if (data.success) {
        user.value = data.data
        saveAuthState()
        return data.data
      }

      return null
    } catch {
      return null
    }
  }

  // Refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!tokens.value?.refreshToken) return false

    try {
      const response = await fetch(`${apiBase}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.value.refreshToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        tokens.value = data.tokens
        saveAuthState()
        return true
      }

      clearAuthState()
      return false
    } catch {
      clearAuthState()
      return false
    }
  }

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    if (!tokens.value) return true

    // Simple check - in production you might decode JWT to check exp
    return false
  }

  // Full name computed
  const fullName = computed(() => {
    return user.value?.name || ''
  })

  // User initials computed
  const userInitials = computed(() => {
    const name = user.value?.name
    if (name) {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
      }
      return parts[0]!.charAt(0).toUpperCase()
    }
    return ''
  })

  return {
    // State
    user: readonly(user),
    tokens: readonly(tokens),
    isAuthenticated,
    isLoading,
    authError,
    fullName,
    userInitials,

    // Methods
    initAuth,
    login,
    register,
    logout,
    getProfile,
    refreshAccessToken,
    isTokenExpired,
    getAuthHeader,
    clearAuthState,
  }
}
