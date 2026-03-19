<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Toolbar (hidden on print) -->
    <div class="no-print sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center gap-3 flex-wrap">
      <h1 class="text-lg font-bold text-white flex-1">My Resume / CV</h1>

      <!-- Theme Picker -->
      <!-- Theme Picker Dropdown -->
      <div v-if="!editing" class="relative">
        <button
          @click.stop="showThemePicker = !showThemePicker"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm transition-colors border border-slate-700"
        >
          <span class="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20" :style="{ background: activeThemeObj?.swatch }" />
          <span class="text-slate-300 max-w-[140px] truncate">{{ activeThemeObj?.label }}</span>
          <svg class="w-3 h-3 text-slate-400 flex-shrink-0 transition-transform" :class="showThemePicker ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Backdrop -->
        <div v-if="showThemePicker" class="fixed inset-0 z-40" @click="showThemePicker = false" />

        <!-- Dropdown panel -->
        <div
          v-if="showThemePicker"
          @click.stop
          class="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 w-72 max-h-[80vh] overflow-y-auto"
        >
          <div v-for="group in themeGroups" :key="group.label" class="mb-4 last:mb-0">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{{ group.label }}</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="t in group.themes"
                :key="t.key"
                @click="activeTheme = t.key; showThemePicker = false"
                :title="t.label"
                class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all"
                :class="activeTheme === t.key ? 'bg-white/15 ring-1 ring-white/40 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'"
              >
                <span class="w-3 h-3 rounded-full flex-shrink-0 border border-white/20" :style="{ background: t.swatch }" />
                {{ t.label.includes(' · ') ? t.label.split(' · ')[1] : t.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="!editing"
        @click="startEdit"
        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
      >
        ✏️ Edit
      </button>

      <template v-if="editing">
        <button
          @click="cancelEdit"
          class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {{ saving ? 'Saving…' : '💾 Save' }}
        </button>
      </template>

      <button
        v-if="!editing"
        @click="printCV"
        class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
      >
        🖨️ Print / PDF
      </button>

      <!-- Clone / Export / Import -->
      <div v-if="!editing" class="relative flex items-center gap-1">
        <!-- Export JSON -->
        <button
          @click="exportCV"
          title="Export CV as JSON file"
          class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
        >⬇ Export</button>

        <!-- Import JSON -->
        <button
          @click="importFileInput?.click()"
          title="Import CV from JSON file"
          class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
        >⬆ Import</button>
        <input ref="importFileInput" type="file" accept=".json" class="hidden" @change="importCV" />

        <!-- Snapshots -->
        <div class="relative">
          <button
            @click.stop="showSnapshotMenu = !showSnapshotMenu"
            title="Snapshots — save or restore a local copy"
            class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors flex items-center gap-1"
          >
            📋 Snapshots
            <svg class="w-3 h-3 text-slate-400 transition-transform" :class="showSnapshotMenu ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Backdrop -->
          <div v-if="showSnapshotMenu" class="fixed inset-0 z-40" @click="showSnapshotMenu = false" />

          <!-- Dropdown -->
          <div
            v-if="showSnapshotMenu"
            @click.stop
            class="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 w-80"
          >
            <!-- Save new snapshot -->
            <div class="p-3 border-b border-slate-700">
              <button
                @click="saveSnapshot"
                class="w-full px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm font-medium transition-colors text-left"
              >+ Save current CV as snapshot</button>
            </div>

            <!-- Snapshot list -->
            <div class="max-h-72 overflow-y-auto">
              <div v-if="snapshots.length === 0" class="px-4 py-6 text-center text-slate-500 text-sm">
                No snapshots yet.<br>
                <span class="text-xs">Save a snapshot to create a restorable copy.</span>
              </div>
              <div
                v-for="(snap, si) in snapshots"
                :key="si"
                class="flex items-start gap-2 px-3 py-2.5 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/40 group"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-white font-medium truncate">{{ snap.name }}</div>
                  <div class="text-xs text-slate-400">{{ new Date(snap.date).toLocaleString() }}</div>
                </div>
                <button
                  @click="restoreSnapshot(snap)"
                  class="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-700 hover:border-blue-500 transition-colors flex-shrink-0"
                >Restore</button>
                <button
                  @click="deleteSnapshot(si)"
                  class="text-xs text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-red-900/30 transition-colors flex-shrink-0"
                  title="Delete snapshot"
                >✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- CV Document -->
    <div v-else class="flex justify-center py-8 px-4">

      <!-- ════════════════════════════════════════════════════════════
           SPLIT / SIDEBAR LAYOUT  (sl-* themes, view mode only)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-if="isSplitLayout && !editing"
        id="cv-document"
        class="cv-split-paper w-full max-w-3xl shadow-2xl overflow-hidden"
        :class="`theme-${activeTheme}`"
      >
        <!-- Header -->
        <div class="cv-split-header">
          <div class="cv-split-logo">
            <svg width="68" height="68" viewBox="0 0 70 70" fill="none">
              <line x1="35" y1="4"  x2="35" y2="66" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="4"  y1="35" x2="66" y2="35" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="13" y1="13" x2="57" y2="57" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="57" y1="13" x2="13" y2="57" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="35" cy="4"  r="4" fill="white"/>
              <circle cx="35" cy="66" r="4" fill="white"/>
              <circle cx="4"  cy="35" r="4" fill="white"/>
              <circle cx="66" cy="35" r="4" fill="white"/>
              <circle cx="13" cy="13" r="4" fill="white"/>
              <circle cx="57" cy="57" r="4" fill="white"/>
              <circle cx="57" cy="13" r="4" fill="white"/>
              <circle cx="13" cy="57" r="4" fill="white"/>
              <circle cx="35" cy="35" r="5" fill="white"/>
            </svg>
          </div>
          <div class="cv-split-header-info">
            <div class="cv-split-header-name">{{ form.fullName }}</div>
            <div v-if="form.title" class="cv-split-header-title">{{ form.title }}</div>
          </div>
        </div>

        <!-- Body -->
        <div class="cv-split-body">

          <!-- LEFT SIDEBAR -->
          <div class="cv-split-left">
            <!-- Contact -->
            <div class="cv-split-section">
              <h2 class="cv-split-section-title">Contact</h2>
              <div v-if="form.location" class="cv-split-contact-item">
                <span class="cv-split-contact-label">Address :</span>
                <span>{{ form.location }}</span>
              </div>
              <div v-if="form.phone" class="cv-split-contact-item">
                <span class="cv-split-contact-label">Phone :</span>
                <span>{{ form.phone }}</span>
              </div>
              <div v-if="form.email" class="cv-split-contact-item">
                <span class="cv-split-contact-label">Email :</span>
                <span>{{ form.email }}</span>
              </div>
              <div v-if="form.profileUrl" class="cv-split-contact-item">
                <span class="cv-split-contact-label">WWW :</span>
                <a :href="form.profileUrl" target="_blank" class="cv-split-link">Bold Profile</a>
              </div>
            </div>

            <!-- Skills -->
            <div v-if="form.skills.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Skills</h2>
              <div v-for="skill in form.skills" :key="skill" class="cv-split-skill">{{ skill }}</div>
            </div>

            <!-- Languages -->
            <div v-if="form.languages.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Languages</h2>
              <div v-for="lang in form.languages" :key="lang.name" class="cv-split-lang">
                <span class="font-semibold">{{ lang.name }}</span><span v-if="lang.level">:</span>
              </div>
              <div v-for="lang in form.languages" :key="lang.name + '-lvl'" class="cv-split-lang-level">
                <span v-if="lang.level">{{ lang.level }}</span>
              </div>
            </div>

            <!-- Hobbies -->
            <div v-if="form.hobbies.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Hobbies</h2>
              <div v-for="h in form.hobbies" :key="h" class="cv-split-skill">{{ h }}</div>
            </div>

            <!-- Awards -->
            <div v-if="form.awards.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Awards</h2>
              <div v-for="award in form.awards" :key="award.title" class="cv-split-award">
                <div class="font-semibold text-sm">{{ award.title }}</div>
                <div class="text-xs opacity-80">{{ award.organization }}, {{ award.year }}</div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL -->
          <div class="cv-split-right">
            <!-- Summary -->
            <div v-if="form.summary" class="cv-split-section">
              <h2 class="cv-split-section-title">Professional Summary</h2>
              <p class="cv-split-body-text">{{ form.summary }}</p>
            </div>

            <!-- Work History -->
            <div v-if="form.experiences.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Work History</h2>
              <div v-for="(exp, i) in form.experiences" :key="i" class="cv-split-exp">
                <div class="cv-split-exp-header">
                  <span class="cv-split-exp-title">{{ exp.title }},</span>
                  <span class="cv-split-exp-date"> {{ exp.startDate }} to {{ exp.isCurrent ? 'Current' : exp.endDate }}</span>
                </div>
                <div class="cv-split-exp-company">{{ exp.company }}<span v-if="exp.location"> - {{ exp.location }}</span></div>
                <ul class="cv-split-bullets">
                  <li v-for="r in exp.responsibilities" :key="r">{{ r }}</li>
                </ul>
              </div>
            </div>

            <!-- Education -->
            <div v-if="form.education.length" class="cv-split-section">
              <h2 class="cv-split-section-title">Education</h2>
              <div v-for="(edu, i) in form.education" :key="i" class="cv-split-exp">
                <div class="cv-split-exp-title">{{ edu.degree }}</div>
                <div class="cv-split-exp-company">{{ edu.institution }}</div>
                <div class="cv-split-exp-date">{{ edu.year }}</div>
              </div>
            </div>

            <!-- References -->
            <div v-if="form.references.length" class="cv-split-section">
              <h2 class="cv-split-section-title">References</h2>
              <div v-for="ref in form.references" :key="ref.name" class="cv-split-exp">
                <div class="cv-split-exp-title">{{ ref.name }}</div>
                <div class="cv-split-exp-date">{{ ref.jobTitle }}, {{ ref.organization }}</div>
                <div v-if="ref.email || ref.phone" class="cv-split-exp-date">
                  {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           BAR / WORKBOOK LAYOUT  (wb-* themes, view mode only)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="isWbLayout && !editing"
        id="cv-document"
        class="cv-wb-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >
        <!-- Contact bar -->
        <div class="cv-wb-contact-bar">
          <span v-if="form.location">{{ form.location }}</span>
          <span v-if="form.location && (form.phone || form.email || form.profileUrl)" class="cv-wb-sep">|</span>
          <span v-if="form.phone">{{ form.phone }}</span>
          <span v-if="form.phone && (form.email || form.profileUrl)" class="cv-wb-sep">|</span>
          <span v-if="form.email">{{ form.email }}</span>
          <span v-if="form.email && form.profileUrl" class="cv-wb-sep">|</span>
          <span v-if="form.profileUrl"><strong>WWW:</strong> <a :href="form.profileUrl" target="_blank" class="cv-wb-link">Bold Profile</a></span>
        </div>

        <!-- Name area -->
        <div class="cv-wb-name-row">
          <div class="cv-wb-name-label-col"></div>
          <div class="cv-wb-name-content">
            <h1 class="cv-wb-name">{{ form.fullName }}</h1>
            <p v-if="form.title" class="cv-wb-subtitle">{{ form.title }}</p>
          </div>
        </div>

        <!-- SKILLS -->
        <div v-if="form.skills.length" class="cv-wb-section">
          <div class="cv-wb-label">Skills</div>
          <div class="cv-wb-content">
            <div class="cv-wb-skills-grid">
              <span v-for="skill in form.skills" :key="skill" class="cv-wb-skill">• {{ skill }}</span>
            </div>
          </div>
        </div>

        <!-- PROFESSIONAL SUMMARY -->
        <div v-if="form.summary" class="cv-wb-section">
          <div class="cv-wb-label">Professional Summary</div>
          <div class="cv-wb-content">
            <p class="cv-wb-body-text">{{ form.summary }}</p>
          </div>
        </div>

        <!-- WORK HISTORY -->
        <div v-if="form.experiences.length" class="cv-wb-section">
          <div class="cv-wb-label">Work History</div>
          <div class="cv-wb-content">
            <div v-for="(exp, i) in form.experiences" :key="i" class="cv-wb-exp">
              <div class="cv-wb-exp-header">
                <span class="cv-wb-exp-title">{{ exp.title }}</span>
                <span class="cv-wb-exp-date"> {{ exp.startDate }} to {{ exp.isCurrent ? 'Current' : exp.endDate }}</span>
              </div>
              <div class="cv-wb-exp-company">
                {{ exp.company }}<span v-if="exp.location">, {{ exp.location }}</span>
              </div>
              <ul class="cv-wb-bullets">
                <li v-for="r in exp.responsibilities" :key="r">{{ r }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- EDUCATION -->
        <div v-if="form.education.length" class="cv-wb-section">
          <div class="cv-wb-label">Education</div>
          <div class="cv-wb-content">
            <div v-for="(edu, i) in form.education" :key="i" class="cv-wb-exp">
              <div class="cv-wb-exp-title">{{ edu.degree }}</div>
              <div class="cv-wb-exp-company">{{ edu.institution }}</div>
              <div class="cv-wb-exp-date">{{ edu.year }}</div>
              <ul v-if="edu.highlights.length" class="cv-wb-bullets mt-1">
                <li v-for="h in edu.highlights" :key="h">{{ h }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- LANGUAGES -->
        <div v-if="form.languages.length" class="cv-wb-section">
          <div class="cv-wb-label">Languages</div>
          <div class="cv-wb-content">
            <div v-for="lang in form.languages" :key="lang.name" class="cv-wb-body-text">
              <span class="font-semibold">{{ lang.name }}</span>
              <span v-if="lang.level" class="text-gray-500"> — {{ lang.level }}</span>
            </div>
          </div>
        </div>

        <!-- AWARDS -->
        <div v-if="form.awards.length" class="cv-wb-section">
          <div class="cv-wb-label">Awards</div>
          <div class="cv-wb-content">
            <div v-for="award in form.awards" :key="award.title" class="cv-wb-body-text">
              <span class="font-semibold">{{ award.title }}</span>, {{ award.organization }}, {{ award.year }}
            </div>
          </div>
        </div>

        <!-- REFERENCES -->
        <div v-if="form.references.length" class="cv-wb-section">
          <div class="cv-wb-label">References</div>
          <div class="cv-wb-content">
            <div v-for="ref in form.references" :key="ref.name" class="cv-wb-exp">
              <div class="cv-wb-exp-title">{{ ref.name }}</div>
              <div class="cv-wb-body-text">{{ ref.jobTitle }}, {{ ref.organization }}</div>
              <div v-if="ref.email || ref.phone" class="cv-wb-body-text" style="color:#6b7280">
                {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- HOBBIES -->
        <div v-if="form.hobbies.length" class="cv-wb-section">
          <div class="cv-wb-label">Hobbies & Interests</div>
          <div class="cv-wb-content cv-wb-body-text">{{ form.hobbies.join(' • ') }}</div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           DUAL-PANEL LAYOUT  (dp-* themes, view mode only)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="isDpLayout && !editing"
        id="cv-document"
        class="cv-dp-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >
        <!-- Header bar: name left, contact right -->
        <div class="cv-dp-header">
          <div class="cv-dp-header-left">
            <h1 class="cv-dp-name">{{ form.fullName }}</h1>
            <p v-if="form.title" class="cv-dp-job-title">{{ form.title }}</p>
          </div>
          <div class="cv-dp-header-right">
            <div v-if="form.email"><span class="cv-dp-clabel">E:</span> {{ form.email }}</div>
            <div v-if="form.phone"><span class="cv-dp-clabel">P:</span> {{ form.phone }}</div>
            <div v-if="form.location"><span class="cv-dp-clabel">A:</span> {{ form.location }}</div>
            <div v-if="form.profileUrl"><span class="cv-dp-clabel">WWW:</span> <a :href="form.profileUrl" target="_blank" class="cv-dp-link">Bold Profile</a></div>
          </div>
        </div>

        <!-- Two-column body -->
        <div class="cv-dp-body">

          <!-- LEFT: Summary + Work History + Languages + Awards + References -->
          <div class="cv-dp-left">
            <div v-if="form.summary" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Professional Summary</h2>
              <p class="cv-dp-body-text">{{ form.summary }}</p>
            </div>

            <div v-if="form.experiences.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Work History</h2>
              <div v-for="(exp, i) in form.experiences" :key="i" class="cv-dp-exp">
                <div class="cv-dp-exp-header">
                  <span class="cv-dp-exp-company">{{ exp.company }}</span>
                  <span class="cv-dp-exp-sep"> - </span>
                  <em class="cv-dp-exp-title">{{ exp.title }}</em>
                </div>
                <div class="cv-dp-exp-location" v-if="exp.location">{{ exp.location }}
                  <span class="cv-dp-exp-dot">•</span>
                </div>
                <div class="cv-dp-exp-date">{{ exp.startDate }} - {{ exp.isCurrent ? 'Current' : exp.endDate }}</div>
                <ul class="cv-dp-bullets">
                  <li v-for="r in exp.responsibilities" :key="r">{{ r }}</li>
                </ul>
              </div>
            </div>

            <div v-if="form.languages.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Languages</h2>
              <div v-for="lang in form.languages" :key="lang.name" class="cv-dp-body-text">
                <span class="font-semibold">{{ lang.name }}</span>
                <span v-if="lang.level" style="color:#6b7280"> — {{ lang.level }}</span>
              </div>
            </div>

            <div v-if="form.references.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">References</h2>
              <div v-for="ref in form.references" :key="ref.name" class="cv-dp-exp">
                <div class="cv-dp-exp-company">{{ ref.name }}</div>
                <div class="cv-dp-body-text">{{ ref.jobTitle }}, {{ ref.organization }}</div>
                <div v-if="ref.email || ref.phone" class="cv-dp-body-text" style="color:#6b7280">
                  {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Skills + Education + Awards + Hobbies -->
          <div class="cv-dp-right">
            <div v-if="form.skills.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Skills</h2>
              <div class="cv-dp-skills-wrap">
                <span v-for="skill in form.skills" :key="skill" class="cv-dp-skill">{{ skill }}</span>
              </div>
            </div>

            <div v-if="form.education.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Education</h2>
              <div v-for="(edu, i) in form.education" :key="i" class="cv-dp-edu">
                <div class="cv-dp-edu-institution">{{ edu.institution }}</div>
                <div class="cv-dp-edu-year">{{ edu.year }}</div>
                <div class="cv-dp-edu-degree">{{ edu.degree }}</div>
                <ul v-if="edu.highlights.length" class="cv-dp-bullets">
                  <li v-for="h in edu.highlights" :key="h">{{ h }}</li>
                </ul>
              </div>
            </div>

            <div v-if="form.awards.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Awards</h2>
              <div v-for="award in form.awards" :key="award.title" class="cv-dp-edu">
                <div class="cv-dp-edu-institution">{{ award.title }}</div>
                <div class="cv-dp-edu-year">{{ award.organization }}, {{ award.year }}</div>
              </div>
            </div>

            <div v-if="form.hobbies.length" class="cv-dp-section">
              <h2 class="cv-dp-section-title">Hobbies</h2>
              <div v-for="h in form.hobbies" :key="h" class="cv-dp-skill">{{ h }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           CLASSIC SERIF LAYOUT  (cls-* themes, view mode only)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="isClsLayout && !editing"
        id="cv-document"
        class="cv-cls-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >
        <!-- Centered header -->
        <div class="cv-cls-header">
          <h1 class="cv-cls-name">{{ form.fullName }}</h1>
          <div class="cv-cls-contact">
            <div v-if="form.location">{{ form.location }}</div>
            <div>
              <span v-if="form.phone">{{ form.phone }}</span>
              <span v-if="form.phone && form.email"> </span>
              <span v-if="form.email">{{ form.email }}</span>
            </div>
            <div v-if="form.profileUrl"><strong>WWW:</strong> <a :href="form.profileUrl" target="_blank" class="cv-cls-link">Bold Profile</a></div>
          </div>
        </div>

        <!-- Dashed separator -->
        <div class="cv-cls-divider"></div>

        <!-- SKILLS -->
        <div v-if="form.skills.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Skills</h2>
          <div class="cv-cls-indent">
            <div class="cv-cls-skills-grid">
              <span v-for="skill in form.skills" :key="skill" class="cv-cls-skill">• {{ skill }}</span>
            </div>
          </div>
        </div>

        <!-- PROFESSIONAL SUMMARY -->
        <div v-if="form.summary" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Professional Summary</h2>
          <div class="cv-cls-indent cv-cls-body-text">{{ form.summary }}</div>
        </div>

        <!-- WORK HISTORY -->
        <div v-if="form.experiences.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Work History</h2>
          <div class="cv-cls-indent">
            <div v-for="(exp, i) in form.experiences" :key="i" class="cv-cls-exp">
              <div class="cv-cls-exp-header">
                <span class="cv-cls-exp-title">{{ exp.title }}</span>
                <span class="cv-cls-exp-sep"> | </span>
                <span>{{ exp.startDate }} to {{ exp.isCurrent ? 'Current' : exp.endDate }}</span>
              </div>
              <div class="cv-cls-exp-company">{{ exp.company }}<span v-if="exp.location"> - {{ exp.location }}</span></div>
              <ul class="cv-cls-bullets">
                <li v-for="r in exp.responsibilities" :key="r">{{ r }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- EDUCATION -->
        <div v-if="form.education.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Education</h2>
          <div class="cv-cls-indent">
            <div v-for="(edu, i) in form.education" :key="i" class="cv-cls-exp">
              <div class="cv-cls-exp-header">
                <span class="cv-cls-exp-title">{{ edu.degree }}</span>
                <span v-if="edu.year" class="cv-cls-exp-sep"> | </span>
                <span>{{ edu.year }}</span>
              </div>
              <div class="cv-cls-exp-company">{{ edu.institution }}</div>
              <ul v-if="edu.highlights.length" class="cv-cls-bullets">
                <li v-for="h in edu.highlights" :key="h">{{ h }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- LANGUAGES -->
        <div v-if="form.languages.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Languages</h2>
          <div class="cv-cls-indent">
            <div v-for="lang in form.languages" :key="lang.name" class="cv-cls-body-text">
              <span class="font-semibold">{{ lang.name }}</span>
              <span v-if="lang.level" class="text-gray-500"> — {{ lang.level }}</span>
            </div>
          </div>
        </div>

        <!-- AWARDS -->
        <div v-if="form.awards.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Awards</h2>
          <div class="cv-cls-indent">
            <div v-for="award in form.awards" :key="award.title" class="cv-cls-body-text">
              <span class="font-semibold">{{ award.title }}</span>, {{ award.organization }}, {{ award.year }}
            </div>
          </div>
        </div>

        <!-- REFERENCES -->
        <div v-if="form.references.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">References</h2>
          <div class="cv-cls-indent">
            <div v-for="ref in form.references" :key="ref.name" class="cv-cls-exp">
              <div class="cv-cls-exp-title">{{ ref.name }}</div>
              <div class="cv-cls-body-text">{{ ref.jobTitle }}, {{ ref.organization }}</div>
              <div v-if="ref.email || ref.phone" class="cv-cls-body-text" style="color:#6b7280">
                {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- HOBBIES -->
        <div v-if="form.hobbies.length" class="cv-cls-section">
          <h2 class="cv-cls-section-title">Hobbies & Interests</h2>
          <div class="cv-cls-indent cv-cls-body-text">{{ form.hobbies.join(' • ') }}</div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           HEADER-BAR LAYOUT  (hb-* themes, view mode only)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="isHbLayout && !editing"
        id="cv-document"
        class="cv-hb-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >
        <!-- Header: avatar left, name right -->
        <div class="cv-hb-header">
          <div class="cv-hb-avatar-wrap">
            <span class="cv-hb-dot cv-hb-dot-n">✦</span>
            <span class="cv-hb-dot cv-hb-dot-e">✦</span>
            <span class="cv-hb-dot cv-hb-dot-s">✦</span>
            <span class="cv-hb-dot cv-hb-dot-w">✦</span>
            <div class="cv-hb-avatar">{{ initials }}</div>
          </div>
          <div class="cv-hb-header-name">{{ form.fullName }}</div>
        </div>

        <!-- Contact strip -->
        <div class="cv-hb-contact-strip">
          <span v-if="form.email"><span class="cv-hb-clabel">E:</span> {{ form.email }}</span>
          <span v-if="form.phone" class="cv-hb-pipe">|</span>
          <span v-if="form.phone">{{ form.phone }}</span>
          <span v-if="form.location" class="cv-hb-pipe">|</span>
          <span v-if="form.location"><span class="cv-hb-clabel">A:</span> {{ form.location }}</span>
          <span v-if="form.profileUrl" class="cv-hb-pipe">|</span>
          <span v-if="form.profileUrl"><span class="cv-hb-clabel">WWW:</span> <a :href="form.profileUrl" target="_blank" class="cv-hb-link">Bold Profile</a></span>
        </div>

        <!-- Two-column body -->
        <div class="cv-hb-body">

          <!-- LEFT: Summary + Work History + Languages + References -->
          <div class="cv-hb-left">
            <div v-if="form.summary" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Professional Summary</h2>
              <p class="cv-hb-body-text">{{ form.summary }}</p>
            </div>

            <div v-if="form.experiences.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Work History</h2>
              <div v-for="(exp, i) in form.experiences" :key="i" class="cv-hb-exp">
                <div class="cv-hb-exp-header">
                  <span class="cv-hb-exp-company">{{ exp.company }}</span>
                  <span class="cv-hb-exp-sep"> - </span>
                  <em class="cv-hb-exp-title">{{ exp.title }}</em>
                </div>
                <div class="cv-hb-exp-date">{{ exp.startDate }} - {{ exp.isCurrent ? 'Current' : exp.endDate }}</div>
                <ul class="cv-hb-bullets">
                  <li v-for="r in exp.responsibilities" :key="r">{{ r }}</li>
                </ul>
              </div>
            </div>

            <div v-if="form.languages.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Languages</h2>
              <div v-for="lang in form.languages" :key="lang.name" class="cv-hb-body-text">
                <span class="font-semibold">{{ lang.name }}</span>
                <span v-if="lang.level" style="color:#6b7280"> — {{ lang.level }}</span>
              </div>
            </div>

            <div v-if="form.references.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">References</h2>
              <div v-for="ref in form.references" :key="ref.name" class="cv-hb-exp">
                <div class="cv-hb-exp-company">{{ ref.name }}</div>
                <div class="cv-hb-body-text">{{ ref.jobTitle }}, {{ ref.organization }}</div>
                <div v-if="ref.email || ref.phone" class="cv-hb-body-text" style="color:#6b7280">
                  {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vertical divider -->
          <div class="cv-hb-divider"></div>

          <!-- RIGHT: Skills + Education + Awards + Hobbies -->
          <div class="cv-hb-right">
            <div v-if="form.skills.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Skills</h2>
              <div v-for="skill in form.skills" :key="skill" class="cv-hb-skill">{{ skill }}</div>
            </div>

            <div v-if="form.education.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Education</h2>
              <div v-for="(edu, i) in form.education" :key="i" class="cv-hb-edu">
                <div class="cv-hb-edu-institution">{{ edu.institution }}</div>
                <div class="cv-hb-edu-meta">{{ edu.year }}</div>
                <em class="cv-hb-edu-degree">{{ edu.degree }}</em>
                <ul v-if="edu.highlights.length" class="cv-hb-bullets" style="margin-top:0.25rem">
                  <li v-for="h in edu.highlights" :key="h">{{ h }}</li>
                </ul>
              </div>
            </div>

            <div v-if="form.awards.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Awards</h2>
              <div v-for="award in form.awards" :key="award.title" class="cv-hb-edu">
                <div class="cv-hb-edu-institution">{{ award.title }}</div>
                <div class="cv-hb-edu-meta">{{ award.organization }}, {{ award.year }}</div>
              </div>
            </div>

            <div v-if="form.hobbies.length" class="cv-hb-section">
              <h2 class="cv-hb-section-title">Hobbies & Interests</h2>
              <div v-for="h in form.hobbies" :key="h" class="cv-hb-skill">{{ h }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           LP (LABEL PANEL) LAYOUT  (lp-* themes)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="isLpLayout && !editing"
        id="cv-document"
        class="cv-lp-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >
        <!-- Name header -->
        <div class="cv-lp-name-area">
          <h1 class="cv-lp-name">{{ form.fullName }}</h1>
          <p v-if="form.title" class="cv-lp-subtitle">{{ form.title }}</p>
          <div class="cv-lp-name-rule"></div>
        </div>

        <!-- Contact bar -->
        <div class="cv-lp-contact-bar">
          <div v-if="form.phone" class="cv-lp-contact-item">{{ form.phone }}</div>
          <div v-if="form.email" class="cv-lp-contact-item">{{ form.email }}</div>
          <div v-if="form.location" class="cv-lp-contact-item">{{ form.location }}</div>
          <div v-if="form.profileUrl" class="cv-lp-contact-item">WWW: <a :href="form.profileUrl" target="_blank" class="cv-lp-link">Bold Profile</a></div>
        </div>

        <!-- Label-panel rows -->
        <div class="cv-lp-body">

          <div v-if="form.skills.length" class="cv-lp-row">
            <div class="cv-lp-label">Skills</div>
            <div class="cv-lp-content">
              <div class="cv-lp-skills-grid">
                <div v-for="skill in form.skills" :key="skill" class="cv-lp-skill">
                  <span class="cv-lp-bullet">·</span> {{ skill }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="form.summary" class="cv-lp-row">
            <div class="cv-lp-label">Professional<br>Summary</div>
            <div class="cv-lp-content">
              <p class="cv-lp-body-text">{{ form.summary }}</p>
            </div>
          </div>

          <div v-if="form.experiences.length" class="cv-lp-row">
            <div class="cv-lp-label">Work History</div>
            <div class="cv-lp-content">
              <div v-for="(exp, i) in form.experiences" :key="i" class="cv-lp-exp">
                <div class="cv-lp-exp-header">
                  <span class="cv-lp-exp-title">{{ exp.title }}</span>
                  <span class="cv-lp-exp-date">, {{ exp.startDate }} – {{ exp.isCurrent ? 'Current' : exp.endDate }}</span>
                </div>
                <div class="cv-lp-exp-company">{{ exp.company }}<span v-if="exp.location">, {{ exp.location }}</span></div>
                <ul class="cv-lp-bullets">
                  <li v-for="r in exp.responsibilities" :key="r"><span class="cv-lp-bullet">·</span> {{ r }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="form.education.length" class="cv-lp-row">
            <div class="cv-lp-label">Education</div>
            <div class="cv-lp-content">
              <div v-for="(edu, i) in form.education" :key="i" class="cv-lp-edu">
                <div class="cv-lp-exp-title">{{ edu.institution }}</div>
                <div class="cv-lp-exp-dateline">{{ edu.degree }}<span v-if="edu.year"> | {{ edu.year }}</span></div>
                <ul v-if="edu.highlights.length" class="cv-lp-bullets">
                  <li v-for="h in edu.highlights" :key="h"><span class="cv-lp-bullet">·</span> {{ h }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="form.languages.length" class="cv-lp-row">
            <div class="cv-lp-label">Languages</div>
            <div class="cv-lp-content">
              <div v-for="lang in form.languages" :key="lang.name" class="cv-lp-body-text">
                <strong>{{ lang.name }}</strong><span v-if="lang.level" style="color:#6b7280"> — {{ lang.level }}</span>
              </div>
            </div>
          </div>

          <div v-if="form.awards.length" class="cv-lp-row">
            <div class="cv-lp-label">Awards</div>
            <div class="cv-lp-content">
              <div v-for="award in form.awards" :key="award.title" class="cv-lp-edu">
                <div class="cv-lp-exp-title">{{ award.title }}</div>
                <div class="cv-lp-exp-dateline">{{ award.organization }}, {{ award.year }}</div>
              </div>
            </div>
          </div>

          <div v-if="form.references.length" class="cv-lp-row">
            <div class="cv-lp-label">References</div>
            <div class="cv-lp-content">
              <div v-for="ref in form.references" :key="ref.name" class="cv-lp-edu">
                <div class="cv-lp-exp-title">{{ ref.name }}</div>
                <div class="cv-lp-body-text">{{ ref.jobTitle }}, {{ ref.organization }}</div>
                <div v-if="ref.email || ref.phone" class="cv-lp-body-text" style="color:#6b7280">
                  {{ ref.email }}<span v-if="ref.phone"> · {{ ref.phone }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="form.hobbies.length" class="cv-lp-row">
            <div class="cv-lp-label">Hobbies</div>
            <div class="cv-lp-content">
              <div class="cv-lp-skills-grid">
                <div v-for="h in form.hobbies" :key="h" class="cv-lp-skill">
                  <span class="cv-lp-bullet">·</span> {{ h }}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           REGULAR LAYOUT  (all other themes + edit mode)
      ════════════════════════════════════════════════════════════ -->
      <div
        v-else
        id="cv-document"
        class="cv-paper w-full max-w-3xl shadow-2xl"
        :class="`theme-${activeTheme}`"
      >

        <!-- ── HEADER ────────────────────────────────────────────────── -->
        <div class="cv-header">
          <!-- Sidebar theme: two-column header -->
          <div v-if="activeTheme === 'sidebar'" class="cv-sidebar-header">
            <div class="cv-sidebar-left">
              <div class="cv-avatar">{{ initials }}</div>
            </div>
            <div class="cv-sidebar-right">
              <h1 class="cv-name">{{ form.fullName }}</h1>
              <p v-if="form.title" class="cv-job-title">{{ form.title }}</p>
              <div class="cv-contact-row">
                <span v-if="form.location">📍 {{ form.location }}</span>
                <span v-if="form.phone">📞 {{ form.phone }}</span>
                <span v-if="form.email">✉️ {{ form.email }}</span>
                <a v-if="form.profileUrl" :href="form.profileUrl" target="_blank">🔗 Profile</a>
              </div>
            </div>
          </div>

          <!-- All other themes: single-column header -->
          <template v-else>
            <div v-if="!editing" class="cv-header-content">
              <div class="cv-avatar">{{ initials }}</div>
              <div class="flex-1">
                <h1 class="cv-name">{{ form.fullName }}</h1>
                <p v-if="form.title" class="cv-job-title">{{ form.title }}</p>
                <div class="cv-contact-row">
                  <span v-if="form.location">📍 {{ form.location }}</span>
                  <span v-if="form.phone">📞 {{ form.phone }}</span>
                  <span v-if="form.email">✉️ {{ form.email }}</span>
                  <a v-if="form.profileUrl" :href="form.profileUrl" target="_blank">🔗 Profile</a>
                </div>
              </div>
            </div>

            <!-- Edit: personal info -->
            <div v-else class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="cv-label">Full Name *</label>
                <input v-model="form.fullName" class="cv-input" placeholder="Bon Savorn" />
              </div>
              <div>
                <label class="cv-label">Job Title</label>
                <input v-model="form.title" class="cv-input" placeholder="Backend Developer" />
              </div>
              <div>
                <label class="cv-label">Location</label>
                <input v-model="form.location" class="cv-input" placeholder="Phnom Penh, Cambodia" />
              </div>
              <div>
                <label class="cv-label">Phone</label>
                <input v-model="form.phone" class="cv-input" placeholder="+855 96 933 0563" />
              </div>
              <div>
                <label class="cv-label">Email</label>
                <input v-model="form.email" class="cv-input" placeholder="you@example.com" />
              </div>
              <div class="col-span-2">
                <label class="cv-label">Profile / Portfolio URL</label>
                <input v-model="form.profileUrl" class="cv-input" placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
          </template>
        </div>

        <!-- ── SKILLS ────────────────────────────────────────────────── -->
        <section class="cv-section">
          <h2 class="cv-section-title">Skills</h2>
          <div class="cv-section-body">
            <div v-if="!editing" class="cv-skills-list flex flex-wrap gap-2">
              <span v-for="skill in form.skills" :key="skill" class="cv-skill-tag">{{ skill }}</span>
            </div>
            <div v-else>
              <p class="text-xs text-gray-500 mb-2">Comma-separated list of skills</p>
              <textarea v-model="skillsText" rows="3" class="cv-input" placeholder="Git, PHP, Laravel, MySQL, TypeScript, Vue.js, Node.js" />
            </div>
          </div>
        </section>

        <!-- ── SUMMARY ───────────────────────────────────────────────── -->
        <section class="cv-section">
          <h2 class="cv-section-title">Professional Summary</h2>
          <div class="cv-section-body">
            <p v-if="!editing" class="cv-body-text">{{ form.summary }}</p>
            <textarea v-else v-model="form.summary" rows="5" class="cv-input" placeholder="Describe your professional background…" />
          </div>
        </section>

        <!-- ── WORK EXPERIENCE ───────────────────────────────────────── -->
        <section class="cv-section">
          <div class="cv-section-head flex items-center justify-between mb-3">
            <h2 class="cv-section-title !mb-0">Work History</h2>
            <span v-if="editing" class="flex gap-1">
              <button @click="addExperience('first')" class="cv-add-btn">+ First</button>
              <button @click="addExperience('last')" class="cv-add-btn">+ Last</button>
            </span>
          </div>
          <div class="cv-section-body">

            <template v-for="(exp, i) in form.experiences" :key="i">
              <!-- Insert-between strip (between entries, edit mode only) -->
              <div v-if="editing && i > 0" class="flex items-center gap-1 my-1">
                <div class="flex-1 border-t border-dashed border-gray-200" />
                <button
                  @click="addExperienceAt(i)"
                  class="text-xs text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded border border-blue-200 hover:border-blue-400 bg-white transition-colors"
                >+ insert here</button>
                <div class="flex-1 border-t border-dashed border-gray-200" />
              </div>

              <div class="cv-item">
                <!-- View mode -->
                <div v-if="!editing">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="cv-exp-title">{{ exp.title }}</h3>
                      <p class="cv-exp-company">{{ exp.company }}<span v-if="exp.location" class="cv-exp-location"> | {{ exp.location }}</span></p>
                    </div>
                    <span class="cv-date">{{ exp.startDate }} – {{ exp.isCurrent ? 'Current' : exp.endDate }}</span>
                  </div>
                  <ul class="mt-2 space-y-1">
                    <li v-for="(r, ri) in exp.responsibilities" :key="ri" class="cv-body-text flex gap-2">
                      <span class="cv-bullet mt-0.5 flex-shrink-0">•</span>{{ r }}
                    </li>
                  </ul>
                </div>

                <!-- Edit mode -->
                <div v-else class="space-y-2">
                  <!-- Entry header row -->
                  <div class="flex items-center gap-1 bg-gray-50 rounded px-2 py-1.5">
                    <!-- Collapse toggle -->
                    <button @click="toggleExpCollapse(i)" class="text-gray-400 hover:text-gray-600 mr-1 text-xs w-4">
                      {{ expCollapsed[i] ? '▶' : '▼' }}
                    </button>
                    <!-- Summary label -->
                    <span class="flex-1 text-xs font-semibold text-gray-600 truncate">
                      <span v-if="exp.title || exp.company">{{ exp.title || '—' }}<span class="text-gray-400 font-normal" v-if="exp.company"> @ {{ exp.company }}</span></span>
                      <span v-else class="text-gray-400 italic">Experience #{{ i + 1 }}</span>
                    </span>
                    <!-- Reorder -->
                    <button @click="moveExpUp(i)" :disabled="i === 0" class="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs px-1" title="Move up">↑</button>
                    <button @click="moveExpDown(i)" :disabled="i === form.experiences.length - 1" class="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs px-1" title="Move down">↓</button>
                    <!-- Duplicate -->
                    <button @click="duplicateExperience(i)" class="text-blue-400 hover:text-blue-600 text-xs px-1" title="Duplicate">⧉</button>
                    <!-- Remove -->
                    <button @click="removeExperience(i)" class="text-red-400 hover:text-red-600 text-xs px-1" title="Remove">✕</button>
                  </div>

                  <!-- Collapsible form body -->
                  <div v-if="!expCollapsed[i]" class="space-y-2 pt-1">
                    <div class="grid grid-cols-2 gap-2">
                      <div><label class="cv-label">Job Title *</label><input v-model="exp.title" class="cv-input" placeholder="Backend Developer" /></div>
                      <div><label class="cv-label">Company *</label><input v-model="exp.company" class="cv-input" placeholder="Company Name" /></div>
                      <div><label class="cv-label">Location</label><input v-model="exp.location" class="cv-input" placeholder="Phnom Penh" /></div>
                      <div><label class="cv-label">Start Date *</label><input v-model="exp.startDate" class="cv-input" placeholder="01/2022" /></div>
                      <div><label class="cv-label">End Date</label><input v-model="exp.endDate" class="cv-input" placeholder="12/2024" :disabled="exp.isCurrent" /></div>
                      <div class="flex items-center gap-2 pt-5">
                        <input type="checkbox" v-model="exp.isCurrent" :id="`current-${i}`" class="w-4 h-4" />
                        <label :for="`current-${i}`" class="text-sm text-gray-700">Currently working here</label>
                      </div>
                    </div>
                    <div>
                      <label class="cv-label">Responsibilities (one per line)</label>
                      <textarea
                        :value="exp.responsibilities.join('\n')"
                        @input="exp.responsibilities = ($event.target as HTMLTextAreaElement).value.split('\n')"
                        rows="4" class="cv-input"
                        placeholder="Developed RESTful APIs…&#10;Integrated third-party APIs…"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

          </div><!-- /cv-section-body Work History -->
        </section>

        <!-- ── EDUCATION ─────────────────────────────────────────────── -->
        <section class="cv-section">
          <div class="cv-section-head flex items-center justify-between mb-3">
            <h2 class="cv-section-title !mb-0">Education</h2>
            <button v-if="editing" @click="addEducation" class="cv-add-btn">+ Add</button>
          </div>
          <div class="cv-section-body">
            <div v-for="(edu, i) in form.education" :key="i" class="cv-item">
              <div v-if="!editing">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="cv-exp-company font-semibold">{{ edu.degree }}</h3>
                    <p class="cv-body-text">{{ edu.institution }}</p>
                  </div>
                  <span class="cv-date">{{ edu.year }}</span>
                </div>
                <ul v-if="edu.highlights.length" class="mt-1 space-y-0.5">
                  <li v-for="(h, hi) in edu.highlights" :key="hi" class="cv-body-text flex gap-2">
                    <span class="cv-bullet flex-shrink-0">•</span>{{ h }}
                  </li>
                </ul>
              </div>
              <div v-else class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-gray-500 uppercase">Education #{{ i + 1 }}</span>
                  <button @click="removeEducation(i)" class="text-red-500 hover:text-red-700 text-xs">✕ Remove</button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div><label class="cv-label">Degree / Program *</label><input v-model="edu.degree" class="cv-input" placeholder="Information and Communication Engineering" /></div>
                  <div><label class="cv-label">Institution *</label><input v-model="edu.institution" class="cv-input" placeholder="Institute of Technology of Cambodia" /></div>
                  <div><label class="cv-label">Year</label><input v-model="edu.year" class="cv-input" placeholder="2018" /></div>
                </div>
                <div>
                  <label class="cv-label">Highlights (one per line)</label>
                  <textarea
                    :value="edu.highlights.join('\n')"
                    @input="edu.highlights = ($event.target as HTMLTextAreaElement).value.split('\n')"
                    rows="3" class="cv-input"
                    placeholder="Developed Event Kh website using Laravel…"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── LANGUAGES ─────────────────────────────────────────────── -->
        <section class="cv-section">
          <div class="cv-section-head flex items-center justify-between mb-3">
            <h2 class="cv-section-title !mb-0">Languages</h2>
            <button v-if="editing" @click="addLanguage" class="cv-add-btn">+ Add</button>
          </div>
          <div class="cv-section-body">
            <div v-if="!editing" class="flex flex-wrap gap-4">
              <div v-for="lang in form.languages" :key="lang.name" class="cv-body-text">
                <span class="font-medium">{{ lang.name }}</span>
                <span v-if="lang.level" class="text-gray-500">: {{ lang.level }}</span>
              </div>
            </div>
            <div v-else class="space-y-2">
              <div v-for="(lang, i) in form.languages" :key="i" class="flex gap-2 items-center">
                <input v-model="lang.name" class="cv-input flex-1" placeholder="Khmer" />
                <input v-model="lang.level" class="cv-input flex-1" placeholder="Native" />
                <button @click="removeLanguage(i)" class="text-red-500 hover:text-red-700 text-sm flex-shrink-0">✕</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ── AWARDS ────────────────────────────────────────────────── -->
        <section class="cv-section">
          <div class="cv-section-head flex items-center justify-between mb-3">
            <h2 class="cv-section-title !mb-0">Awards</h2>
            <button v-if="editing" @click="addAward" class="cv-add-btn">+ Add</button>
          </div>
          <div class="cv-section-body">
            <div v-if="!editing" class="space-y-1">
              <p v-for="award in form.awards" :key="award.title" class="cv-body-text">
                <span class="font-medium">{{ award.title }}</span>, {{ award.organization }}, {{ award.year }}
              </p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="(award, i) in form.awards" :key="i" class="grid grid-cols-3 gap-2 items-center">
                <input v-model="award.title" class="cv-input" placeholder="Best Staff" />
                <input v-model="award.organization" class="cv-input" placeholder="CloudNET" />
                <div class="flex gap-2 items-center">
                  <input v-model="award.year" class="cv-input" placeholder="2019" />
                  <button @click="removeAward(i)" class="text-red-500 hover:text-red-700 text-sm flex-shrink-0">✕</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── REFERENCES ─────────────────────────────────────────────── -->
        <section class="cv-section">
          <div class="cv-section-head flex items-center justify-between mb-3">
            <h2 class="cv-section-title !mb-0">References</h2>
            <button v-if="editing" @click="addReference" class="cv-add-btn">+ Add</button>
          </div>
          <div class="cv-section-body">
            <div v-if="!editing" class="space-y-1">
              <p v-for="ref in form.references" :key="ref.name" class="cv-body-text">
                {{ ref.name }}, {{ ref.jobTitle }}, {{ ref.organization }}<span v-if="ref.email">, {{ ref.email }}</span><span v-if="ref.phone">, {{ ref.phone }}</span>
              </p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(ref, i) in form.references" :key="i" class="border border-gray-200 rounded p-3 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-semibold text-gray-500 uppercase">Reference #{{ i + 1 }}</span>
                  <button @click="removeReference(i)" class="text-red-500 hover:text-red-700 text-xs">✕ Remove</button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="ref.name" class="cv-input" placeholder="Name" />
                  <input v-model="ref.jobTitle" class="cv-input" placeholder="Job Title" />
                  <input v-model="ref.organization" class="cv-input" placeholder="Company" />
                  <input v-model="ref.email" class="cv-input" placeholder="Email" />
                  <input v-model="ref.phone" class="cv-input" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── HOBBIES ────────────────────────────────────────────────── -->
        <section class="cv-section">
          <h2 class="cv-section-title">Hobbies & Interests</h2>
          <div class="cv-section-body">
            <div v-if="!editing" class="flex flex-wrap gap-3">
              <span v-for="h in form.hobbies" :key="h" class="cv-body-text">• {{ h }}</span>
            </div>
            <div v-else>
              <p class="text-xs text-gray-500 mb-1">Comma-separated</p>
              <input v-model="hobbiesText" class="cv-input" placeholder="Reading book, Research new technology" />
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkExperience, ResumeEducation, ResumeLanguage, ResumeAward, ResumeReference } from '~/types'

useHead({ title: 'Resume / CV' })

const { resume, loading, saving, fetchResume, saveResume } = useResume()

const editing = ref(false)

// ─── Themes ──────────────────────────────────────────────────────────────────

const themes = [
  { key: 'classic',      label: 'Classic (Blue)',         swatch: '#2563eb' },
  { key: 'professional', label: 'Professional (Navy)',     swatch: '#1e3a5f' },
  { key: 'modern',       label: 'Modern (Teal)',           swatch: '#0d9488' },
  { key: 'creative',     label: 'Creative (Purple)',       swatch: '#7c3aed' },
  { key: 'minimal',      label: 'Minimal (Gray)',          swatch: '#374151' },
  { key: 'sidebar',      label: 'Sidebar (Dark)',          swatch: '#111827' },
  { key: 'tc-blue',    label: 'Pro · Blue',     swatch: '#2563eb' },
  { key: 'tc-navy',    label: 'Pro · Navy',     swatch: '#1e3a5f' },
  { key: 'tc-teal',    label: 'Pro · Teal',     swatch: '#0d9488' },
  { key: 'tc-red',     label: 'Pro · Red',      swatch: '#dc2626' },
  { key: 'tc-purple',  label: 'Pro · Purple',   swatch: '#7c3aed' },
  { key: 'tc-dark',    label: 'Pro · Dark',     swatch: '#10b981' },
  { key: 'tc-slate',   label: 'Pro · Slate',    swatch: '#475569' },
  { key: 'tc-copper',  label: 'Pro · Copper',   swatch: '#b45309' },
  { key: 'tc-indigo',  label: 'Pro · Indigo',   swatch: '#4338ca' },
  { key: 'tc-forest',  label: 'Pro · Forest',   swatch: '#15803d' },
  // 2026 Colour Palette — Pro layout
  { key: 'tc-mocha',    label: '2026 · Mocha',    swatch: '#8B5E52' },
  { key: 'tc-lavender', label: '2026 · Lavender', swatch: '#7C6DB5' },
  { key: 'tc-terra',    label: '2026 · Terra',    swatch: '#C4704F' },
  { key: 'tc-moss',     label: '2026 · Moss',     swatch: '#4A7A50' },
  { key: 'tc-cobalt',   label: '2026 · Cobalt',   swatch: '#1E4D9E' },
  { key: 'tc-sand',     label: '2026 · Sand',     swatch: '#B8956A' },
  { key: 'tc-rose',     label: '2026 · Rose',     swatch: '#B87890' },
  // 2026 Colour Palette — Dual layout
  { key: 'dp-mocha',    label: '2026 Dual · Mocha',    swatch: '#8B5E52' },
  { key: 'dp-lavender', label: '2026 Dual · Lavender', swatch: '#7C6DB5' },
  { key: 'dp-terra',    label: '2026 Dual · Terra',    swatch: '#C4704F' },
  { key: 'dp-moss',     label: '2026 Dual · Moss',     swatch: '#4A7A50' },
  { key: 'dp-sand',     label: '2026 Dual · Sand',     swatch: '#B8956A' },
  // Dual-panel layout
  { key: 'dp-blue',     label: 'Dual · Blue',     swatch: '#8faec8' },
  { key: 'dp-green',    label: 'Dual · Green',    swatch: '#7aaa7a' },
  { key: 'dp-warm',     label: 'Dual · Warm',     swatch: '#c4a87a' },
  { key: 'dp-purple',   label: 'Dual · Purple',   swatch: '#9b72cf' },
  { key: 'dp-slate',    label: 'Dual · Slate',    swatch: '#64748b' },
  { key: 'dp-crimson',  label: 'Dual · Crimson',  swatch: '#9d174d' },
  { key: 'dp-teal',     label: 'Dual · Teal',     swatch: '#0f766e' },
  { key: 'dp-charcoal', label: 'Dual · Charcoal', swatch: '#334155' },
  // Classic serif layout
  { key: 'cls-serif',   label: 'Classic · Serif',   swatch: '#374151' },
  { key: 'cls-ivory',   label: 'Classic · Ivory',   swatch: '#c4a87a' },
  { key: 'cls-sage',    label: 'Classic · Sage',    swatch: '#6daa7a' },
  { key: 'cls-steel',   label: 'Classic · Steel',   swatch: '#4a6fa5' },
  { key: 'cls-crimson', label: 'Classic · Crimson', swatch: '#9d174d' },
  // Bar / workbook layout
  { key: 'wb-blue',     label: 'Bar · Blue',     swatch: '#8faec8' },
  { key: 'wb-green',    label: 'Bar · Green',    swatch: '#7aaa7a' },
  { key: 'wb-warm',     label: 'Bar · Warm',     swatch: '#c4a87a' },
  { key: 'wb-slate',    label: 'Bar · Slate',    swatch: '#7a8898' },
  { key: 'wb-rose',     label: 'Bar · Rose',     swatch: '#c07090' },
  { key: 'wb-purple',   label: 'Bar · Purple',   swatch: '#7c3aed' },
  { key: 'wb-navy',     label: 'Bar · Navy',     swatch: '#1e3a5f' },
  // Sidebar split layout
  { key: 'sl-ocean',    label: 'Side · Ocean',    swatch: '#3a4f5a' },
  { key: 'sl-navy',     label: 'Side · Navy',     swatch: '#1e3a5f' },
  { key: 'sl-forest',   label: 'Side · Forest',   swatch: '#1a3d2b' },
  { key: 'sl-charcoal', label: 'Side · Charcoal', swatch: '#1c1c2e' },
  { key: 'sl-burgundy', label: 'Side · Burgundy', swatch: '#5c1010' },
  { key: 'sl-plum',     label: 'Side · Plum',     swatch: '#4c1d95' },
  { key: 'sl-teal',     label: 'Side · Teal',     swatch: '#134e4a' },
  // Label Panel layout
  { key: 'lp-teal',   label: 'Panel · Teal',   swatch: '#2a6b56' },
  { key: 'lp-navy',   label: 'Panel · Navy',   swatch: '#2d5282' },
  { key: 'lp-forest', label: 'Panel · Forest', swatch: '#166534' },
  { key: 'lp-slate',  label: 'Panel · Slate',  swatch: '#475569' },
  { key: 'lp-plum',   label: 'Panel · Plum',   swatch: '#6d28d9' },
  { key: 'lp-mocha',  label: 'Panel · Mocha',  swatch: '#8B5E52' },
  // Header-bar layout
  { key: 'hb-blue',    label: 'HBar · Blue',    swatch: '#8faec8' },
  { key: 'hb-teal',    label: 'HBar · Teal',    swatch: '#5aaa9a' },
  { key: 'hb-sage',    label: 'HBar · Sage',    swatch: '#7aaa7a' },
  { key: 'hb-slate',   label: 'HBar · Slate',   swatch: '#7a8898' },
  { key: 'hb-warm',    label: 'HBar · Warm',    swatch: '#c4a87a' },
  { key: 'hb-crimson', label: 'HBar · Crimson', swatch: '#9d174d' },
  { key: 'hb-navy',    label: 'HBar · Navy',    swatch: '#1e3a5f' },
  { key: 'hb-forest',  label: 'HBar · Forest',  swatch: '#14532d' },
]

const activeTheme = ref<string>('classic')

const isSplitLayout = computed(() => activeTheme.value.startsWith('sl-'))
const isWbLayout    = computed(() => activeTheme.value.startsWith('wb-'))
const isClsLayout   = computed(() => activeTheme.value.startsWith('cls-'))
const isDpLayout    = computed(() => activeTheme.value.startsWith('dp-'))
const isHbLayout    = computed(() => activeTheme.value.startsWith('hb-'))
const isLpLayout    = computed(() => activeTheme.value.startsWith('lp-'))

// ─── Theme picker UI ──────────────────────────────────────────────────────────

const showThemePicker = ref(false)
const activeThemeObj  = computed(() => themes.find(t => t.key === activeTheme.value))
const themeGroups = [
  { label: '✦ 2026 Collection · Pro',  themes: themes.filter(t => t.label.startsWith('2026 ·')) },
  { label: '✦ 2026 Collection · Dual', themes: themes.filter(t => t.label.startsWith('2026 Dual')) },
  { label: 'Base',          themes: themes.filter(t => ['classic','professional','modern','creative','minimal','sidebar'].includes(t.key)) },
  { label: 'Pro (Two-Col)', themes: themes.filter(t => t.key.startsWith('tc-') && !t.label.startsWith('2026')) },
  { label: 'Dual Panel',    themes: themes.filter(t => t.key.startsWith('dp-') && !t.label.startsWith('2026')) },
  { label: 'Classic Serif', themes: themes.filter(t => t.key.startsWith('cls-')) },
  { label: 'Bar',           themes: themes.filter(t => t.key.startsWith('wb-')) },
  { label: 'Label Panel',   themes: themes.filter(t => t.key.startsWith('lp-')) },
  { label: 'Header Bar',    themes: themes.filter(t => t.key.startsWith('hb-')) },
  { label: 'Sidebar Split', themes: themes.filter(t => t.key.startsWith('sl-')) },
]

// ─── Form state ───────────────────────────────────────────────────────────────

const emptyForm = () => ({
  fullName: '',
  title: '',
  phone: '',
  email: '',
  location: '',
  profileUrl: '',
  summary: '',
  skills: [] as string[],
  experiences: [] as WorkExperience[],
  education: [] as ResumeEducation[],
  languages: [] as ResumeLanguage[],
  awards: [] as ResumeAward[],
  references: [] as ResumeReference[],
  hobbies: [] as string[],
})

const form = reactive(emptyForm())

const skillsText = computed({
  get: () => form.skills.join(', '),
  set: (v: string) => { form.skills = v.split(',').map(s => s.trim()).filter(Boolean) },
})

const hobbiesText = computed({
  get: () => form.hobbies.join(', '),
  set: (v: string) => { form.hobbies = v.split(',').map(s => s.trim()).filter(Boolean) },
})

const initials = computed(() => {
  const parts = form.fullName.trim().split(' ')
  return parts.length >= 2
    ? ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
    : form.fullName.slice(0, 2).toUpperCase()
})

// ─── Load ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await fetchResume()
  if (resume.value) syncFormFromResume()
  else prefillDefault()
})

function syncFormFromResume() {
  const r = resume.value!
  form.fullName   = r.fullName   ?? ''
  form.title      = r.title      ?? ''
  form.phone      = r.phone      ?? ''
  form.email      = r.email      ?? ''
  form.location   = r.location   ?? ''
  form.profileUrl = r.profileUrl ?? ''
  form.summary    = r.summary    ?? ''
  form.skills     = [...(r.skills ?? [])]
  form.experiences = r.experiences.map(e => ({ ...e, responsibilities: [...e.responsibilities] }))
  form.education   = r.education.map(e => ({ ...e, highlights: [...e.highlights] }))
  form.languages   = r.languages.map(l => ({ ...l }))
  form.awards      = r.awards.map(a => ({ ...a }))
  form.references  = r.references.map(r => ({ ...r }))
  form.hobbies     = [...(r.hobbies ?? [])]
}

function prefillDefault() {
  form.fullName  = 'Bon Savorn'
  form.title     = 'Backend Developer'
  form.phone     = '0969330563'
  form.email     = 'savornbon12345@gmail.com'
  form.location  = 'Phnom Penh Cambodia 12100'
  form.summary   = 'Dynamic individual with hands-on experience in backend development and a talent for navigating challenges. Strong problem-solving skills and a proactive approach to new tasks. Recognized for adaptability, creativity, and a results-oriented mindset. Committed to making meaningful contributions and advancing organizational goals. Experienced in integration payment gateway with ABA and Wing Bank. Fluent in the PHP programming language (Laravel framework).'
  form.skills    = ['Git', 'MySQL', 'SQL', 'PHP', 'Typescript', 'Laravel Framework', 'JQuery', 'HTML & CSS', 'JavaScript', 'Node.js', 'Vue.js']
  form.experiences = [
    {
      title: 'Backend Developer', company: 'Infinity Information & Apps Dev Co., Ltd', location: '',
      startDate: '08/2022', endDate: '', isCurrent: true,
      responsibilities: [
        'Streamlined API integration for seamless communication between frontend and backend systems.',
        'Developed RESTful APIs that facilitated seamless data exchange between clients and servers in a distributed environment.',
        'Integrated third-party APIs from external applications into web platforms.',
        'Designed and developed analytical data structures.',
        'Built APIs and data clients to consume APIs.',
        'Created enhancements to resolve client problems and meet operational standards.',
        'Tested and deployed scalable and highly available software products.',
        'Optimized code performance by implementing efficient algorithms and data structures.',
      ],
    },
    {
      title: 'Senior Software Developer', company: 'CloudNET', location: 'Phnom Penh, Cambodia',
      startDate: '01/2020', endDate: '01/2022', isCurrent: false,
      responsibilities: [
        'Work in cross-functional teams to find solution to any problem as required.',
        'Mentor Junior team member.',
        'Task Management.',
        'Project Setup, Environment setup and Hosting System.',
        'Develop and maintain systems (leasing system, Sale Property Management system, and ERP System).',
        'Resolves technical incident raised from customer.',
      ],
    },
    {
      title: 'Software Developer', company: 'CloudNET', location: 'Phnom Penh, Cambodia',
      startDate: '01/2018', endDate: '01/2020', isCurrent: false,
      responsibilities: [
        'Create web application and API.',
        'Design system interface for each project.',
        'Train internal user to use new applications.',
        'Monitor and upgrade system.',
        'Support team to solve any problem from the system part.',
        'Built databases and table structures for web applications.',
        'Tested and deployed scalable and highly available software products.',
      ],
    },
  ]
  form.education = [
    {
      degree: 'Information and Communication Engineering', institution: 'Institute of Technology of Cambodia',
      year: '01/2018',
      highlights: [
        'Developed website Event Kh for event meeting by using PHP framework (Laravel).',
        'Developed website booking ticket for bus using PHP.',
        'Developed app road reporter for report the road using Java.',
      ],
    },
    { degree: 'Diploma I, II', institution: 'Mesang High School, Prey veng province', year: '01/2013', highlights: [] },
  ]
  form.languages  = [{ name: 'Khmer', level: 'Native' }, { name: 'English', level: 'Intermediate' }]
  form.awards     = [{ title: 'Best Staff', organization: 'CloudNET', year: '2019' }]
  form.references = [{ name: 'San Sothea', jobTitle: 'Project Manager', organization: 'CloudNET', email: 'sansothea@gmail.com', phone: '069600400' }]
  form.hobbies    = ['Reading book', 'Research new technology']
}

// ─── Edit helpers ─────────────────────────────────────────────────────────────

function startEdit() { editing.value = true }

function cancelEdit() {
  if (resume.value) syncFormFromResume()
  else prefillDefault()
  editing.value = false
}

async function handleSave() {
  await saveResume({ ...form })
  editing.value = false
}

const expCollapsed = ref<boolean[]>([])

function addExperience(position: 'first' | 'last' = 'last') {
  const entry = { title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: [] }
  if (position === 'first') {
    form.experiences.unshift(entry)
    expCollapsed.value.unshift(false)
  } else {
    form.experiences.push(entry)
    expCollapsed.value.push(false)
  }
}
function addExperienceAt(i: number) {
  const entry = { title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: [] }
  form.experiences.splice(i, 0, entry)
  expCollapsed.value.splice(i, 0, false)
}
function removeExperience(i: number) {
  form.experiences.splice(i, 1)
  expCollapsed.value.splice(i, 1)
}
function duplicateExperience(i: number) {
  const copy = JSON.parse(JSON.stringify(form.experiences[i]))
  form.experiences.splice(i + 1, 0, copy)
  expCollapsed.value.splice(i + 1, 0, false)
}
function moveExpUp(i: number) {
  if (i === 0) return
  const expA = form.experiences[i]!; const expB = form.experiences[i - 1]!
  form.experiences.splice(i - 1, 2, expA, expB)
  const colA = !!expCollapsed.value[i]; const colB = !!expCollapsed.value[i - 1]
  expCollapsed.value[i - 1] = colA; expCollapsed.value[i] = colB
}
function moveExpDown(i: number) {
  if (i >= form.experiences.length - 1) return
  const expA = form.experiences[i]!; const expB = form.experiences[i + 1]!
  form.experiences.splice(i, 2, expB, expA)
  const colA = !!expCollapsed.value[i]; const colB = !!expCollapsed.value[i + 1]
  expCollapsed.value[i] = colB; expCollapsed.value[i + 1] = colA
}
function toggleExpCollapse(i: number) {
  expCollapsed.value[i] = !expCollapsed.value[i]
}

function addEducation() { form.education.push({ degree: '', institution: '', year: '', highlights: [] }) }
function removeEducation(i: number) { form.education.splice(i, 1) }

function addLanguage() { form.languages.push({ name: '', level: '' }) }
function removeLanguage(i: number) { form.languages.splice(i, 1) }

function addAward() { form.awards.push({ title: '', organization: '', year: '' }) }
function removeAward(i: number) { form.awards.splice(i, 1) }

function addReference() { form.references.push({ name: '', jobTitle: '', organization: '', email: '', phone: '' }) }
function removeReference(i: number) { form.references.splice(i, 1) }

// ─── Clone / Export / Import ──────────────────────────────────────────────────

const importFileInput = ref<HTMLInputElement | null>(null)
const showSnapshotMenu = ref(false)
const CV_SNAPSHOT_KEY = 'cv_snapshots'

interface CvSnapshot { name: string; date: string; data: ReturnType<typeof emptyForm> }

function getSnapshots(): CvSnapshot[] {
  try { return JSON.parse(localStorage.getItem(CV_SNAPSHOT_KEY) ?? '[]') } catch { return [] }
}
function saveSnapshots(list: CvSnapshot[]) {
  localStorage.setItem(CV_SNAPSHOT_KEY, JSON.stringify(list))
}
const snapshots = ref<CvSnapshot[]>(getSnapshots())

function formSnapshot(): ReturnType<typeof emptyForm> {
  return JSON.parse(JSON.stringify(form))
}
function applySnapshot(data: ReturnType<typeof emptyForm>) {
  Object.assign(form, data)
}

function exportCV() {
  const slug = form.fullName.trim().replace(/\s+/g, '-').toLowerCase() || 'resume'
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([JSON.stringify(formSnapshot(), null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `cv-${slug}-${date}.json`; a.click()
  URL.revokeObjectURL(url)
}

function importCV(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string)
      if (!confirm('This will replace all current CV data with the imported file. Continue?')) return
      applySnapshot({ ...emptyForm(), ...data })
    } catch {
      alert('Invalid JSON file — could not import.')
    }
    ;(e.target as HTMLInputElement).value = ''
  }
  reader.readAsText(file)
}

function saveSnapshot() {
  const name = prompt('Snapshot name:', `${form.fullName || 'CV'} – ${new Date().toLocaleString()}`)
  if (!name) return
  const list = getSnapshots()
  list.unshift({ name, date: new Date().toISOString(), data: formSnapshot() })
  saveSnapshots(list.slice(0, 10)) // keep max 10
  snapshots.value = getSnapshots()
}

function restoreSnapshot(snap: CvSnapshot) {
  if (!confirm(`Restore snapshot "${snap.name}"? Current CV data will be replaced.`)) return
  applySnapshot(snap.data)
  showSnapshotMenu.value = false
}

function deleteSnapshot(i: number) {
  const list = getSnapshots()
  list.splice(i, 1)
  saveSnapshots(list)
  snapshots.value = getSnapshots()
}

// ─── Print / PDF ──────────────────────────────────────────────────────────────

function printCV() {
  // Open window FIRST (must be synchronous to avoid popup blocker)
  const win = window.open('', '_blank', 'width=900,height=1200')
  if (!win) {
    alert('Popup blocked — please allow popups for this page and try again.')
    return
  }

  const doRender = () => {
    const el = document.getElementById('cv-document')
    if (!el) { win.close(); return }

    const styleContent = Array.from(document.querySelectorAll('style'))
      .map(s => s.innerHTML)
      .join('\n')

    const linkTags = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map(l => `<link rel="stylesheet" href="${l.href}">`)
      .join('\n')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${linkTags}
  <style>
    ${styleContent}
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body { margin: 0; padding: 0; background: white; }
    #cv-document {
      box-shadow: none !important;
      border-radius: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      overflow: visible !important;
    }
    .cv-split-paper, .cv-wb-paper, .cv-dp-paper,
    .cv-cls-paper, .cv-hb-paper { overflow: visible !important; }
    /* Sections must flow across pages — never skip */
    .cv-section {
      break-inside: auto !important;
      page-break-inside: auto !important;
      overflow: visible !important;
    }
    [class*="theme-tc-"] .cv-section {
      break-inside: auto !important;
      page-break-inside: auto !important;
      overflow: visible !important;
    }
    [class*="theme-tc-"] .cv-section-body,
    [class*="theme-tc-"] .cv-section-head { overflow: visible !important; }
    /* Avoid breaking within a single entry */
    .cv-item, .cv-exp-entry, .cv-hb-exp-entry,
    .cv-dp-exp-entry, .cv-wb-exp-entry,
    .cv-hb-edu, .cv-dp-edu { break-inside: avoid; page-break-inside: avoid; }
    /* Keep section title glued to first entry below it */
    .cv-section-title, .cv-hb-section-title,
    .cv-dp-section-title { break-after: avoid; page-break-after: avoid; }
    .cv-hb-left, .cv-hb-right,
    .cv-dp-left, .cv-dp-right { overflow: visible !important; }
    .cv-add-btn { display: none !important; }
    @page          { size: A4 portrait; margin: 1.2cm 0; }
    @page :first   { size: A4 portrait; margin: 0; }
  </style>
</head>
<body style="margin:0;padding:0;background:white">
  ${el.outerHTML}
  <script>
    setTimeout(function () {
      window.print()
      window.addEventListener('afterprint', function () { window.close() })
    }, 300)
  <\/script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    win.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  if (editing.value) {
    editing.value = false
    setTimeout(doRender, 50)
  } else {
    doRender()
  }
}
</script>

<style>
/* ═══════════════════════════════════════════════════════════════════
   BASE — shared CV structure
═══════════════════════════════════════════════════════════════════ */
.cv-paper {
  background: #fff;
  color: #111827;
  padding: 2.5rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.cv-section      { margin-bottom: 1.5rem; }
.cv-body-text    { font-size: 0.875rem; color: #374151; }
.cv-date         { font-size: 0.75rem; color: #6b7280; white-space: nowrap; }
.cv-exp-company  { font-size: 0.9rem; font-weight: 600; color: #1f2937; }
.cv-exp-location { font-weight: 400; color: #6b7280; }

.cv-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #e5e7eb;
}
.cv-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }

/* Form inputs */
.cv-label {
  display: block; font-size: 0.7rem; font-weight: 600;
  color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;
}
.cv-input {
  width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem;
  padding: 0.375rem 0.625rem; font-size: 0.875rem; color: #111827;
  background: #fff; outline: none; transition: border-color 0.15s;
}
.cv-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
.cv-input:disabled { background: #f3f4f6; color: #9ca3af; }
textarea.cv-input { resize: vertical; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — CLASSIC (Blue)
═══════════════════════════════════════════════════════════════════ */
.theme-classic {
  --cv-accent:       #2563eb;
  --cv-accent-light: #eff6ff;
  --cv-accent-mid:   #bfdbfe;
  --cv-accent-text:  #1d4ed8;
  --cv-header-border: 2px solid #2563eb;
}

.theme-classic .cv-header      { border-bottom: var(--cv-header-border); padding-bottom: 1rem; margin-bottom: 1.5rem; }
.theme-classic .cv-header-content { display: flex; align-items: flex-start; gap: 1rem; }
.theme-classic .cv-avatar      { width: 4rem; height: 4rem; border-radius: 9999px; background: #dbeafe; border: 2px solid #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #1d4ed8; flex-shrink: 0; }
.theme-classic .cv-name        { font-size: 1.875rem; font-weight: 700; color: #111827; }
.theme-classic .cv-job-title   { color: #2563eb; font-weight: 500; margin-top: 0.125rem; }
.theme-classic .cv-contact-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #4b5563; }
.theme-classic .cv-contact-row a { color: #2563eb; text-decoration: none; }
.theme-classic .cv-section-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #2563eb; border-bottom: 1px solid #bfdbfe; padding-bottom: 0.2rem; margin-bottom: 0.75rem; }
.theme-classic .cv-exp-title   { font-weight: 700; color: #1d4ed8; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; }
.theme-classic .cv-bullet      { color: #3b82f6; }
.theme-classic .cv-skill-tag   { padding: 0.125rem 0.625rem; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 0.25rem; font-size: 0.8rem; }
.theme-classic .cv-add-btn     { font-size: 0.75rem; font-weight: 600; color: #2563eb; border: 1px solid #93c5fd; border-radius: 0.375rem; padding: 0.2rem 0.75rem; background: #eff6ff; cursor: pointer; }
.theme-classic .cv-add-btn:hover { background: #dbeafe; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — PROFESSIONAL (Navy)
═══════════════════════════════════════════════════════════════════ */
.theme-professional {
  --cv-accent:      #1e3a5f;
  --cv-accent-gold: #c9a84c;
}

.theme-professional .cv-header      { background: #1e3a5f; margin: -2.5rem -2.5rem 1.5rem; padding: 2rem 2.5rem; }
.theme-professional .cv-header-content { display: flex; align-items: flex-start; gap: 1.25rem; }
.theme-professional .cv-avatar      { width: 4.5rem; height: 4.5rem; border-radius: 0.5rem; background: #2d5282; border: 2px solid #c9a84c; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #f6e05e; flex-shrink: 0; }
.theme-professional .cv-name        { font-size: 2rem; font-weight: 700; color: #ffffff; letter-spacing: 0.02em; }
.theme-professional .cv-job-title   { color: #c9a84c; font-weight: 500; margin-top: 0.25rem; font-size: 0.95rem; letter-spacing: 0.05em; text-transform: uppercase; }
.theme-professional .cv-contact-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.8rem; color: #a0aec0; }
.theme-professional .cv-contact-row a { color: #c9a84c; }
.theme-professional .cv-section-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 0.25rem; margin-bottom: 0.75rem; }
.theme-professional .cv-exp-title   { font-weight: 700; color: #1e3a5f; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.06em; }
.theme-professional .cv-bullet      { color: #c9a84c; }
.theme-professional .cv-skill-tag   { padding: 0.125rem 0.625rem; background: #ebf4ff; border: 1px solid #bee3f8; color: #1e3a5f; border-radius: 0.25rem; font-size: 0.8rem; }
.theme-professional .cv-add-btn     { font-size: 0.75rem; font-weight: 600; color: #1e3a5f; border: 1px solid #a0aec0; border-radius: 0.375rem; padding: 0.2rem 0.75rem; background: #f7fafc; cursor: pointer; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — MODERN (Teal)
═══════════════════════════════════════════════════════════════════ */
.theme-modern .cv-header       { border-left: 4px solid #0d9488; padding-left: 1rem; margin-bottom: 1.5rem; }
.theme-modern .cv-header-content { display: flex; align-items: flex-start; gap: 1rem; }
.theme-modern .cv-avatar       { width: 3.5rem; height: 3.5rem; border-radius: 9999px; background: #ccfbf1; border: 2px solid #0d9488; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #0f766e; flex-shrink: 0; }
.theme-modern .cv-name         { font-size: 1.75rem; font-weight: 700; color: #111827; }
.theme-modern .cv-job-title    { color: #0d9488; font-weight: 500; margin-top: 0.125rem; }
.theme-modern .cv-contact-row  { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #4b5563; }
.theme-modern .cv-contact-row a { color: #0d9488; }
.theme-modern .cv-section-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0f766e; border-bottom: 2px solid #99f6e4; padding-bottom: 0.2rem; margin-bottom: 0.75rem; }
.theme-modern .cv-exp-title    { font-weight: 700; color: #0d9488; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.04em; }
.theme-modern .cv-bullet       { color: #0d9488; }
.theme-modern .cv-skill-tag    { padding: 0.125rem 0.625rem; background: #f0fdfa; border: 1px solid #99f6e4; color: #0f766e; border-radius: 9999px; font-size: 0.8rem; }
.theme-modern .cv-add-btn      { font-size: 0.75rem; font-weight: 600; color: #0d9488; border: 1px solid #5eead4; border-radius: 9999px; padding: 0.2rem 0.75rem; background: #f0fdfa; cursor: pointer; }
.theme-modern .cv-add-btn:hover { background: #ccfbf1; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — CREATIVE (Purple)
═══════════════════════════════════════════════════════════════════ */
.theme-creative .cv-header     { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); margin: -2.5rem -2.5rem 1.5rem; padding: 2rem 2.5rem; border-radius: 0; }
.theme-creative .cv-header-content { display: flex; align-items: flex-start; gap: 1rem; }
.theme-creative .cv-avatar     { width: 5rem; height: 5rem; border-radius: 9999px; background: rgba(255,255,255,0.15); border: 3px solid rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.theme-creative .cv-name       { font-size: 2.25rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
.theme-creative .cv-job-title  { color: #ddd6fe; font-weight: 500; margin-top: 0.25rem; font-size: 0.95rem; }
.theme-creative .cv-contact-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.85rem; color: #c4b5fd; }
.theme-creative .cv-contact-row a { color: #e9d5ff; }
.theme-creative .cv-section-title { font-size: 0.85rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 0.2rem; margin-bottom: 0.75rem; }
.theme-creative .cv-exp-title  { font-weight: 800; color: #6d28d9; font-size: 0.9rem; }
.theme-creative .cv-bullet     { color: #7c3aed; }
.theme-creative .cv-skill-tag  { padding: 0.2rem 0.75rem; background: #f5f3ff; border: 1px solid #ddd6fe; color: #5b21b6; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
.theme-creative .cv-add-btn    { font-size: 0.75rem; font-weight: 700; color: #7c3aed; border: 1.5px solid #a78bfa; border-radius: 9999px; padding: 0.2rem 0.75rem; background: #f5f3ff; cursor: pointer; }
.theme-creative .cv-add-btn:hover { background: #ede9fe; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — MINIMAL (Monochrome)
═══════════════════════════════════════════════════════════════════ */
.theme-minimal .cv-header      { border-top: 4px solid #111827; padding-top: 1rem; margin-bottom: 1.5rem; }
.theme-minimal .cv-header-content { display: flex; align-items: flex-start; gap: 1rem; }
.theme-minimal .cv-avatar      { width: 3.5rem; height: 3.5rem; border-radius: 0; background: #111827; border: none; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.theme-minimal .cv-name        { font-size: 2rem; font-weight: 900; color: #111827; letter-spacing: -0.03em; }
.theme-minimal .cv-job-title   { color: #6b7280; font-weight: 400; margin-top: 0.25rem; font-style: italic; }
.theme-minimal .cv-contact-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; font-size: 0.8rem; color: #6b7280; }
.theme-minimal .cv-contact-row a { color: #374151; }
.theme-minimal .cv-section-title { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #111827; border-bottom: 1px solid #111827; padding-bottom: 0.2rem; margin-bottom: 0.75rem; }
.theme-minimal .cv-exp-title   { font-weight: 700; color: #111827; font-size: 0.875rem; }
.theme-minimal .cv-bullet      { color: #9ca3af; }
.theme-minimal .cv-skill-tag   { padding: 0.125rem 0.5rem; background: #f9fafb; border: 1px solid #d1d5db; color: #374151; border-radius: 0; font-size: 0.8rem; }
.theme-minimal .cv-add-btn     { font-size: 0.75rem; font-weight: 600; color: #374151; border: 1px solid #9ca3af; border-radius: 0; padding: 0.2rem 0.75rem; background: #f9fafb; cursor: pointer; }

/* ═══════════════════════════════════════════════════════════════════
   THEME — SIDEBAR (Dark left panel)
═══════════════════════════════════════════════════════════════════ */
.theme-sidebar .cv-header      { margin: -2.5rem -2.5rem 1.5rem; }
.theme-sidebar .cv-sidebar-header { display: flex; }
.theme-sidebar .cv-sidebar-left {
  width: 6rem; flex-shrink: 0; background: #111827;
  padding: 1.5rem 1rem; display: flex; flex-direction: column; align-items: center;
}
.theme-sidebar .cv-sidebar-right { flex: 1; background: #1f2937; padding: 1.5rem 1.5rem; }
.theme-sidebar .cv-avatar      { width: 3.5rem; height: 3.5rem; border-radius: 9999px; background: #374151; border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: #10b981; }
.theme-sidebar .cv-name        { font-size: 1.5rem; font-weight: 700; color: #f9fafb; }
.theme-sidebar .cv-job-title   { color: #10b981; font-weight: 500; margin-top: 0.125rem; font-size: 0.875rem; }
.theme-sidebar .cv-contact-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; font-size: 0.8rem; color: #9ca3af; }
.theme-sidebar .cv-contact-row a { color: #10b981; }
.theme-sidebar .cv-section-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #10b981; border-bottom: 1px solid #374151; padding-bottom: 0.2rem; margin-bottom: 0.75rem; }
.theme-sidebar .cv-exp-title   { font-weight: 700; color: #10b981; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.04em; }
.theme-sidebar .cv-bullet      { color: #10b981; }
.theme-sidebar .cv-skill-tag   { padding: 0.125rem 0.625rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; border-radius: 9999px; font-size: 0.8rem; }
.theme-sidebar .cv-add-btn     { font-size: 0.75rem; font-weight: 600; color: #10b981; border: 1px solid #6ee7b7; border-radius: 9999px; padding: 0.2rem 0.75rem; background: #f0fdf4; cursor: pointer; }

/* ═══════════════════════════════════════════════════════════════════
   THEMES — PRO SERIES (Two-column layout, image-matching)
   All share the same layout; only CSS variables differ per theme.
═══════════════════════════════════════════════════════════════════ */

/* ── Per-theme color tokens ─────────────────────────────────────── */
.theme-tc-blue   { --tc-a: #2563eb; --tc-al: #dbeafe; --tc-am: #bfdbfe; --tc-at: #1d4ed8; --tc-lbl: #1e40af; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-navy   { --tc-a: #1e3a5f; --tc-al: #dbeafe; --tc-am: #93c5fd; --tc-at: #1e3a5f; --tc-lbl: #1e3a5f; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-teal   { --tc-a: #0d9488; --tc-al: #ccfbf1; --tc-am: #99f6e4; --tc-at: #0f766e; --tc-lbl: #0f766e; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-red    { --tc-a: #dc2626; --tc-al: #fee2e2; --tc-am: #fecaca; --tc-at: #991b1b; --tc-lbl: #991b1b; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-purple { --tc-a: #7c3aed; --tc-al: #ede9fe; --tc-am: #ddd6fe; --tc-at: #5b21b6; --tc-lbl: #5b21b6; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-dark   { --tc-a: #10b981; --tc-al: #d1fae5; --tc-am: #6ee7b7; --tc-at: #065f46; --tc-lbl: #10b981; --tc-hbg: #1e293b; --tc-hborder: none; --tc-nm: #f1f5f9; --tc-ct: #94a3b8; }
.theme-tc-slate  { --tc-a: #475569; --tc-al: #f1f5f9; --tc-am: #cbd5e1; --tc-at: #334155; --tc-lbl: #334155; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-copper { --tc-a: #b45309; --tc-al: #fef3c7; --tc-am: #fde68a; --tc-at: #92400e; --tc-lbl: #92400e; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-indigo { --tc-a: #4338ca; --tc-al: #eef2ff; --tc-am: #c7d2fe; --tc-at: #3730a3; --tc-lbl: #3730a3; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-forest   { --tc-a: #15803d; --tc-al: #f0fdf4; --tc-am: #bbf7d0; --tc-at: #14532d; --tc-lbl: #14532d; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
/* ── 2026 Colour Palette ───────────────────────────────────────── */
.theme-tc-mocha    { --tc-a: #8B5E52; --tc-al: #f5ece8; --tc-am: #e8d0c8; --tc-at: #6b4438; --tc-lbl: #6b4438; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-lavender { --tc-a: #7C6DB5; --tc-al: #f0eef9; --tc-am: #d8d4f0; --tc-at: #5a4d9c; --tc-lbl: #5a4d9c; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-terra    { --tc-a: #C4704F; --tc-al: #fdf0eb; --tc-am: #f8d5c0; --tc-at: #9a4e30; --tc-lbl: #9a4e30; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-moss     { --tc-a: #4A7A50; --tc-al: #eaf4ec; --tc-am: #b8dcbc; --tc-at: #2d5a33; --tc-lbl: #2d5a33; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-cobalt   { --tc-a: #1E4D9E; --tc-al: #e8edf8; --tc-am: #c0ccee; --tc-at: #163880; --tc-lbl: #163880; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-sand     { --tc-a: #B8956A; --tc-al: #fdf5ec; --tc-am: #f0dcc0; --tc-at: #8b6840; --tc-lbl: #8b6840; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }
.theme-tc-rose     { --tc-a: #B87890; --tc-al: #fdf0f4; --tc-am: #f0d0dc; --tc-at: #8b4a6a; --tc-lbl: #8b4a6a; --tc-hbg: transparent; --tc-hborder: 2px solid #e5e7eb; --tc-nm: #111827; --tc-ct: #4b5563; }

/* ── Shared header ──────────────────────────────────────────────── */
[class*="theme-tc-"] .cv-header {
  background: var(--tc-hbg);
  border-bottom: var(--tc-hborder);
  padding: 1.25rem 0;
  margin-bottom: 0;
}
/* Dark theme: extend header to bleed edges */
.theme-tc-dark .cv-header { margin: -2.5rem -2.5rem 0; padding: 1.5rem 2.5rem; border-bottom: 2px solid #10b981; }

[class*="theme-tc-"] .cv-header-content { display: flex; align-items: flex-start; gap: 1rem; }
[class*="theme-tc-"] .cv-avatar {
  width: 4rem; height: 4rem; border-radius: 9999px;
  background: var(--tc-al); border: 2px solid var(--tc-a);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; color: var(--tc-at); flex-shrink: 0;
}
[class*="theme-tc-"] .cv-name       { font-size: 1.75rem; font-weight: 700; color: var(--tc-nm); line-height: 1.2; }
[class*="theme-tc-"] .cv-job-title  { color: var(--tc-a); font-weight: 500; margin-top: 0.15rem; font-size: 0.875rem; }
[class*="theme-tc-"] .cv-contact-row {
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  margin-top: 0.4rem; font-size: 0.8rem; color: var(--tc-ct);
}
[class*="theme-tc-"] .cv-contact-row a { color: var(--tc-a); text-decoration: none; }

/* ── Shared two-column body layout ──────────────────────────────── */
[class*="theme-tc-"] .cv-section {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0;
}
[class*="theme-tc-"] .cv-section:last-child { border-bottom: none; }

/* Left column — direct h2 (Skills, Summary, Hobbies) */
[class*="theme-tc-"] .cv-section > h2.cv-section-title {
  width: 9rem; min-width: 9rem; flex-shrink: 0;
  border-bottom: none; margin-bottom: 0; padding-top: 0.05rem;
  color: var(--tc-lbl);
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
}

/* Left column — head div with Add button (Exp, Edu, Lang, etc.) */
[class*="theme-tc-"] .cv-section-head {
  width: 9rem; min-width: 9rem; flex-shrink: 0;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  margin-bottom: 0 !important;
  gap: 0.3rem;
}
[class*="theme-tc-"] .cv-section-head .cv-section-title {
  border-bottom: none; margin-bottom: 0;
  color: var(--tc-lbl);
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
}

/* Right column */
[class*="theme-tc-"] .cv-section-body { flex: 1; min-width: 0; }

/* Skills grid — 2 columns, bullet prefix */
[class*="theme-tc-"] .cv-skills-list {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1.5rem;
}
[class*="theme-tc-"] .cv-skill-tag {
  background: none; border: none; border-radius: 0;
  padding: 0.1rem 0; color: #374151; font-size: 0.875rem;
}
[class*="theme-tc-"] .cv-skill-tag::before { content: '• '; color: var(--tc-a); }

/* Section title override inside body */
[class*="theme-tc-"] .cv-section-title {
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--tc-lbl); border-bottom: none;
}

[class*="theme-tc-"] .cv-exp-title    { font-weight: 700; color: #111827; font-size: 0.875rem; text-transform: none; letter-spacing: 0; }
[class*="theme-tc-"] .cv-exp-company  { font-size: 0.875rem; font-weight: 600; color: #374151; }
[class*="theme-tc-"] .cv-bullet       { color: var(--tc-a); }
[class*="theme-tc-"] .cv-item         { border-bottom: 1px solid #f1f5f9; margin-bottom: 0.75rem; padding-bottom: 0.75rem; }
[class*="theme-tc-"] .cv-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
[class*="theme-tc-"] .cv-add-btn {
  font-size: 0.7rem; font-weight: 600;
  color: var(--tc-a); border: 1px solid var(--tc-am); border-radius: 0.25rem;
  padding: 0.15rem 0.6rem; background: var(--tc-al); cursor: pointer; margin-top: 0.25rem;
}

/* ═══════════════════════════════════════════════════════════════════
   THEMES — DUAL-PANEL LAYOUT  (dp-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens ─────────────────────────────────────────────── */
.theme-dp-blue   { --dp-hbg: #d4e2ee; --dp-acc: #1e40af; --dp-nm: #111827; --dp-link: #1d4ed8; }
.theme-dp-green  { --dp-hbg: #cce5cc; --dp-acc: #065f46; --dp-nm: #111827; --dp-link: #065f46; }
.theme-dp-warm   { --dp-hbg: #e8dcc8; --dp-acc: #78350f; --dp-nm: #111827; --dp-link: #92400e; }
.theme-dp-purple { --dp-hbg: #ddd0ee; --dp-acc: #5b21b6; --dp-nm: #111827; --dp-link: #6d28d9; }
.theme-dp-slate   { --dp-hbg: #d1d8e0; --dp-acc: #334155; --dp-nm: #111827; --dp-link: #1e293b; }
.theme-dp-crimson { --dp-hbg: #e8c8d0; --dp-acc: #9d174d; --dp-nm: #111827; --dp-link: #be123c; }
.theme-dp-teal    { --dp-hbg: #c8e4e0; --dp-acc: #0f766e; --dp-nm: #111827; --dp-link: #0d9488; }
.theme-dp-charcoal { --dp-hbg: #c8ccd0; --dp-acc: #1e293b; --dp-nm: #111827; --dp-link: #334155; }
/* ── 2026 Colour Palette ───────────────────────────────────────── */
.theme-dp-mocha    { --dp-hbg: #e0ccc4; --dp-acc: #8B5E52; --dp-nm: #111827; --dp-link: #7a4a3e; }
.theme-dp-lavender { --dp-hbg: #dcd8ee; --dp-acc: #6b5aaa; --dp-nm: #111827; --dp-link: #5a4a9e; }
.theme-dp-terra    { --dp-hbg: #ecd0c0; --dp-acc: #b85a38; --dp-nm: #111827; --dp-link: #9a4828; }
.theme-dp-moss     { --dp-hbg: #ccdccc; --dp-acc: #4A7A50; --dp-nm: #111827; --dp-link: #2d5a33; }
.theme-dp-sand     { --dp-hbg: #e8dcc8; --dp-acc: #B8956A; --dp-nm: #111827; --dp-link: #8b6840; }

/* ── Paper ────────────────────────────────────────────────────── */
.cv-dp-paper {
  background: #fff;
  color: #111827;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 13.5px;
  line-height: 1.55;
}

/* ── Header bar ───────────────────────────────────────────────── */
.cv-dp-header {
  background: var(--dp-hbg);
  padding: 1.4rem 1.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-bottom: 3px solid var(--dp-acc);
}
.cv-dp-header-left { flex: 1; }
.cv-dp-name {
  font-size: 2.1rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dp-nm);
  line-height: 1.05;
}
.cv-dp-job-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dp-acc);
  margin-top: 0.35rem;
}

.cv-dp-header-right {
  font-size: 0.8rem;
  color: #1f2937;
  line-height: 2;
  text-align: right;
  flex-shrink: 0;
  border-left: 1.5px solid var(--dp-acc);
  padding-left: 1.25rem;
}
.cv-dp-clabel { font-weight: 700; color: var(--dp-acc); margin-right: 0.25rem; }
.cv-dp-link   { color: var(--dp-link); text-decoration: underline; font-weight: 600; }

/* ── Two-column body ──────────────────────────────────────────── */
.cv-dp-body  { display: flex; padding: 1.4rem 1.75rem; gap: 0; }
.cv-dp-left  { flex: 1; min-width: 0; padding-right: 1.5rem; }
.cv-dp-right { width: 37%; flex-shrink: 0; padding-left: 1.5rem; border-left: 1px solid #e5e7eb; }

/* ── Section blocks ───────────────────────────────────────────── */
.cv-dp-section { margin-bottom: 1.3rem; }
.cv-dp-section:last-child { margin-bottom: 0; }

.cv-dp-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dp-acc);
  margin-bottom: 0.65rem;
  padding-bottom: 0.3rem;
  border-bottom: 1.5px solid var(--dp-acc);
}

/* ── Body text ────────────────────────────────────────────────── */
.cv-dp-body-text { font-size: 0.875rem; color: #374151; line-height: 1.65; }

/* ── Work experience ──────────────────────────────────────────── */
.cv-dp-exp { margin-bottom: 1rem; }
.cv-dp-exp:last-child { margin-bottom: 0; }

.cv-dp-exp-header  { font-size: 0.875rem; margin-bottom: 0.05rem; }
.cv-dp-exp-company { font-weight: 800; color: var(--dp-acc); }
.cv-dp-exp-sep     { color: #9ca3af; font-weight: 400; }
.cv-dp-exp-title   { font-weight: 600; color: #374151; font-style: italic; }
.cv-dp-exp-location { font-size: 0.8rem; color: #6b7280; display: inline; }
.cv-dp-exp-dot     { margin: 0 0.25rem; }
.cv-dp-exp-date    { font-size: 0.78rem; color: var(--dp-acc); font-weight: 600; margin-bottom: 0.25rem; letter-spacing: 0.02em; }

.cv-dp-bullets { list-style: none; padding: 0; margin: 0.25rem 0; }
.cv-dp-bullets li {
  font-size: 0.845rem;
  color: #374151;
  padding: 0.08rem 0;
  display: flex;
  gap: 0.4rem;
  align-items: flex-start;
}
.cv-dp-bullets li::before { content: '▸'; color: var(--dp-acc); flex-shrink: 0; font-size: 0.7rem; line-height: 1.6; }

/* ── Right column ─────────────────────────────────────────────── */
.cv-dp-skills-wrap { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem; }
.cv-dp-skill {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--dp-acc);
  background: color-mix(in srgb, var(--dp-hbg) 60%, white 40%);
  border: 1px solid var(--dp-acc);
  border-radius: 3px;
  padding: 0.15rem 0.5rem;
  display: inline-block;
}
.cv-dp-skill::before { display: none; }

.cv-dp-edu { margin-bottom: 0.9rem; }
.cv-dp-edu:last-child { margin-bottom: 0; }
.cv-dp-edu-institution { font-weight: 800; font-size: 0.875rem; color: #111827; }
.cv-dp-edu-year        { font-size: 0.76rem; color: var(--dp-acc); font-weight: 600; margin-bottom: 0.1rem; }
.cv-dp-edu-degree      { font-style: italic; font-weight: 600; font-size: 0.845rem; color: #374151; margin-bottom: 0.15rem; }

/* ═══════════════════════════════════════════════════════════════════
   THEMES — LABEL PANEL LAYOUT  (lp-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens ─────────────────────────────────────────────── */
.theme-lp-teal   { --lp-acc: #1d5f4a; --lp-sbg: #2a6b56; --lp-cbg: #1a2e28; --lp-link: #a8d8c8; }
.theme-lp-navy   { --lp-acc: #1e3a5f; --lp-sbg: #2d5282; --lp-cbg: #0f1f3a; --lp-link: #93c5fd; }
.theme-lp-forest { --lp-acc: #14532d; --lp-sbg: #166534; --lp-cbg: #0a2d18; --lp-link: #6ee7b7; }
.theme-lp-slate  { --lp-acc: #334155; --lp-sbg: #475569; --lp-cbg: #1e293b; --lp-link: #94a3b8; }
.theme-lp-plum   { --lp-acc: #4c1d95; --lp-sbg: #6d28d9; --lp-cbg: #2e0a6e; --lp-link: #c4b5fd; }
.theme-lp-mocha  { --lp-acc: #6b4438; --lp-sbg: #8B5E52; --lp-cbg: #3a2020; --lp-link: #e8c8b8; }

/* ── Paper ────────────────────────────────────────────────────── */
.cv-lp-paper {
  background: white;
  color: #111827;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 13.5px;
  line-height: 1.55;
}

/* ── Name header ──────────────────────────────────────────────── */
.cv-lp-name-area { padding: 1.75rem 2rem 0.75rem; background: white; }
.cv-lp-name {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--lp-acc);
  letter-spacing: 0.06em;
  line-height: 1.05;
}
.cv-lp-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  margin-top: 0.2rem;
}
.cv-lp-name-rule { height: 2px; background: var(--lp-acc); margin-top: 0.65rem; }

/* ── Contact bar ──────────────────────────────────────────────── */
.cv-lp-contact-bar {
  background: var(--lp-cbg);
  color: #e5e7eb;
  padding: 0.55rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.15rem 1.5rem;
  font-size: 0.8rem;
}
.cv-lp-link { color: var(--lp-link); font-weight: 700; }

/* ── Label-panel rows ─────────────────────────────────────────── */
.cv-lp-body { display: flex; flex-direction: column; }
.cv-lp-row  { display: flex; align-items: stretch; border-bottom: 1px solid #e5e7eb; }
.cv-lp-row:last-child { border-bottom: none; }

.cv-lp-label {
  width: 27%;
  flex-shrink: 0;
  background: var(--lp-sbg);
  color: white;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 1rem 0.85rem 1rem 1.25rem;
  line-height: 1.45;
}
.cv-lp-content { flex: 1; padding: 0.9rem 1.25rem; background: white; }

/* ── Skills grid ──────────────────────────────────────────────── */
.cv-lp-skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.1rem 0.5rem; }
.cv-lp-skill { font-size: 0.855rem; color: #374151; display: flex; align-items: baseline; gap: 0.3rem; }
.cv-lp-bullet { color: var(--lp-acc); font-size: 1.15rem; line-height: 1; flex-shrink: 0; }

/* ── Body text ────────────────────────────────────────────────── */
.cv-lp-body-text { font-size: 0.875rem; color: #374151; line-height: 1.6; }

/* ── Work experience ──────────────────────────────────────────── */
.cv-lp-exp { margin-bottom: 1rem; }
.cv-lp-exp:last-child { margin-bottom: 0; }
.cv-lp-exp-title   { font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; color: #111827; font-size: 0.875rem; }
.cv-lp-exp-date    { font-weight: 400; color: #6b7280; font-size: 0.875rem; }
.cv-lp-exp-company { font-size: 0.855rem; font-weight: 700; color: #374151; margin-bottom: 0.3rem; }
.cv-lp-exp-dateline{ font-size: 0.8rem; color: #6b7280; margin-bottom: 0.15rem; font-style: italic; }
.cv-lp-bullets { list-style: none; padding: 0; margin: 0.25rem 0 0; }
.cv-lp-bullets li  { display: flex; gap: 0.35rem; align-items: flex-start; font-size: 0.845rem; color: #374151; padding: 0.04rem 0; }
.cv-lp-bullets li .cv-lp-bullet { margin-top: 0.05rem; }

/* ── Education ────────────────────────────────────────────────── */
.cv-lp-edu { margin-bottom: 0.85rem; }
.cv-lp-edu:last-child { margin-bottom: 0; }

/* ═══════════════════════════════════════════════════════════════════
   THEMES — CLASSIC SERIF LAYOUT  (cls-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens ─────────────────────────────────────────────── */
.theme-cls-serif   { --cls-bg:#fff;    --cls-nm:#111827; --cls-acc:#1d4ed8; --cls-ln:#9ca3af; --cls-ttl:#111827; --cls-co:#374151; }
.theme-cls-ivory   { --cls-bg:#fdf6e3; --cls-nm:#1f1708; --cls-acc:#92400e; --cls-ln:#c4a87a; --cls-ttl:#78350f; --cls-co:#44331a; }
.theme-cls-sage    { --cls-bg:#f7faf7; --cls-nm:#1a3d2b; --cls-acc:#065f46; --cls-ln:#6daa7a; --cls-ttl:#065f46; --cls-co:#374151; }
.theme-cls-steel   { --cls-bg:#f7f9fc; --cls-nm:#1e293b; --cls-acc:#1e40af; --cls-ln:#4a6fa5; --cls-ttl:#1e293b; --cls-co:#374151; }
.theme-cls-crimson { --cls-bg:#fff;    --cls-nm:#3d0f0f; --cls-acc:#9d174d; --cls-ln:#c07090; --cls-ttl:#7f1d1d; --cls-co:#374151; }

/* ── Paper ────────────────────────────────────────────────────── */
.cv-cls-paper {
  background: var(--cls-bg);
  color: #111827;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 2.5rem;
}

/* ── Header (centered) ────────────────────────────────────────── */
.cv-cls-header { text-align: center; margin-bottom: 1.25rem; }
.cv-cls-name {
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--cls-nm);
  letter-spacing: 0.03em;
  font-family: Georgia, serif;
  margin-bottom: 0.5rem;
}
.cv-cls-contact { font-size: 0.875rem; color: #4b5563; line-height: 1.8; }
.cv-cls-link    { color: var(--cls-acc); text-decoration: underline; font-weight: 700; }

/* ── Dashed divider ───────────────────────────────────────────── */
.cv-cls-divider {
  border: none;
  border-top: 1.5px dashed var(--cls-ln);
  margin: 0.75rem 0 1.25rem;
}

/* ── Sections ─────────────────────────────────────────────────── */
.cv-cls-section { margin-bottom: 1.25rem; }
.cv-cls-section-title {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--cls-ttl);
  margin-bottom: 0.4rem;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.cv-cls-indent    { padding-left: 2rem; }
.cv-cls-body-text { font-size: 0.875rem; color: var(--cls-co); line-height: 1.65; }

/* ── Skills grid ──────────────────────────────────────────────── */
.cv-cls-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.15rem 2rem;
}
.cv-cls-skill { font-size: 0.875rem; color: var(--cls-co); }

/* ── Experience entries ───────────────────────────────────────── */
.cv-cls-exp { margin-bottom: 0.9rem; }
.cv-cls-exp:last-child { margin-bottom: 0; }

.cv-cls-exp-header  { font-size: 0.875rem; font-weight: 700; color: #111827; margin-bottom: 0.05rem; font-family: 'Segoe UI', Arial, sans-serif; }
.cv-cls-exp-title   { font-weight: 800; text-transform: uppercase; }
.cv-cls-exp-sep     { font-weight: 400; color: #6b7280; }
.cv-cls-exp-company { font-weight: 700; font-size: 0.875rem; color: var(--cls-ttl); margin-bottom: 0.25rem; font-family: 'Segoe UI', Arial, sans-serif; }

.cv-cls-bullets { list-style: none; padding: 0; padding-left: 0.75rem; margin: 0.1rem 0; }
.cv-cls-bullets li {
  font-size: 0.875rem;
  color: var(--cls-co);
  padding: 0.07rem 0;
  display: flex;
  gap: 0.4rem;
  align-items: flex-start;
}
.cv-cls-bullets li::before { content: '•'; flex-shrink: 0; color: var(--cls-ttl); margin-top: 0.08rem; }

/* ═══════════════════════════════════════════════════════════════════
   THEMES — BAR / WORKBOOK LAYOUT  (wb-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens ─────────────────────────────────────────────── */
.theme-wb-blue  { --wb-bar: #c5d8e8; --wb-line: #8faec8; --wb-link: #1d4ed8; --wb-acc: #1e3a5f; }
.theme-wb-green { --wb-bar: #c5ddc5; --wb-line: #7aaa7a; --wb-link: #065f46; --wb-acc: #065f46; }
.theme-wb-warm  { --wb-bar: #e8dcc8; --wb-line: #c4a87a; --wb-link: #92400e; --wb-acc: #78350f; }
.theme-wb-slate { --wb-bar: #d1d8e0; --wb-line: #7a8898; --wb-link: #334155; --wb-acc: #1e293b; }
.theme-wb-rose   { --wb-bar: #e8c5d4; --wb-line: #c07090; --wb-link: #9d174d; --wb-acc: #881337; }
.theme-wb-purple { --wb-bar: #ddd0ee; --wb-line: #9b72cf; --wb-link: #6d28d9; --wb-acc: #5b21b6; }
.theme-wb-navy   { --wb-bar: #c8d4e4; --wb-line: #1e3a5f; --wb-link: #1e3a5f; --wb-acc: #1e3a5f; }

/* ── Paper ────────────────────────────────────────────────────── */
.cv-wb-paper {
  background: #fff;
  color: #111827;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* ── Contact bar ──────────────────────────────────────────────── */
.cv-wb-contact-bar {
  background: var(--wb-bar);
  padding: 0.6rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: #1f2937;
  flex-wrap: wrap;
}
.cv-wb-sep  { color: #6b7280; }
.cv-wb-link { color: var(--wb-link); text-decoration: underline; font-weight: 600; }

/* ── Name row ─────────────────────────────────────────────────── */
.cv-wb-name-row {
  display: flex;
  padding: 1rem 1.5rem 0.75rem;
  align-items: flex-end;
}
.cv-wb-name-label-col {
  width: 140px;
  min-width: 140px;
  flex-shrink: 0;
}
.cv-wb-name-content { flex: 1; }
.cv-wb-name {
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #111827;
  line-height: 1.1;
}
.cv-wb-subtitle { font-size: 0.85rem; color: #6b7280; margin-top: 0.2rem; letter-spacing: 0.04em; }

/* ── Sections ─────────────────────────────────────────────────── */
.cv-wb-section {
  display: flex;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  border-top: 2px solid var(--wb-line);
  align-items: flex-start;
}
.cv-wb-section:last-child { border-bottom: 2px solid var(--wb-line); }

.cv-wb-label {
  width: 140px;
  min-width: 140px;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #111827;
  padding-top: 0.1rem;
  line-height: 1.4;
}
.cv-wb-content { flex: 1; min-width: 0; }
.cv-wb-body-text { font-size: 0.875rem; color: #374151; line-height: 1.6; }

/* ── Skills grid ──────────────────────────────────────────────── */
.cv-wb-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.1rem 1.5rem;
}
.cv-wb-skill { font-size: 0.875rem; color: #374151; }

/* ── Experience entries ───────────────────────────────────────── */
.cv-wb-exp { margin-bottom: 1.1rem; }
.cv-wb-exp:last-child { margin-bottom: 0; }

.cv-wb-exp-header { font-size: 0.875rem; margin-bottom: 0.05rem; }
.cv-wb-exp-title  { font-weight: 800; text-transform: uppercase; color: #111827; font-size: 0.875rem; }
.cv-wb-exp-date   { font-weight: 400; color: #374151; font-size: 0.875rem; }
.cv-wb-exp-company { font-weight: 700; font-size: 0.875rem; color: var(--wb-acc); margin-bottom: 0.3rem; }

.cv-wb-bullets { list-style: none; padding: 0; margin: 0; }
.cv-wb-bullets li {
  font-size: 0.855rem;
  color: #374151;
  padding: 0.08rem 0;
  display: flex;
  gap: 0.35rem;
  align-items: flex-start;
}
.cv-wb-bullets li::before { content: '•'; color: var(--wb-acc); flex-shrink: 0; margin-top: 0.08rem; }

/* ═══════════════════════════════════════════════════════════════════
   THEMES — SIDEBAR SPLIT LAYOUT  (sl-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens per theme ───────────────────────────────────── */
.theme-sl-ocean    { --sl-hbg: #3a4f5a; --sl-sbg: #607080; --sl-acc: #3a4f5a; --sl-stxt: #e8edf0; --sl-slink: #c8d8e4; }
.theme-sl-navy     { --sl-hbg: #1e3a5f; --sl-sbg: #2d5282; --sl-acc: #1e3a5f; --sl-stxt: #dbeafe; --sl-slink: #93c5fd; }
.theme-sl-forest   { --sl-hbg: #1a3d2b; --sl-sbg: #2d6a4f; --sl-acc: #065f46; --sl-stxt: #d1fae5; --sl-slink: #6ee7b7; }
.theme-sl-charcoal { --sl-hbg: #1c1c2e; --sl-sbg: #2d2d44; --sl-acc: #6366f1; --sl-stxt: #e0e0ff; --sl-slink: #a5b4fc; }
.theme-sl-burgundy { --sl-hbg: #5c1010; --sl-sbg: #7f1d1d; --sl-acc: #9d174d; --sl-stxt: #ffe4e6; --sl-slink: #fda4af; }
.theme-sl-plum     { --sl-hbg: #4c1d95; --sl-sbg: #6d28d9; --sl-acc: #8b5cf6; --sl-stxt: #ede9fe; --sl-slink: #c4b5fd; }
.theme-sl-teal     { --sl-hbg: #134e4a; --sl-sbg: #0f766e; --sl-acc: #0d9488; --sl-stxt: #ccfbf1; --sl-slink: #5eead4; }

/* ── Paper base ───────────────────────────────────────────────── */
.cv-split-paper {
  background: #fff;
  color: #111827;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* ── Header ───────────────────────────────────────────────────── */
.cv-split-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: var(--sl-hbg);
  min-height: 6.5rem;
}
.cv-split-logo { flex-shrink: 0; width: 5rem; display: flex; align-items: center; justify-content: center; }
.cv-split-header-info { flex: 1; }
.cv-split-header-name {
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.1;
}
.cv-split-header-title {
  color: rgba(255,255,255,0.65);
  font-size: 0.8rem;
  margin-top: 0.3rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Body two-column ──────────────────────────────────────────── */
.cv-split-body { display: flex; min-height: 500px; }

/* ── Left sidebar ─────────────────────────────────────────────── */
.cv-split-left {
  width: 33%;
  flex-shrink: 0;
  background: var(--sl-sbg);
  padding: 1.5rem 1.25rem;
}
.cv-split-right {
  flex: 1;
  background: #ffffff;
  padding: 1.5rem 1.75rem;
}

/* ── Section blocks ───────────────────────────────────────────── */
.cv-split-section { margin-bottom: 1.4rem; }
.cv-split-section:last-child { margin-bottom: 0; }

.cv-split-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-bottom: 0.2rem;
  display: block;
}
.cv-split-left .cv-split-section-title {
  color: var(--sl-stxt);
  border-bottom: 1px solid rgba(255,255,255,0.2);
}
.cv-split-right .cv-split-section-title {
  color: var(--sl-acc);
  border-bottom: 2px solid var(--sl-acc);
  display: inline-block;
  margin-bottom: 0.75rem;
}

/* ── Contact items ────────────────────────────────────────────── */
.cv-split-contact-item {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: var(--sl-stxt);
  align-items: flex-start;
  flex-wrap: wrap;
}
.cv-split-contact-label { font-weight: 700; flex-shrink: 0; }
.cv-split-link { color: var(--sl-slink); text-decoration: underline; }

/* ── Skills ───────────────────────────────────────────────────── */
.cv-split-skill {
  font-size: 0.84rem;
  padding: 0.12rem 0;
  color: var(--sl-stxt);
}
.cv-split-skill::before { content: '• '; }

/* ── Languages ────────────────────────────────────────────────── */
.cv-split-lang { font-size: 0.84rem; color: var(--sl-stxt); }
.cv-split-lang-level { font-size: 0.78rem; color: rgba(255,255,255,0.55); padding-left: 0.5rem; margin-bottom: 0.25rem; }

/* ── Left awards/hobbies ──────────────────────────────────────── */
.cv-split-award { margin-bottom: 0.4rem; color: var(--sl-stxt); }

/* ── Right panel content ──────────────────────────────────────── */
.cv-split-body-text { font-size: 0.875rem; color: #374151; line-height: 1.6; }

.cv-split-exp { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
.cv-split-exp:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.cv-split-exp-header { font-size: 0.875rem; margin-bottom: 0.1rem; }
.cv-split-exp-title  { font-weight: 700; color: #111827; }
.cv-split-exp-date   { font-size: 0.8rem; color: #6b7280; }
.cv-split-exp-company { font-weight: 700; font-size: 0.85rem; color: var(--sl-acc); margin-bottom: 0.35rem; }

.cv-split-bullets { margin-top: 0.25rem; list-style: none; padding: 0; }
.cv-split-bullets li {
  font-size: 0.855rem;
  color: #374151;
  padding: 0.1rem 0;
  display: flex;
  gap: 0.4rem;
  align-items: flex-start;
}
.cv-split-bullets li::before { content: '•'; color: var(--sl-acc); flex-shrink: 0; margin-top: 0.05rem; }

/* ═══════════════════════════════════════════════════════════════════
   HEADER-BAR LAYOUT  (hb-* themes)
═══════════════════════════════════════════════════════════════════ */

/* ── Color tokens per theme ───────────────────────────────────── */
.theme-hb-blue  { --hb-hbg: #b8cfe0; --hb-acc: #2e6da4; --hb-sbg: #e8f0f7; }
.theme-hb-teal  { --hb-hbg: #a8ccc8; --hb-acc: #1a6860; --hb-sbg: #e8f5f3; }
.theme-hb-sage  { --hb-hbg: #b0ccb0; --hb-acc: #2d6030; --hb-sbg: #ecf4ec; }
.theme-hb-slate { --hb-hbg: #b8c4cc; --hb-acc: #3a4a5a; --hb-sbg: #eceff2; }
.theme-hb-warm    { --hb-hbg: #d4c0a0; --hb-acc: #7a5830; --hb-sbg: #f5f0e8; }
.theme-hb-crimson { --hb-hbg: #d4a8b4; --hb-acc: #9d174d; --hb-sbg: #f5e8ec; }
.theme-hb-navy    { --hb-hbg: #a8b8cc; --hb-acc: #1e3a5f; --hb-sbg: #e8edf5; }
.theme-hb-forest  { --hb-hbg: #a8c4b0; --hb-acc: #14532d; --hb-sbg: #ecf5ec; }

/* ── Paper base ───────────────────────────────────────────────── */
.cv-hb-paper {
  background: #fff;
  color: #111827;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* ── Header ───────────────────────────────────────────────────── */
.cv-hb-header {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 1.25rem 2rem;
  background: var(--hb-hbg);
}

.cv-hb-avatar-wrap {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
}
.cv-hb-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--hb-acc);
}
.cv-hb-dot {
  position: absolute;
  font-size: 0.6rem;
  color: var(--hb-acc);
  line-height: 1;
}
.cv-hb-dot-n { top: -10px; left: 50%; transform: translateX(-50%); }
.cv-hb-dot-e { right: -10px; top: 50%; transform: translateY(-50%); }
.cv-hb-dot-s { bottom: -10px; left: 50%; transform: translateX(-50%); }
.cv-hb-dot-w { left: -10px; top: 50%; transform: translateY(-50%); }

.cv-hb-header-name {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #111827;
  line-height: 1.1;
}

/* ── Contact strip ────────────────────────────────────────────── */
.cv-hb-contact-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 2rem;
  background: var(--hb-sbg);
  font-size: 0.8rem;
  color: #374151;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.cv-hb-clabel { font-weight: 700; color: var(--hb-acc); }
.cv-hb-pipe   { color: #9ca3af; }
.cv-hb-link   { color: var(--hb-acc); text-decoration: underline; }

/* ── Body two-column ──────────────────────────────────────────── */
.cv-hb-body { display: flex; padding: 1.5rem 2rem; }

.cv-hb-left    { flex: 0 0 57%; padding-right: 1.5rem; }
.cv-hb-divider { width: 1px; background: #e5e7eb; flex-shrink: 0; align-self: stretch; }
.cv-hb-right   { flex: 1; padding-left: 1.5rem; }

/* ── Section ──────────────────────────────────────────────────── */
.cv-hb-section              { margin-bottom: 1.25rem; }
.cv-hb-section:last-child   { margin-bottom: 0; }
.cv-hb-section-title {
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 0.5rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #e5e7eb;
}
.cv-hb-body-text { font-size: 0.875rem; color: #374151; line-height: 1.6; }

/* ── Experience ───────────────────────────────────────────────── */
.cv-hb-exp              { margin-bottom: 0.9rem; }
.cv-hb-exp:last-child   { margin-bottom: 0; }
.cv-hb-exp-header       { font-size: 0.875rem; margin-bottom: 0.1rem; }
.cv-hb-exp-company      { font-weight: 700; color: #111827; }
.cv-hb-exp-sep          { color: #9ca3af; }
.cv-hb-exp-title        { font-style: italic; color: #374151; }
.cv-hb-exp-date         { font-size: 0.78rem; color: #6b7280; font-style: italic; margin-bottom: 0.2rem; }

.cv-hb-bullets          { list-style: none; padding: 0; margin: 0; }
.cv-hb-bullets li       { font-size: 0.855rem; color: #374151; padding: 0.08rem 0; display: flex; gap: 0.4rem; align-items: flex-start; }
.cv-hb-bullets li::before { content: '•'; color: var(--hb-acc); flex-shrink: 0; }

/* ── Skills ───────────────────────────────────────────────────── */
.cv-hb-skill          { font-size: 0.84rem; color: #374151; padding: 0.1rem 0; }
.cv-hb-skill::before  { content: '• '; color: var(--hb-acc); }

/* ── Education ────────────────────────────────────────────────── */
.cv-hb-edu              { margin-bottom: 0.75rem; }
.cv-hb-edu:last-child   { margin-bottom: 0; }
.cv-hb-edu-institution  { font-weight: 700; font-size: 0.875rem; color: #111827; }
.cv-hb-edu-meta         { font-size: 0.78rem; color: #6b7280; margin-bottom: 0.1rem; }
.cv-hb-edu-degree       { font-size: 0.84rem; font-style: italic; color: #374151; display: block; }

/* ═══════════════════════════════════════════════════════════════════
   PRINT
═══════════════════════════════════════════════════════════════════ */
@media print {
  /* Preserve all background colors, gradients, and images */
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Clean page */
  html, body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Hide all toolbar / UI chrome */
  .no-print { display: none !important; }

  /* Remove dark page wrapper */
  .min-h-screen {
    min-height: unset !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Remove centering wrapper */
  .flex.justify-center {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }

  /* Document fills full page — no shadow, no rounding */
  #cv-document {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    /* Allow content to flow across pages */
    overflow: visible !important;
  }

  /* All layout papers — remove overflow:hidden so page 2 renders */
  .cv-split-paper,
  .cv-wb-paper,
  .cv-dp-paper,
  .cv-cls-paper,
  .cv-hb-paper {
    overflow: visible !important;
  }

  /* Sections flow naturally across pages — never skip an entire section */
  .cv-section {
    break-inside: auto !important;
    page-break-inside: auto !important;
    overflow: visible !important;
  }

  /* tc-* uses display:flex per section — must explicitly allow breaking */
  [class*="theme-tc-"] .cv-section {
    break-inside: auto !important;
    page-break-inside: auto !important;
    overflow: visible !important;
  }
  [class*="theme-tc-"] .cv-section-body,
  [class*="theme-tc-"] .cv-section-head {
    overflow: visible !important;
  }

  /* Avoid breaking mid-entry (a single job/school/award block) */
  .cv-item,
  .cv-exp-entry,
  .cv-hb-exp-entry,
  .cv-dp-exp-entry,
  .cv-wb-exp-entry,
  .cv-hb-edu,
  .cv-dp-edu          { break-inside: avoid; page-break-inside: avoid; }

  /* Multi-col bodies — allow children to flow to next page */
  .cv-hb-left, .cv-hb-right,
  .cv-dp-left, .cv-dp-right { overflow: visible !important; }

  /* Section title should stay with first entry below it */
  .cv-section-title   { break-after: avoid; page-break-after: avoid; }
  .cv-hb-section-title,
  .cv-dp-section-title { break-after: avoid; page-break-after: avoid; }

  /* Hide all edit controls */
  .cv-add-btn { display: none !important; }
  .cv-input {
    border: none !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    -webkit-appearance: none;
    appearance: none;
  }
  textarea.cv-input { resize: none !important; }

  @page        { size: A4 portrait; margin: 1.2cm 0; }
  @page :first { size: A4 portrait; margin: 0; }
}
</style>
