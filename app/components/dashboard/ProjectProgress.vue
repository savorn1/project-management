<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Project Progress</h3>
      <NuxtLink to="/projects" class="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
        View all
      </NuxtLink>
    </div>

    <div class="space-y-4">
      <div
        v-for="project in projectsWithProgress"
        :key="project._id"
        class="group"
      >
        <NuxtLink :to="`/projects/${project._id}`" class="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-xl">📁</span>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate">{{ project.name }}</p>
              <p class="text-gray-400 text-sm">{{ project.completedCount }} / {{ project.taskCount }} tasks</p>
            </div>
            <span class="text-white font-semibold">{{ project.progress }}%</span>
          </div>

          <div class="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div
              class="h-full bg-indigo-500 rounded-full transition-all duration-500"
              :style="{ width: `${project.progress}%` }"
            ></div>
          </div>
        </NuxtLink>
      </div>

      <EmptyState
        v-if="projectsWithProgress.length === 0"
        icon="📁"
        title="No projects"
        description="Create your first project to get started"
      />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { projectsWithProgress } = useDashboard()
</script>
