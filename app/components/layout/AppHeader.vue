<template>
  <header class="h-16 shrink-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 z-20">
    <div>
      <h1 class="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <!-- Search -->
      <div class="relative group">
        <input
          type="text"
          placeholder="Search..."
          class="w-64 px-4 py-2 pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      <!-- Connection Status -->
      <ConnectionStatus />

      <!-- Notifications -->
      <NotificationBell />

      <!-- Settings -->
      <button class="w-10 h-10 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-200 group">
        <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <!-- Divider -->
      <div class="w-px h-8 bg-slate-700/50"></div>

      <!-- User Menu -->
      <div class="relative" ref="userMenuRef">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-3 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {{ userInitials || 'U' }}
          </div>
          <!-- User Info -->
          <div class="text-left hidden sm:block">
            <p class="text-sm font-medium text-white">{{ fullName || 'User' }}</p>
            <p class="text-xs text-slate-400">{{ user?.email || '' }}</p>
          </div>
          <!-- Dropdown Arrow -->
          <svg
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': showUserMenu }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl shadow-black/20 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-slate-700/50">
              <p class="text-sm font-medium text-white">{{ fullName }}</p>
              <p class="text-xs text-slate-400 truncate">{{ user?.email }}</p>
            </div>
            <div class="py-1">
              <button
                @click="handleProfile"
                class="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-3 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </button>
              <button
                @click="handleSettings"
                class="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-3 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
            <div class="border-t border-slate-700/50 py-1">
              <button
                @click="handleLogout"
                class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, fullName, userInitials, logout, initAuth } = useAuth()
const router = useRouter()

const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

// Initialize auth on component mount
onMounted(() => {
  initAuth()
})

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path === '/projects') return 'Projects'
  if (path.startsWith('/projects/')) return 'Project Details'
  if (path === '/tasks') return 'Tasks'
  if (path === '/team') return 'Team'
  if (path === '/workplaces') return 'Workplaces'
  if (path.startsWith('/workplaces/')) return 'Workplace Details'
  if (path === '/dev-tools') return 'Developer Tools'
  if (path === '/profile') return 'Your Profile'
  return 'TaskFlow'
})

const handleProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleSettings = () => {
  showUserMenu.value = false
  // Navigate to settings page when implemented
}

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
