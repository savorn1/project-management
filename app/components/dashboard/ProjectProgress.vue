<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white flex items-center gap-2">
        <span class="text-xl">📊</span>
        Project Progress
      </h3>
      <NuxtLink
        to="/projects"
        class="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 group"
      >
        <span>View all</span>
        <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="project in projectsWithProgress"
        :key="project._id"
        class="group"
      >
        <NuxtLink
          :to="`/projects/${project._id}`"
          class="block p-4 bg-slate-700/30 rounded-xl border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-700/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
        >
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-indigo-500/20 flex-shrink-0"
            >
              📁
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-sm mb-1 truncate">{{ project.name }}</p>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span>{{ project.completedCount }} / {{ project.taskCount }} tasks</span>
                <span class="text-gray-600">•</span>
                <span
                  class="font-medium"
                  :class="progressColorClass(project.progress)"
                >
                  {{ project.progress }}% complete
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                class="text-2xl font-bold"
                :class="progressColorClass(project.progress)"
              >
                {{ project.progress }}%
              </span>
            </div>
          </div>

          <!-- Enhanced progress bar -->
          <div class="relative h-2.5 bg-slate-600/50 rounded-full overflow-hidden">
            <!-- Background glow -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
            <!-- Progress fill -->
            <div
              class="relative h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg shadow-indigo-500/30"
              :style="{ width: `${project.progress}%` }"
            >
              <!-- Shine effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
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

function progressColorClass(progress: number): string {
  if (progress === 100) return 'text-emerald-400'
  if (progress >= 75) return 'text-blue-400'
  if (progress >= 50) return 'text-indigo-400'
  if (progress >= 25) return 'text-amber-400'
  return 'text-gray-400'
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
