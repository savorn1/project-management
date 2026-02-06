<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard
      label="Total Projects"
      :value="stats.totalProjects"
      icon="📁"
      color="indigo"
    />
    <StatCard
      label="Total Tasks"
      :value="stats.totalTasks"
      icon="✅"
      color="blue"
    />
    <StatCard
      label="Completed"
      :value="stats.completedTasks"
      icon="🎉"
      color="emerald"
    />
    <StatCard
      label="Overdue"
      :value="stats.overdueTasks"
      icon="⚠️"
      color="rose"
    />
  </div>
</template>

<script setup lang="ts">
const { stats } = useDashboard()
</script>
