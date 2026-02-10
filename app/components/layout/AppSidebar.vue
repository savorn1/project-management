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
    <nav class="flex-1 p-4">
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
            <span v-if="isActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- User section -->
    <div class="p-4 border-t border-slate-800/50">
      <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-colors cursor-pointer">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span class="text-lg">👨‍💻</span>
        </div>
        <div class="flex-1">
          <p class="text-white font-medium text-sm">Alex Johnson</p>
          <p class="text-emerald-400 text-xs font-medium">Admin</p>
        </div>
        <span class="text-gray-500">⋮</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/workplaces', label: 'Workplaces', icon: '🏢' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/team', label: 'Team', icon: '👥' }
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
