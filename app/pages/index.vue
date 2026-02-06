<template>
  <div class="space-y-6">
    <!-- Stats -->
    <DashboardStats />

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Project Progress - Takes 2 columns -->
      <div class="lg:col-span-2">
        <ProjectProgress />
      </div>

      <!-- Recent Tasks -->
      <div>
        <RecentTasks />
      </div>
    </div>

    <!-- Tasks by Status -->
    <BaseCard>
      <h3 class="text-lg font-semibold text-white mb-4">Tasks Overview</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-slate-700/50 rounded-lg text-center">
          <p class="text-3xl font-bold text-slate-400">{{ tasksByStatus.todo }}</p>
          <p class="text-gray-400 text-sm mt-1">To Do</p>
        </div>
        <div class="p-4 bg-slate-700/50 rounded-lg text-center">
          <p class="text-3xl font-bold text-blue-400">{{ tasksByStatus.in_progress }}</p>
          <p class="text-gray-400 text-sm mt-1">In Progress</p>
        </div>
        <div class="p-4 bg-slate-700/50 rounded-lg text-center">
          <p class="text-3xl font-bold text-amber-400">{{ tasksByStatus.review }}</p>
          <p class="text-gray-400 text-sm mt-1">Review</p>
        </div>
        <div class="p-4 bg-slate-700/50 rounded-lg text-center">
          <p class="text-3xl font-bold text-emerald-400">{{ tasksByStatus.done }}</p>
          <p class="text-gray-400 text-sm mt-1">Done</p>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard | TaskFlow',
  description: 'Project management dashboard'
})

const { tasksByStatus, loadDashboardData, isLoading } = useDashboard()

onMounted(() => {
  loadDashboardData()
})
</script>
