<template>
  <aside class="fixed left-0 top-0 h-screen w-64 z-40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-slate-800/50">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
          <span class="text-xl">📋</span>
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">TaskFlow</span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
            :class="isActive(item.path)
              ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
              : 'hover:bg-white/5'"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.label }}</span>

            <!-- Unread badge for Chat -->
            <span
              v-if="item.path === '/chat' && totalUnread > 0"
              class="ml-auto min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              {{ totalUnread > 99 ? '99+' : totalUnread }}
            </span>
            <span v-else-if="isActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { totalUnread } = useChat()

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/workplaces', label: 'Workplaces', icon: '🏢' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/team', label: 'Team', icon: '👥' },
  { path: '/chat', label: 'Chat', icon: '💬' },
  { path: '/dev-tools', label: 'Dev Tools', icon: '🛠️' },
  { path: '/health', label: 'System Health', icon: '🩺' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/qr-history', label: 'QR History', icon: '🔲' },
  { path: '/fund-pools', label: 'Fund Pools', icon: '💰' },
  { path: '/feature-flags', label: 'Feature Flags', icon: '🏳️' },
  { path: '/uploads', label: 'File Uploads', icon: '📎' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
