<template>
  <div class="max-w-2xl mx-auto space-y-6">

    <!-- Page header -->
    <div>
      <h2 class="text-2xl font-bold text-white">Settings</h2>
      <p class="text-sm text-slate-400 mt-1">Manage your account preferences and security</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit border border-slate-700/50">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id as 'account' | 'security' | 'appearance'"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :class="activeTab === tab.id
          ? 'accent-tab text-white'
          : 'text-slate-400 hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Account Tab -->
    <template v-if="activeTab === 'account'">

      <!-- Cover Photo -->
      <BaseCard>
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-base font-semibold text-white">Cover Photo</h3>
            <p class="text-xs text-slate-400 mt-0.5">Displayed at the top of your profile page</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="uploadingCover" class="text-xs text-slate-400 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Uploading…
            </span>
            <button
              type="button"
              :disabled="uploadingCover"
              @click="coverInput?.click()"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload image
            </button>
            <button
              v-if="coverPreview"
              type="button"
              @click="previewImage = coverPreview"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview
            </button>
            <button
              v-if="coverPreview"
              type="button"
              :disabled="uploadingCover"
              @click="removeCover"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Cover preview -->
        <div
          class="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors"
          :class="coverPreview ? 'border-transparent' : 'border-slate-700 hover:border-slate-500'"
          @click="coverInput?.click()"
        >
          <img
            v-if="coverPreview"
            :src="coverPreview"
            alt="Cover"
            class="w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-slate-800/10 flex flex-col items-center justify-center gap-2 text-slate-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm">Click to upload a cover photo</span>
            <span class="text-xs">Recommended: 1200 × 300 px</span>
          </div>
          <!-- Upload overlay spinner -->
          <div v-if="uploadingCover" class="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        </div>
        <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverSelected" />
      </BaseCard>

      <!-- Profile Avatar -->
      <BaseCard>
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-base font-semibold text-white">Profile Photo</h3>
            <p class="text-xs text-slate-400 mt-0.5">Shown next to your name across the app</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="uploadingAvatar" class="text-xs text-slate-400 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Uploading…
            </span>
            <button
              type="button"
              :disabled="uploadingAvatar"
              @click="avatarInput?.click()"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Upload photo
            </button>
            <button
              v-if="avatarPreview"
              type="button"
              @click="previewImage = avatarPreview"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview
            </button>
            <button
              v-if="avatarPreview"
              type="button"
              :disabled="uploadingAvatar"
              @click="removeAvatar"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <!-- Avatar preview -->
          <div
            class="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border-2 border-dashed transition-colors"
            :class="avatarPreview ? 'border-transparent' : 'border-slate-700 hover:border-slate-500'"
            @click="avatarInput?.click()"
          >
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex flex-col items-center justify-center gap-1 text-slate-500">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <!-- Upload spinner overlay -->
            <div v-if="uploadingAvatar" class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          </div>

          <!-- Fallback initials preview -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {{ userInitials || 'U' }}
              </div>
              <span class="text-xs text-slate-400">Initials fallback — shown when no photo is set</span>
            </div>
            <p class="text-xs text-slate-500">Square images work best. Max file size: 20 MB.</p>
          </div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarSelected" />
      </BaseCard>

      <!-- Account info form -->
      <BaseCard>
        <h3 class="text-base font-semibold text-white mb-5">Account Information</h3>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
            <input
              v-model="profileForm.name"
              type="text"
              placeholder="Your name"
              class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              v-model="profileForm.email"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-3 pt-2">
            <BaseButton type="submit" :loading="savingProfile" variant="primary">
              Save changes
            </BaseButton>
            <p v-if="profileSuccess" class="text-sm text-emerald-400 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </p>
            <p v-if="profileError" class="text-sm text-red-400">{{ profileError }}</p>
          </div>
        </form>
      </BaseCard>

      <!-- Danger Zone -->
      <BaseCard class="border border-rose-500/20">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-rose-400">Danger Zone</h3>
            <p class="text-xs text-slate-400 mt-1">
              Deactivating your account will immediately sign you out. You won't be able to log in until an administrator reactivates your account.
            </p>
          </div>
          <button
            type="button"
            @click="showDeactivateModal = true"
            class="ml-6 flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 transition-all"
          >
            Deactivate account
          </button>
        </div>
      </BaseCard>

    </template>

    <!-- Appearance Tab -->
    <template v-if="activeTab === 'appearance'">

      <!-- ── Quick Presets ─────────────────────────────────────────────── -->
      <BaseCard :noPadding="true" class="p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-semibold text-white">Quick Presets</h3>
            <p class="text-xs text-slate-400 mt-0.5">One-click combinations to get started fast</p>
          </div>
          <span v-if="activePreset" class="text-[10px] font-semibold px-2 py-0.5 rounded-full accent-badge text-white">Active</span>
        </div>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="p in PRESETS" :key="p.id"
            type="button"
            @click="applyPreset(p)"
            class="group relative flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden"
            :class="activePreset === p.id
              ? 'border-white/25 bg-white/5 shadow-xl'
              : 'border-slate-700/40 hover:border-slate-600 hover:bg-white/[0.03]'"
          >
            <!-- color band -->
            <div class="w-full h-8 rounded-lg flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105"
              :style="{ background: `linear-gradient(135deg, ${p.color}cc, ${p.color2}88)`, boxShadow: `0 4px 12px -2px ${p.color}44` }">
              {{ p.emoji }}
            </div>
            <p class="text-[11px] font-semibold" :class="activePreset === p.id ? 'text-white' : 'text-slate-300'">{{ p.label }}</p>
            <p class="text-[10px] text-slate-500 -mt-1 text-center leading-tight">{{ p.subtitle }}</p>
            <!-- active checkmark -->
            <div v-if="activePreset === p.id" class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full accent-btn flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>
      </BaseCard>

      <!-- ── Accent Color ──────────────────────────────────────────────── -->
      <BaseCard :noPadding="true" class="p-5">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg accent-btn flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 016.32 4H5.68A7 7 0 0112 5zm0 14a7 7 0 01-6.32-4h12.64A7 7 0 0112 19z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white">Accent Color</h3>
            <p class="text-[11px] text-slate-400">Buttons, highlights &amp; active states</p>
          </div>
        </div>
        <div class="grid grid-cols-5 gap-2.5">
          <button
            v-for="t in THEMES" :key="t.id"
            type="button"
            @click="applyTheme(t.id)"
            class="group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200"
            :class="theme === t.id
              ? 'border-white/25 bg-white/5'
              : 'border-slate-700/40 hover:border-slate-600'"
          >
            <div class="w-9 h-9 rounded-lg transition-transform duration-200 group-hover:scale-110 flex items-center justify-center relative"
              :style="{ background: `linear-gradient(135deg, ${t.color}ff, ${t.color}99)`, boxShadow: `0 6px 16px -3px ${t.color}55` }">
              <svg v-if="theme === t.id" class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-[11px] font-semibold" :class="theme === t.id ? 'text-white' : 'text-slate-400'">{{ t.label }}</p>
          </button>
        </div>
      </BaseCard>

      <!-- ── Spacing, Shape & Cards ────────────────────────────────────── -->
      <BaseCard :noPadding="true" class="p-5">
        <div class="flex items-center gap-2 mb-5">
          <div class="w-7 h-7 rounded-lg accent-btn flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white">Spacing &amp; Shape</h3>
            <p class="text-[11px] text-slate-400">Density, radius and card surface style</p>
          </div>
        </div>

        <!-- Row 1: Density + Radius side by side -->
        <div class="grid grid-cols-2 gap-4 mb-5">

          <!-- Density -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-slate-300">Density</p>
              <span class="text-[10px] text-slate-500 capitalize">{{ uiSettings.density }}</span>
            </div>
            <div class="flex gap-1.5">
              <button
                v-for="opt in densityOptions" :key="opt.id"
                type="button"
                @click="uiSet('density', opt.id)"
                class="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border transition-all duration-150"
                :class="uiSettings.density === opt.id
                  ? 'accent-surface border-transparent'
                  : 'border-slate-700/50 hover:border-slate-600'"
              >
                <!-- density visual: rows of lines with different gaps -->
                <div class="flex flex-col gap-[3px] w-6" :style="{ gap: opt.gap }">
                  <div v-for="i in 3" :key="i" class="h-0.5 rounded-full" :class="uiSettings.density === opt.id ? 'bg-white/60' : 'bg-slate-500'"></div>
                </div>
                <p class="text-[10px] font-medium" :class="uiSettings.density === opt.id ? 'accent-text' : 'text-slate-400'">{{ opt.label }}</p>
              </button>
            </div>
          </div>

          <!-- Border Radius -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-slate-300">Radius</p>
              <span class="text-[10px] text-slate-500 capitalize">{{ uiSettings.radius }}</span>
            </div>
            <div class="flex gap-1.5">
              <button
                v-for="opt in radiusOptions" :key="opt.id"
                type="button"
                @click="uiSet('radius', opt.id)"
                class="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border transition-all duration-150"
                :class="uiSettings.radius === opt.id
                  ? 'accent-surface border-transparent'
                  : 'border-slate-700/50 hover:border-slate-600'"
              >
                <div class="w-7 h-5 border-2" :class="uiSettings.radius === opt.id ? 'border-white/60' : 'border-slate-500'"
                  :style="{ borderRadius: opt.preview }"></div>
                <p class="text-[10px] font-medium" :class="uiSettings.radius === opt.id ? 'accent-text' : 'text-slate-400'">{{ opt.label }}</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Row 2: Card Style -->
        <div class="border-t border-slate-700/30 pt-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-medium text-slate-300">Card Style</p>
            <span class="text-[10px] text-slate-500 capitalize">{{ uiSettings.cardStyle }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in cardStyleOptions" :key="opt.id"
              type="button"
              @click="uiSet('cardStyle', opt.id)"
              class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150"
              :class="uiSettings.cardStyle === opt.id
                ? 'accent-surface border-transparent'
                : 'border-slate-700/50 hover:border-slate-600'"
            >
              <!-- Card style visual preview -->
              <div class="w-full h-9 rounded-md flex items-end p-1.5 gap-1 overflow-hidden" :style="opt.previewStyle">
                <div class="h-1 rounded-full w-8" :class="uiSettings.cardStyle === opt.id ? 'bg-white/60' : 'bg-slate-500'"></div>
                <div class="h-1 rounded-full w-4" :class="uiSettings.cardStyle === opt.id ? 'bg-white/30' : 'bg-slate-600'"></div>
              </div>
              <div class="text-center">
                <p class="text-[11px] font-semibold" :class="uiSettings.cardStyle === opt.id ? 'accent-text' : 'text-slate-300'">{{ opt.label }}</p>
                <p class="text-[10px] text-slate-500">{{ opt.description }}</p>
              </div>
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- ── Interface ─────────────────────────────────────────────────── -->
      <BaseCard :noPadding="true" class="p-5">
        <div class="flex items-center gap-2 mb-5">
          <div class="w-7 h-7 rounded-lg accent-btn flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white">Interface</h3>
            <p class="text-[11px] text-slate-400">Sidebar layout and motion preferences</p>
          </div>
        </div>

        <div class="space-y-0 divide-y divide-slate-700/30">

          <!-- Sidebar -->
          <div class="flex items-center justify-between py-3.5">
            <div>
              <p class="text-sm font-medium text-slate-200">Sidebar</p>
              <p class="text-xs text-slate-500 mt-0.5">Full labels or icon-only compact mode</p>
            </div>
            <div class="flex gap-1 p-0.5 bg-slate-900/70 rounded-lg border border-slate-700/40">
              <button
                v-for="opt in sidebarOptions" :key="opt.id"
                type="button"
                @click="uiSet('sidebarCollapsed', opt.value)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                :class="uiSettings.sidebarCollapsed === opt.value ? 'accent-tab text-white' : 'text-slate-400 hover:text-white'"
              >
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="opt.icon" />
                </svg>
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Motion -->
          <div class="flex items-center justify-between py-3.5">
            <div>
              <p class="text-sm font-medium text-slate-200">Animations</p>
              <p class="text-xs text-slate-500 mt-0.5">Transitions, hover effects and motion</p>
            </div>
            <div class="flex gap-1 p-0.5 bg-slate-900/70 rounded-lg border border-slate-700/40">
              <button
                v-for="opt in motionOptions" :key="opt.id"
                type="button"
                @click="uiSet('reduceMotion', opt.value)"
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5"
                :class="uiSettings.reduceMotion === opt.value ? 'accent-tab text-white' : 'text-slate-400 hover:text-white'"
              >
                <span>{{ opt.emoji }}</span>
                {{ opt.label }}
              </button>
            </div>
          </div>

        </div>
      </BaseCard>

      <!-- ── Mini App Preview ──────────────────────────────────────────── -->
      <BaseCard :noPadding="true" class="p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg accent-btn flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Live Preview</h3>
              <p class="text-[11px] text-slate-400">Reflects all settings in real time</p>
            </div>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
          </span>
        </div>

        <!-- Scaled mini-app viewport -->
        <div class="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950" style="height: 256px;">
          <div class="absolute top-0 left-0 pointer-events-none origin-top-left" style="transform: scale(0.42); width: 238.1%; height: 238.1%;">
            <div class="flex h-full">

              <!-- Mini Sidebar -->
              <div class="flex-shrink-0 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col transition-[width] duration-300"
                :style="{ width: uiSettings.sidebarCollapsed ? '72px' : '220px' }">
                <!-- Logo -->
                <div class="px-5 py-4 border-b border-slate-800/50">
                  <div class="flex items-center gap-3" :class="uiSettings.sidebarCollapsed ? 'justify-center' : ''">
                    <div class="accent-logo w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-base">📋</div>
                    <span v-if="!uiSettings.sidebarCollapsed" class="text-base font-bold text-white whitespace-nowrap">TaskFlow</span>
                  </div>
                </div>
                <!-- Nav items -->
                <div class="p-3 space-y-1">
                  <div v-for="item in previewNavItems" :key="item.label"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm"
                    :class="[
                      item.active ? 'accent-nav-active text-white' : 'text-slate-400',
                      uiSettings.sidebarCollapsed ? 'justify-center' : ''
                    ]"
                    :style="{ borderRadius: 'var(--r-card)' }"
                  >
                    <span class="text-base flex-shrink-0">{{ item.icon }}</span>
                    <span v-if="!uiSettings.sidebarCollapsed" class="font-medium">{{ item.label }}</span>
                    <span v-if="item.active && !uiSettings.sidebarCollapsed" class="ml-auto w-1.5 h-1.5 rounded-full accent-dot"></span>
                  </div>
                </div>
              </div>

              <!-- Mini Main Area -->
              <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Header -->
                <div class="h-14 flex-shrink-0 bg-slate-900/80 border-b border-slate-800/50 flex items-center justify-between px-5">
                  <span class="text-lg font-semibold text-white">Dashboard</span>
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/50"></div>
                    <button class="accent-btn px-3 py-1.5 text-xs font-semibold" style="border-radius: var(--r-btn)">+ New</button>
                  </div>
                </div>
                <!-- Content -->
                <div class="flex-1 bg-slate-950 overflow-hidden" style="padding: var(--content-p)">
                  <!-- Stat cards -->
                  <div class="grid grid-cols-3 gap-3 mb-4">
                    <div v-for="s in previewStats" :key="s.label" class="p-4"
                      :style="{
                        background: 'linear-gradient(to bottom right, var(--card-from), var(--card-to))',
                        border: '1px solid var(--card-border)',
                        backdropFilter: 'blur(var(--card-blur))',
                        borderRadius: 'var(--r-card)',
                      }"
                    >
                      <div class="text-2xl font-bold text-white">{{ s.value }}</div>
                      <div class="text-xs text-slate-400 mt-0.5">{{ s.label }}</div>
                    </div>
                  </div>
                  <!-- Content card -->
                  <div class="p-4"
                    :style="{
                      background: 'linear-gradient(to bottom right, var(--card-from), var(--card-to))',
                      border: '1px solid var(--card-border)',
                      backdropFilter: 'blur(var(--card-blur))',
                      borderRadius: 'var(--r-card)',
                    }"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-white">Recent Tasks</span>
                      <button class="accent-btn px-3 py-1 text-xs" style="border-radius: var(--r-btn)">View all</button>
                    </div>
                    <div class="space-y-2">
                      <div v-for="t in previewTasks" :key="t.name"
                        class="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03]"
                        :style="{ borderRadius: 'var(--r-sm)' }"
                      >
                        <div class="w-4 h-4 rounded-full flex-shrink-0" :class="t.done ? 'accent-btn' : 'border-2 border-slate-600'"></div>
                        <span class="text-xs text-slate-300 flex-1">{{ t.name }}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full" :class="t.done ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/60 text-slate-400'" :style="{ borderRadius: 'var(--r-sm)' }">{{ t.status }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <!-- Live badge overlay -->
          <div class="absolute bottom-2 right-2 pointer-events-none">
            <span class="text-[10px] px-2 py-0.5 bg-black/60 rounded-md text-slate-400">100% live</span>
          </div>
        </div>
      </BaseCard>

      <!-- ── Reset ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pt-1">
        <p class="text-xs text-slate-500">Changes are saved automatically to your browser.</p>
        <button
          type="button"
          @click="handleReset"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset to defaults
        </button>
      </div>

    </template>

    <!-- Security Tab -->
    <BaseCard v-if="activeTab === 'security'">
      <h3 class="text-base font-semibold text-white mb-5">Change Password</h3>
      <form @submit.prevent="savePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Current password</label>
          <input
            v-model="passwordForm.current"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
          <input
            v-model="passwordForm.newPwd"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
          <input
            v-model="passwordForm.confirm"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div class="flex items-center gap-3 pt-2">
          <BaseButton type="submit" :loading="savingPassword" variant="primary">
            Update password
          </BaseButton>
          <p v-if="passwordSuccess" class="text-sm text-emerald-400 flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Password updated
          </p>
          <p v-if="passwordError" class="text-sm text-red-400">{{ passwordError }}</p>
        </div>
      </form>
    </BaseCard>

  </div>

  <!-- Image lightbox -->
  <Teleport to="body">
    <div v-if="previewImage" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="previewImage = null">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div class="relative max-w-4xl w-full" @click.stop>
        <button
          type="button"
          @click="previewImage = null"
          class="absolute -top-10 right-0 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
        <img :src="previewImage" alt="Preview" class="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
      </div>
    </div>
  </Teleport>

  <!-- Deactivate confirmation modal -->
  <Teleport to="body">
    <div v-if="showDeactivateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeactivateModal = false" />
      <!-- Dialog -->
      <div class="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
        <!-- Icon -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Deactivate account?</h3>
            <p class="text-xs text-slate-400 mt-0.5">This action cannot be undone by yourself</p>
          </div>
        </div>
        <p class="text-sm text-slate-300">
          You will be immediately signed out. To regain access, contact an administrator to reactivate your account.
        </p>
        <!-- Confirm input -->
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5">
            Type <span class="text-rose-400 font-mono">deactivate</span> to confirm
          </label>
          <input
            v-model="deactivateConfirmText"
            type="text"
            placeholder="deactivate"
            class="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all text-sm"
          />
        </div>
        <div v-if="deactivateError" class="text-sm text-rose-400">{{ deactivateError }}</div>
        <!-- Actions -->
        <div class="flex gap-3 pt-1">
          <button
            type="button"
            @click="showDeactivateModal = false; deactivateConfirmText = ''; deactivateError = null"
            class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="deactivateConfirmText !== 'deactivate' || deactivatingAccount"
            @click="handleDeactivate"
            class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="deactivatingAccount" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Deactivate
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { user, userInitials, updateProfile, changePassword, deactivateAccount, getAuthHeader } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const { theme, applyTheme, THEMES } = useTheme()
const { settings: uiSettings, set: uiSet, resetAll } = useUISettings()

// ─── Appearance option sets ────────────────────────────────────────────────

const PRESETS = [
  { id: 'default', label: 'Default', subtitle: 'Balanced',    emoji: '🎨', color: '#6366f1', color2: '#8b5cf6', accent: 'indigo' as const, density: 'default'     as const, radius: 'default' as const, cardStyle: 'default' as const },
  { id: 'minimal', label: 'Minimal', subtitle: 'Clean & flat',emoji: '⬛', color: '#3b82f6', color2: '#06b6d4', accent: 'blue'   as const, density: 'compact'     as const, radius: 'sharp'   as const, cardStyle: 'solid'   as const },
  { id: 'glass',   label: 'Glass',   subtitle: 'Transparent', emoji: '💎', color: '#8b5cf6', color2: '#a855f7', accent: 'violet' as const, density: 'default'     as const, radius: 'pill'    as const, cardStyle: 'glass'   as const },
  { id: 'cozy',    label: 'Cozy',    subtitle: 'Spacious',    emoji: '☁️', color: '#14b8a6', color2: '#34d399', accent: 'teal'   as const, density: 'comfortable' as const, radius: 'default' as const, cardStyle: 'default' as const },
  { id: 'bold',    label: 'Bold',    subtitle: 'High contrast',emoji:'🔥', color: '#f43f5e', color2: '#ec4899', accent: 'rose'   as const, density: 'compact'     as const, radius: 'default' as const, cardStyle: 'solid'   as const },
]

const activePreset = computed(() =>
  PRESETS.find(p =>
    p.accent     === theme.value &&
    p.density    === uiSettings.value.density &&
    p.radius     === uiSettings.value.radius &&
    p.cardStyle  === uiSettings.value.cardStyle
  )?.id ?? null
)

function applyPreset(p: typeof PRESETS[0]) {
  applyTheme(p.accent)
  uiSet('density',   p.density)
  uiSet('radius',    p.radius)
  uiSet('cardStyle', p.cardStyle)
}

const densityOptions = [
  { id: 'compact'     as const, label: 'Compact',     gap: '2px'  },
  { id: 'default'     as const, label: 'Default',     gap: '4px'  },
  { id: 'comfortable' as const, label: 'Airy',        gap: '7px'  },
]

const radiusOptions = [
  { id: 'sharp'   as const, label: 'Sharp',   preview: '3px'    },
  { id: 'default' as const, label: 'Rounded', preview: '10px'   },
  { id: 'pill'    as const, label: 'Pill',    preview: '9999px' },
]

const cardStyleOptions = [
  { id: 'default' as const, label: 'Default', description: 'Frosted dark',  previewStyle: { background: 'linear-gradient(to br, rgba(30,41,59,0.85), rgba(30,41,59,0.4))', border: '1px solid rgba(51,65,85,0.5)' } },
  { id: 'glass'   as const, label: 'Glass',   description: 'Transparent',   previewStyle: { background: 'linear-gradient(to br, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.12)' } },
  { id: 'solid'   as const, label: 'Solid',   description: 'Flat dark',     previewStyle: { background: 'rgb(20,30,48)', border: '1px solid rgba(51,65,85,0.6)' } },
]

const sidebarOptions = [
  { id: 'expanded',  label: 'Full',  value: false, icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'collapsed', label: 'Icons', value: true,  icon: 'M4 6h6M4 12h6M4 18h6'   },
]

const motionOptions = [
  { id: 'enabled', label: 'Enabled', emoji: '✨', value: false },
  { id: 'reduced', label: 'Reduced', emoji: '🪨', value: true  },
]

// Preview data for mini-app mockup
const previewNavItems = [
  { icon: '📊', label: 'Dashboard', active: true  },
  { icon: '📁', label: 'Projects',  active: false },
  { icon: '✅', label: 'Tasks',     active: false },
]

const previewStats = [
  { value: '145', label: 'Total Tasks'  },
  { value: '23',  label: 'In Progress'  },
  { value: '12',  label: 'Completed'    },
]

const previewTasks = [
  { name: 'Design new dashboard',     done: true,  status: 'Done'        },
  { name: 'Fix authentication bug',   done: false, status: 'In Progress' },
  { name: 'Write API documentation',  done: false, status: 'Todo'        },
]

function handleReset() {
  resetAll()
}

const tabs = [
  { id: 'account',    label: 'Account'    },
  { id: 'security',   label: 'Security'   },
  { id: 'appearance', label: 'Appearance' },
]
const activeTab = ref<'account' | 'security' | 'appearance'>('account')

// Image previews
const avatarPreview = ref<string | null>(user.value?.avatar ?? null)
const coverPreview = ref<string | null>(user.value?.coverImage ?? null)

// File input refs
const avatarInput = ref<HTMLInputElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)

const uploadingAvatar = ref(false)
const uploadingCover = ref(false)

// Profile form
const profileForm = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
})
const savingProfile = ref(false)
const profileSuccess = ref(false)
const profileError = ref<string | null>(null)

// Password form
const passwordForm = reactive({ current: '', newPwd: '', confirm: '' })
const savingPassword = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref<string | null>(null)

// Sync form when user data loads
watch(user, (u) => {
  if (u) {
    profileForm.name = u.name
    profileForm.email = u.email
    if (u.avatar && !avatarPreview.value) avatarPreview.value = u.avatar
    if (u.coverImage && !coverPreview.value) coverPreview.value = u.coverImage
  }
}, { immediate: true })

// ─── Upload helpers ────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  const params = new URLSearchParams({ uploaderId: user.value?.id ?? 'user' })
  const res = await fetch(`${apiBase}/uploads/single?${params}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: fd,
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.url ?? null
}

async function onAvatarSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarPreview.value = URL.createObjectURL(file)
  uploadingAvatar.value = true
  try {
    const url = await uploadImage(file)
    if (url) {
      await updateProfile({ avatar: url })
      avatarPreview.value = url
    }
  } finally {
    uploadingAvatar.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function onCoverSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverPreview.value = URL.createObjectURL(file)
  uploadingCover.value = true
  try {
    const url = await uploadImage(file)
    if (url) {
      await updateProfile({ coverImage: url })
      coverPreview.value = url
    }
  } finally {
    uploadingCover.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function removeAvatar() {
  avatarPreview.value = null
  await updateProfile({ avatar: '' })
}

async function removeCover() {
  coverPreview.value = null
  await updateProfile({ coverImage: '' })
}

// ─── Profile save ──────────────────────────────────────────────────────────

async function saveProfile() {
  profileError.value = null
  profileSuccess.value = false
  savingProfile.value = true
  try {
    await updateProfile({ name: profileForm.name, email: profileForm.email })
    profileSuccess.value = true
    setTimeout(() => { profileSuccess.value = false }, 3000)
  } catch (err) {
    profileError.value = err instanceof Error ? err.message : 'Failed to save'
  } finally {
    savingProfile.value = false
  }
}

// ─── Image lightbox ────────────────────────────────────────────────────────

const previewImage = ref<string | null>(null)

// ─── Deactivate account ────────────────────────────────────────────────────

const showDeactivateModal = ref(false)
const deactivateConfirmText = ref('')
const deactivatingAccount = ref(false)
const deactivateError = ref<string | null>(null)

async function handleDeactivate() {
  deactivateError.value = null
  deactivatingAccount.value = true
  try {
    await deactivateAccount()
    await router.push('/login')
  } catch (err) {
    deactivateError.value = err instanceof Error ? err.message : 'Failed to deactivate account'
  } finally {
    deactivatingAccount.value = false
  }
}

// ─── Password save ─────────────────────────────────────────────────────────

async function savePassword() {
  passwordError.value = null
  passwordSuccess.value = false

  if (passwordForm.newPwd !== passwordForm.confirm) {
    passwordError.value = 'New passwords do not match'
    return
  }
  if (passwordForm.newPwd.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  savingPassword.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.newPwd)
    passwordSuccess.value = true
    passwordForm.current = ''
    passwordForm.newPwd = ''
    passwordForm.confirm = ''
    setTimeout(() => { passwordSuccess.value = false }, 3000)
  } catch (err) {
    passwordError.value = err instanceof Error ? err.message : 'Failed to update password'
  } finally {
    savingPassword.value = false
  }
}
</script>
