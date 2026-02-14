<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p class="text-gray-400">Welcome back! Here's what's happening with your projects.</p>
      </div>
      <div class="hidden md:block">
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/40">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span class="text-sm text-gray-400">Live updates</span>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <DashboardStats />

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Takes 2/3 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Project Progress -->
        <ProjectProgress />

        <!-- Tasks by Status Overview -->
        <BaseCard>
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-xl">📊</span>
            Tasks Overview
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="group relative p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-slate-600/60 transition-all duration-200 text-center overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-slate-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <p class="text-3xl font-bold text-slate-300 mb-1">{{ tasksByStatus.todo }}</p>
              <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">To Do</p>
            </div>
            <div class="group relative p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-blue-600/40 transition-all duration-200 text-center overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <p class="text-3xl font-bold text-blue-300 mb-1">{{ tasksByStatus.in_progress }}</p>
              <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">In Progress</p>
            </div>
            <div class="group relative p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-amber-600/40 transition-all duration-200 text-center overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <p class="text-3xl font-bold text-amber-300 mb-1">{{ tasksByStatus.in_review }}</p>
              <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">In Review</p>
            </div>
            <div class="group relative p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-emerald-600/40 transition-all duration-200 text-center overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <p class="text-3xl font-bold text-emerald-300 mb-1">{{ tasksByStatus.done }}</p>
              <p class="text-gray-400 text-xs font-medium uppercase tracking-wide">Done</p>
            </div>
          </div>
        </BaseCard>

        <!-- Activity Timeline -->
        <ActivityTimeline />
      </div>

      <!-- Right Column - Takes 1/3 -->
      <div class="space-y-6">
        <!-- Upcoming Deadlines -->
        <UpcomingDeadlines />

        <!-- Recent Tasks -->
        <RecentTasks />
      </div>
    </div>

    <!-- Quick Actions (optional) -->
    <BaseCard>
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span class="text-xl">⚡</span>
        Quick Actions
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NuxtLink
          to="/projects"
          class="group p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-indigo-600/60 hover:bg-indigo-500/10 transition-all duration-200 text-center"
        >
          <div class="text-3xl mb-2">📁</div>
          <p class="text-white font-medium text-sm">New Project</p>
        </NuxtLink>
        <NuxtLink
          to="/tasks"
          class="group p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-blue-600/60 hover:bg-blue-500/10 transition-all duration-200 text-center"
        >
          <div class="text-3xl mb-2">✅</div>
          <p class="text-white font-medium text-sm">New Task</p>
        </NuxtLink>
        <NuxtLink
          to="/tasks"
          class="group p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-emerald-600/60 hover:bg-emerald-500/10 transition-all duration-200 text-center"
        >
          <div class="text-3xl mb-2">👥</div>
          <p class="text-white font-medium text-sm">Team</p>
        </NuxtLink>
        <NuxtLink
          to="/projects"
          class="group p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-amber-600/60 hover:bg-amber-500/10 transition-all duration-200 text-center"
        >
          <div class="text-3xl mb-2">📊</div>
          <p class="text-white font-medium text-sm">Reports</p>
        </NuxtLink>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard | TaskFlow',
  description: 'Project management dashboard'
})

const { tasksByStatus, loadDashboardData, isLoading } = useDashboard()

onMounted(() => {
  loadDashboardData()
})
</script>
