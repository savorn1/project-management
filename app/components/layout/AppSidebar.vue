<template>
  <aside
    class="fixed left-0 top-0 h-screen z-40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col overflow-hidden transition-[width] duration-300"
    style="width: var(--sidebar-w)"
  >
    <!-- Logo -->
    <div class="p-5 border-b border-slate-800/50 flex-shrink-0">
      <NuxtLink to="/" class="sidebar-logo-wrap flex items-center gap-3 group">
        <div class="accent-logo w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <span class="text-xl">📋</span>
        </div>
        <span class="sidebar-logo-text text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent whitespace-nowrap">TaskFlow</span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 overflow-y-auto overflow-x-hidden">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :title="item.label"
            class="sidebar-nav-link flex items-center gap-3 px-4 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
            :style="{ paddingTop: 'var(--nav-py)', paddingBottom: 'var(--nav-py)' }"
            :class="isActive(item.path)
              ? 'accent-nav-active text-white'
              : 'hover:bg-white/5'"
          >
            <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
            <span class="sidebar-label font-medium truncate">{{ item.label }}</span>

            <!-- Unread badge (chat) -->
            <span
              v-if="item.path === '/chat' && totalUnread > 0"
              class="sidebar-label ml-auto min-w-[18px] h-[18px] px-1 accent-badge rounded-full text-[10px] text-white font-bold flex items-center justify-center"
            >
              {{ totalUnread > 99 ? '99+' : totalUnread }}
            </span>
            <span v-else-if="isActive(item.path)" class="sidebar-label ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 accent-dot" />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Collapse toggle -->
    <div class="p-3 border-t border-slate-800/50 flex-shrink-0">
      <button
        type="button"
        @click="toggleSidebar"
        class="sidebar-nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          :class="settings.sidebarCollapsed ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span class="sidebar-collapse-label font-medium text-sm">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { totalUnread } = useChat()
const { settings, set } = useUISettings()

const navItems = [
  { path: '/',              label: 'Dashboard',    icon: '📊' },
  { path: '/workplaces',   label: 'Workplaces',   icon: '🏢' },
  { path: '/projects',     label: 'Projects',     icon: '📁' },
  { path: '/tasks',        label: 'Tasks',        icon: '✅' },
  { path: '/team',         label: 'Team',         icon: '👥' },
  { path: '/chat',         label: 'Chat',         icon: '💬' },
  { path: '/dev-tools',    label: 'Dev Tools',    icon: '🛠️' },
  { path: '/health',       label: 'System Health',icon: '🩺' },
  { path: '/payments',     label: 'Payments',     icon: '💳' },
  { path: '/qr-history',   label: 'QR History',   icon: '🔲' },
  { path: '/fund-pools',   label: 'Fund Pools',   icon: '💰' },
  { path: '/feature-flags',label: 'Feature Flags',icon: '🏳️' },
  { path: '/uploads',      label: 'File Uploads', icon: '📎' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function toggleSidebar() {
  set('sidebarCollapsed', !settings.value.sidebarCollapsed)
}
</script>
